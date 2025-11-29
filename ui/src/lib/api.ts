import { useAuthStore } from '../stores/authStore'

interface FetchOptions extends RequestInit {
  authenticated?: boolean
}

export async function apiCall(
  url: string,
  options: FetchOptions = {}
) {
  const { authenticated = false, ...fetchOptions } = options
  const token = useAuthStore.getState().token

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  }

  if (authenticated && token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  })

  if (!response.ok) {
    if (response.status === 401) {
      useAuthStore.getState().logout()
      throw new Error('Unauthorized')
    }
    throw new Error(`API error: ${response.statusText}`)
  }

  return response.json()
}

export function getAuthHeaders() {
  const token = useAuthStore.getState().token
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}
