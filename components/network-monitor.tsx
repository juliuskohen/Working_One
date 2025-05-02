"use client"

import { useEffect } from "react"
import { useNetworkStore } from "@/store/network-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function NetworkMonitor() {
  const { apiCalls, predictNextCall } = useNetworkStore()

  // In a real implementation, we would use a service worker or browser extension
  // to capture actual network traffic. For this demo, we'll use the simulated calls.
  useEffect(() => {
    // This would be where we'd set up the network monitoring
    // For example, using a service worker to intercept fetch/XHR requests
    // For demo purposes, we're using the simulated API calls from the ApiPanel
  }, [])

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-500"
    if (status >= 300 && status < 400) return "bg-blue-500"
    if (status >= 400 && status < 500) return "bg-yellow-500"
    if (status >= 500) return "bg-red-500"
    return "bg-gray-500"
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Network Monitor</CardTitle>
        <CardDescription>Recent API calls captured by Cell</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {apiCalls.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No API calls captured yet. Click on an API endpoint above to simulate calls.
            </div>
          ) : (
            <div className="space-y-3">
              {apiCalls.map((call, index) => (
                <div key={index} className="border rounded-md p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <Badge
                          className={`mr-2 ${call.method === "GET" ? "bg-blue-500" : call.method === "POST" ? "bg-green-500" : call.method === "PUT" ? "bg-yellow-500" : "bg-red-500"}`}
                        >
                          {call.method}
                        </Badge>
                        <span className="font-medium">{call.endpoint}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(call.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <Badge className={getStatusColor(call.status)}>{call.status}</Badge>
                  </div>
                  <div className="text-xs mt-2">
                    <span className="text-muted-foreground">Duration: </span>
                    <span>{call.duration}ms</span>
                  </div>
                </div>
              ))}

              {predictNextCall && (
                <div className="border border-dashed border-primary rounded-md p-3 bg-primary/5">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2 border-primary text-primary">
                      PREDICTED
                    </Badge>
                    <Badge
                      className={`mr-2 ${predictNextCall.method === "GET" ? "bg-blue-500" : predictNextCall.method === "POST" ? "bg-green-500" : predictNextCall.method === "PUT" ? "bg-yellow-500" : "bg-red-500"}`}
                    >
                      {predictNextCall.method}
                    </Badge>
                    <span className="font-medium">{predictNextCall.endpoint}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Press Tab in the command bar to execute this predicted call
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
