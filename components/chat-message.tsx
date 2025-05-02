import { User, Bot } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  role: "user" | "assistant"
  content: string
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div className={cn("flex gap-3 mb-4", role === "assistant" ? "items-start" : "items-start")}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full w-8 h-8",
          role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>
      <div className="flex-1">
        <div className="font-medium mb-1">{role === "assistant" ? "Cell" : "You"}</div>
        <div className="text-sm">{content}</div>
      </div>
    </div>
  )
}
