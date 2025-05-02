import { create } from "zustand"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { ApiCall } from "@/types/api"

interface NetworkStore {
  apiCalls: ApiCall[]
  predictNextCall: { method: string; endpoint: string } | null
  addApiCall: (call: ApiCall) => void
}

export const useNetworkStore = create<NetworkStore>((set, get) => ({
  apiCalls: [],
  predictNextCall: null,

  addApiCall: async (call: ApiCall) => {
    // Add the call to our history
    set((state) => ({
      apiCalls: [...state.apiCalls, call],
    }))

    // If we have enough calls, try to predict the next one
    // But only do it occasionally to avoid rate limits
    const { apiCalls } = get()
    if (apiCalls.length >= 3 && apiCalls.length % 2 === 0) {
      // Only predict every other call
      try {
        // Use simple pattern matching for common sequences first
        const last3Calls = apiCalls.slice(-3).map((c) => `${c.method} ${c.endpoint}`)

        // Common patterns that don't require API calls
        const commonPatterns = {
          "GET /api/users,POST /api/users,GET /api/users": { method: "GET", endpoint: "/api/users/:id" },
          "GET /api/products,POST /api/products,GET /api/products": { method: "GET", endpoint: "/api/products/:id" },
          "GET /api/users,GET /api/users/:id,PUT /api/users/:id": { method: "GET", endpoint: "/api/users" },
        }

        const patternKey = last3Calls.join(",")
        if (commonPatterns[patternKey]) {
          set({ predictNextCall: commonPatterns[patternKey] })
          return
        }

        // Only use the API if we don't have a simple pattern match
        // Use a less expensive model and limit the context
        const recentCalls = apiCalls.slice(-3)

        const { text } = await generateText({
          model: openai("gpt-3.5-turbo"), // Using a less expensive model
          prompt: `
          Based on the following sequence of API calls:
          ${JSON.stringify(recentCalls.map((c) => ({ method: c.method, endpoint: c.endpoint })))}
          
          Predict the most likely next API call the user will make.
          Return ONLY a JSON object with 'method' and 'endpoint' properties.
          For example: {"method": "GET", "endpoint": "/api/users"}
        `,
        })

        try {
          const prediction = JSON.parse(text.trim())
          if (prediction && prediction.method && prediction.endpoint) {
            set({ predictNextCall: prediction })
          }
        } catch (e) {
          console.error("Failed to parse prediction:", e)
        }
      } catch (error) {
        console.error("Error predicting next call:", error)
        // Don't update the prediction on error
      }
    }
  },
}))
