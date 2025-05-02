import { create } from "zustand"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { ApiCall } from "@/types/api"

interface Automation {
  id: string
  description: string
  pattern: {
    method: string
    endpoint: string
  }[]
  action: {
    method: string
    endpoint: string
  }
}

interface AutomationStore {
  automations: Automation[]
  suggestAutomation: (recentCalls: ApiCall[]) => void
}

export const useAutomationStore = create<AutomationStore>((set, get) => ({
  automations: [],

  suggestAutomation: async (recentCalls: ApiCall[]) => {
    // Avoid making too many API calls
    // Only suggest automations occasionally
    if (Math.random() > 0.3) {
      // 30% chance to run
      return
    }

    try {
      // First check for common patterns without using the API
      const callSignatures = recentCalls.map((c) => `${c.method} ${c.endpoint}`).join(",")

      // Predefined patterns
      const knownPatterns = {
        "GET /api/users,POST /api/users,GET /api/users": {
          description: "After creating a user, automatically fetch the updated user list",
          pattern: [
            { method: "GET", endpoint: "/api/users" },
            { method: "POST", endpoint: "/api/users" },
          ],
          action: { method: "GET", endpoint: "/api/users" },
        },
        "GET /api/products,POST /api/products,GET /api/products": {
          description: "After creating a product, automatically fetch the updated product list",
          pattern: [
            { method: "GET", endpoint: "/api/products" },
            { method: "POST", endpoint: "/api/products" },
          ],
          action: { method: "GET", endpoint: "/api/products" },
        },
      }

      if (knownPatterns[callSignatures]) {
        const { automations } = get()
        const pattern = knownPatterns[callSignatures]

        // Check if we already have this automation
        const exists = automations.some((a) => a.description === pattern.description)

        if (!exists) {
          set({
            automations: [
              ...automations,
              {
                id: Math.random().toString(36).substring(2, 9),
                ...pattern,
              },
            ],
          })
        }
        return
      }

      // Only use the API for unknown patterns
      const { text } = await generateText({
        model: openai("gpt-3.5-turbo"), // Using a less expensive model
        prompt: `
          Based on the following sequence of API calls:
          ${JSON.stringify(recentCalls.map((c) => ({ method: c.method, endpoint: c.endpoint })))}
          
          Determine if this represents a pattern that could be automated.
          If yes, return a JSON object with:
          {
            "shouldAutomate": true,
            "description": "A user-friendly description of the automation",
            "pattern": [array of method/endpoint objects that form the pattern],
            "action": { method and endpoint that should be automated }
          }
          
          If no pattern is detected, return:
          {
            "shouldAutomate": false
          }
          
          Keep your response brief and focused.
        `,
      })

      try {
        const result = JSON.parse(text.trim())
        if (result && result.shouldAutomate) {
          const { automations } = get()

          // Check if we already have this automation
          const exists = automations.some((a) => a.description === result.description)

          if (!exists) {
            set({
              automations: [
                ...automations,
                {
                  id: Math.random().toString(36).substring(2, 9),
                  description: result.description,
                  pattern: result.pattern,
                  action: result.action,
                },
              ],
            })
          }
        }
      } catch (e) {
        console.error("Failed to parse automation suggestion:", e)
      }
    } catch (error) {
      console.error("Error suggesting automation:", error)
    }
  },
}))
