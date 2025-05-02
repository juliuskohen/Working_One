"use client"

import { useState } from "react"
import CommandBar from "@/components/command-bar"
import ApiPanel from "@/components/api-panel"
import NetworkMonitor from "@/components/network-monitor"
import { useNetworkStore } from "@/store/network-store"

export default function Home() {
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false)
  const { apiCalls, addApiCall } = useNetworkStore()

  // Simulate some dummy API calls for the demo
  const dummyApis = [
    { name: "Get Users", endpoint: "/api/users", method: "GET" },
    { name: "Create User", endpoint: "/api/users", method: "POST" },
    { name: "Update User", endpoint: "/api/users/:id", method: "PUT" },
    { name: "Delete User", endpoint: "/api/users/:id", method: "DELETE" },
    { name: "Get Products", endpoint: "/api/products", method: "GET" },
    { name: "Create Product", endpoint: "/api/products", method: "POST" },
  ]

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 relative">
      <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex">
        <h1 className="text-4xl font-bold mb-8">Cell Demo</h1>
        <p className="text-lg mb-8">AI Command Bar for Your SaaS Product</p>
      </div>

      <div className="w-full max-w-5xl mb-16">
        <ApiPanel apis={dummyApis} />
        <NetworkMonitor />
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
        <CommandBar isOpen={isCommandBarOpen} setIsOpen={setIsCommandBarOpen} apiCalls={apiCalls} />
      </div>
    </main>
  )
}
