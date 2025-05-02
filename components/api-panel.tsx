"use client"
import { useNetworkStore } from "@/store/network-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ApiPanelProps {
  apis: {
    name: string
    endpoint: string
    method: string
  }[]
}

export default function ApiPanel({ apis }: ApiPanelProps) {
  const { addApiCall } = useNetworkStore()

  const handleApiCall = (api: { name: string; endpoint: string; method: string }) => {
    // Simulate an API call
    const startTime = Date.now()

    setTimeout(
      () => {
        const endTime = Date.now()
        const duration = endTime - startTime

        // Add the API call to our store
        addApiCall({
          method: api.method,
          endpoint: api.endpoint,
          timestamp: new Date().toISOString(),
          duration,
          status: 200,
          request: { method: api.method, url: api.endpoint },
          response: { status: 200, data: { success: true } },
        })
      },
      Math.random() * 500 + 200,
    ) // Random delay between 200-700ms
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-blue-500"
      case "POST":
        return "bg-green-500"
      case "PUT":
        return "bg-yellow-500"
      case "DELETE":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Endpoints</CardTitle>
        <CardDescription>Click on any endpoint to simulate an API call</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {apis.map((api, index) => (
            <Button
              key={index}
              variant="outline"
              className="justify-start h-auto py-3"
              onClick={() => handleApiCall(api)}
            >
              <div className="flex items-center">
                <Badge className={`mr-2 ${getMethodColor(api.method)}`}>{api.method}</Badge>
                <div className="text-left">
                  <div className="font-medium">{api.name}</div>
                  <div className="text-xs text-muted-foreground">{api.endpoint}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
