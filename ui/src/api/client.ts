/**
 * API Client Wrapper
 *
 * This module provides a wrapper around the generated OpenAPI client
 * with custom Cognito authentication handling.
 *
 * The generated client is created from the Swagger spec at api/docs/swagger.yaml
 * and includes full type-safety for all endpoints, models, and responses.
 */

import { fetchAuthSession } from '@aws-amplify/auth'
import { useAuthStore } from '../stores/authStore'

/**
 * Fetch implementation with Cognito authentication
 * Used by the generated API client to make authenticated requests
 */
export async function authenticatedFetch(
  url: string,
  init?: RequestInit
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Merge existing headers
  if (init?.headers) {
    if (init.headers instanceof Headers) {
      init.headers.forEach((value, key) => {
        headers[key] = value
      })
    } else if (Array.isArray(init.headers)) {
      init.headers.forEach(([key, value]) => {
        headers[key] = value
      })
    } else {
      Object.assign(headers, init.headers as Record<string, string>)
    }
  }

  // Try to get auth token from Cognito session
  try {
    const session = await fetchAuthSession()
    const token = session?.tokens?.accessToken?.toString()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  } catch (error) {
    console.log('Could not get auth token')
    // Continue without token for public endpoints
  }

  // Make the request with authentication headers
  const response = await fetch(url, {
    ...init,
    headers,
  })

  // Handle auth errors
  if (response.status === 401) {
    useAuthStore.getState().logout()
    throw new Error('Unauthorized')
  }

  // Handle other errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = typeof (errorData as Record<string, unknown>).error === 'string'
      ? (errorData as Record<string, unknown>).error
      : `API error: ${response.statusText}`
    throw new Error(errorMessage as string)
  }

  return response
}

/**
 * Helper function to get just the auth headers
 * Useful for endpoints that need special header handling
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const session = await fetchAuthSession()
    const token = session?.tokens?.accessToken?.toString()
    if (!token) return {}
    return { Authorization: `Bearer ${token}` }
  } catch {
    return {}
  }
}
