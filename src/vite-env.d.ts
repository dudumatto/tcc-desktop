/// <reference types="vite/client" />

interface DesktopApiRequest {
  path: string
  method: string
  body?: string
  token?: string
  responseType?: 'text' | 'binary'
}

interface DesktopApiResponse {
  status: number
  contentType: string
  body: string | Uint8Array
}

interface Window {
  desktop?: {
    platform: string
    version: string
    request: (request: DesktopApiRequest) => Promise<DesktopApiResponse>
  }
}
