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

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
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
