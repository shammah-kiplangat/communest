// Where the API lives, in resolution order:
//   1. VITE_API_URL — .env.production for deploys, the Vercel dashboard (which
//      overrides that file), or .env.local to point dev at a different backend.
//   2. Dev fallback: same-origin /api, proxied to localhost:3000 by vite.config.ts.
// vite.config.ts fails the production build outright if neither applies, so this
// can never silently ship pointing at the wrong host.
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : '')

if (!API_BASE_URL) {
  throw new Error('VITE_API_URL is not set — production builds require it.')
}

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
