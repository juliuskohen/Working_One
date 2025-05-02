"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { ApiCall } from "@/types/api"
import { useNetworkStore } from "@/store/network-store"
import { useAutomationStore } from "@/store/automation-store"
import { Command } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Suggestion } from "@/components/suggestion"
import { ChatMessage } from "@/components/chat-message"

interface CommandBarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  apiCalls: ApiCall[]
}

export default function CommandBar({ isOpen, setIsOpen, apiCalls }: CommandBarProps) {
  const [input, setInput] = useState("")
  const [suggestion, setSuggestion] = useState("")
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [tabValue, setTabValue] = useState("command")
  const inputRef = useRef<HTMLInputElement>(null)
  const { predictNextCall } = useNetworkStore()
  const { suggestAutomation, automations } = useAutomationStore()

  // Focus input when command bar opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Generate suggestions based on input and API history
  useEffect(() => {
    const generateSuggestion = async () => {
      if (!input || input.length < 5) {
        // Increased minimum length to 5
        setSuggestion("")
        return
      }

      // Don't generate a new suggestion if we're already loading
      if (isLoading) return

      try {
        // Use a simpler approach for basic completions to avoid API calls
        // Only use the API for more complex suggestions
        const lastWord = input.split(" ").pop() || ""

        // Simple pattern matching for common commands
        const commonCommands = {
          g: "et users",
          cr: "eate user",
          up: "date user",
          del: "ete user",
          ex: "ecute",
          ru: "n automation",
          he: "lp me with",
          sh: "ow me",
        }

        // Check if we can provide a simple completion without API call
        for (const [prefix, completion] of Object.entries(commonCommands)) {
          if (lastWord.toLowerCase().startsWith(prefix)) {
            setSuggestion(completion)
            return
          }
        }

        // Only use API for more complex inputs
        if (input.length > 10 && apiCalls.length > 0) {
          const recentCalls = apiCalls.slice(-3) // Reduced from 5 to 3
          const prompt = `
            Based on the user's input: "${input}" and recent API calls:
            ${JSON.stringify(recentCalls)}
            
            Complete the user's command in a helpful way. Only return the completion text, not the full command.
            Keep it very brief.
          `

          const { text } = await generateText({
            model: openai("gpt-3.5-turbo"), // Using a less expensive model
            prompt,
          })

          setSuggestion(text)
        }
      } catch (error) {
        console.error("Error generating suggestion:", error)
        // Don't show the error to the user, just clear the suggestion
        setSuggestion("")
      }
    }

    // Increase debounce time to 500ms
    const debounce = setTimeout(generateSuggestion, 500)
    return () => clearTimeout(debounce)
  }, [input, apiCalls, isLoading])

  // Handle Tab key to accept suggestion
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab" && suggestion) {
      e.preventDefault()
      setInput(input + suggestion)
      setSuggestion("")
    } else if (e.key === "Enter" && input) {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  const handleSubmit = async () => {
    if (!input.trim()) return

    setIsLoading(true)
    setMessages((prev) => [...prev, { role: "user", content: input }])

    try {
      // Try to use cached responses for common queries
      const cachedResponses = {
        help: "I'm Cell, your AI assistant. I can help you navigate this SaaS app, execute API calls, and suggest automations.",
        "what can you do": "I can help you execute API calls, suggest next actions, and automate repetitive tasks.",
      }

      const lowerInput = input.toLowerCase()
      if (cachedResponses[lowerInput]) {
        setMessages((prev) => [...prev, { role: "assistant", content: cachedResponses[lowerInput] }])
      } else {
        // Process the command with AI
        const maxRetries = 3
        let retries = 0
        let success = false

        while (retries < maxRetries && !success) {
          try {
            const { text } = await generateText({
              model: openai("gpt-3.5-turbo"), // Using a less expensive model for most interactions
              prompt: `
                You are Cell, an AI assistant for a SaaS product. The user has entered: "${input}"
                
                Recent API calls:
                ${JSON.stringify(apiCalls.slice(-3))}
                
                Available automations:
                ${JSON.stringify(automations)}
                
                Respond helpfully, suggesting relevant API calls or automations if appropriate.
                Keep your response concise.
              `,
            })

            setMessages((prev) => [...prev, { role: "assistant", content: text }])
            success = true
          } catch (error) {
            retries++
            if (retries >= maxRetries) {
              throw error
            }
            // Exponential backoff
            await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retries)))
          }
        }
      }
    } catch (error) {
      console.error("Error processing command:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm currently experiencing high demand. Please try again in a moment.",
        },
      ])
    } finally {
      setIsLoading(false)
      setInput("")
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {!isOpen ? (
        <div
          className="bg-background border rounded-lg shadow-lg p-3 flex items-center cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <Command className="h-5 w-5 mr-2 text-muted-foreground" />
          <span className="text-muted-foreground">Type a command or ask a question...</span>
        </div>
      ) : (
        <div className="bg-background border rounded-lg shadow-lg overflow-hidden">
          <div className="p-3 flex items-center">
            <Command className="h-5 w-5 mr-2 text-primary" />
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or ask a question..."
                className="w-full bg-transparent border-none outline-none"
              />
              {suggestion && (
                <div className="absolute inset-0 flex items-center pointer-events-none">
                  <span className="text-transparent">{input}</span>
                  <span className="text-muted-foreground">{suggestion}</span>
                </div>
              )}
            </div>
            {suggestion && <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Press Tab</div>}
          </div>

          {(messages.length > 0 || predictNextCall) && (
            <div className="border-t">
              <Tabs value={tabValue} onValueChange={setTabValue}>
                <div className="flex justify-between items-center px-3 py-2">
                  <TabsList>
                    <TabsTrigger value="command">Suggestions</TabsTrigger>
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                  </TabsList>
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                    Close
                  </Button>
                </div>

                <TabsContent value="command" className="p-3 max-h-[300px] overflow-y-auto">
                  {predictNextCall && (
                    <Suggestion
                      title="Predicted Next Action"
                      description={`${predictNextCall.method} ${predictNextCall.endpoint}`}
                      onClick={() => {
                        setInput(`Execute ${predictNextCall.method} ${predictNextCall.endpoint}`)
                      }}
                    />
                  )}

                  {automations.map((automation, index) => (
                    <Suggestion
                      key={index}
                      title="Suggested Automation"
                      description={automation.description}
                      onClick={() => {
                        setInput(`Run automation: ${automation.description}`)
                      }}
                    />
                  ))}
                </TabsContent>

                <TabsContent value="chat" className="p-3 max-h-[300px] overflow-y-auto">
                  {messages.map((message, index) => (
                    <ChatMessage key={index} role={message.role} content={message.content} />
                  ))}
                  {isLoading && (
                    <div className="flex items-center text-muted-foreground">
                      <div className="animate-pulse">Thinking...</div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
