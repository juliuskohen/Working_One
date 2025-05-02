export interface ApiCall {
  method: string
  endpoint: string
  timestamp: string
  duration: number
  status: number
  request: {
    method: string
    url: string
    headers?: Record<string, string>
    body?: any
  }
  response: {
    status: number
    headers?: Record<string, string>
    data?: any
  }
}
