import { ApiError } from './errors'
import { tokenStorage } from './tokenStorage'

type RequestOptions = RequestInit & { skipAuth?: boolean }

const apiUrl = () => {
  const configured = import.meta.env.VITE_API_URL as string | undefined
  return (configured?.replace(/\/$/, '') || '/api')
}

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { skipAuth, headers, ...init } = options
  const token = tokenStorage.getToken()
  const response = await fetch(`${apiUrl()}${path}`, {
    ...init,
    headers: {
      ...(init.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(!skipAuth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  if (response.status === 401 && !skipAuth) {
    tokenStorage.clear()
    window.dispatchEvent(new CustomEvent('auth:expired'))
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string; code?: string } | null
    throw new ApiError(body?.message || 'Erro ao comunicar com o servidor.', response.status, body?.code)
  }

  if (response.status === 204) return undefined as T
  const contentType = response.headers.get('content-type') || ''
  return contentType.includes('application/json')
    ? response.json() as Promise<T>
    : response.text() as Promise<T>
}

const blob = async (path: string): Promise<Blob> => {
  const token = tokenStorage.getToken()
  const response = await fetch(`${apiUrl()}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!response.ok) throw new ApiError('Nao foi possivel carregar o documento.', response.status)
  return response.blob()
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown, skipAuth = false) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined, skipAuth }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
  blob,
}
