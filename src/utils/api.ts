const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://communest-backend.vercel.app/api'

export interface ApiRequestOptions extends RequestInit {
  body?: Record<string, unknown>
}

export async function apiRequest<T = any>(path: string, options: ApiRequestOptions = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }

  const token = typeof window !== 'undefined' ? window.localStorage.getItem('communest_auth_token') : null
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : options.body,
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  if (!response.ok) {
    throw new Error(data?.error || response.statusText || 'API request failed')
  }

  return data as T
}
