import { fetchAuthSession } from '@aws-amplify/auth'
import { useAuthStore } from '../stores/authStore'

interface FetchOptions extends RequestInit {
  authenticated?: boolean
}

export async function apiCall(
  url: string,
  options: FetchOptions = {}
) {
  const { authenticated = false, ...fetchOptions } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Merge existing headers
  if (fetchOptions.headers) {
    if (fetchOptions.headers instanceof Headers) {
      fetchOptions.headers.forEach((value, key) => {
        headers[key] = value
      })
    } else if (Array.isArray(fetchOptions.headers)) {
      fetchOptions.headers.forEach(([key, value]) => {
        headers[key] = value
      })
    } else {
      Object.assign(headers, fetchOptions.headers as Record<string, string>)
    }
  }

  if (authenticated) {
    try {
      const session = await fetchAuthSession()
      const token = session?.tokens?.accessToken?.toString()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    } catch (error) {
      console.log('Could not get auth token')
      useAuthStore.getState().logout()
      throw new Error('Unauthorized')
    }
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
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.error || `API error: ${response.statusText}`
    )
  }

  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function getAuthHeaders() {
  try {
    const session = await fetchAuthSession()
    const token = session?.tokens?.accessToken?.toString()
    if (!token) return {}
    return { Authorization: `Bearer ${token}` }
  } catch {
    return {}
  }
}
