"use client"

import { ArrowRight } from "lucide-react"

interface SuggestionProps {
  title: string
  description: string
  onClick: () => void
}

export function Suggestion({ title, description, onClick }: SuggestionProps) {
  return (
    <div
      className="flex items-center justify-between p-3 rounded-md hover:bg-muted cursor-pointer mb-2"
      onClick={onClick}
    >
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </div>
  )
}
