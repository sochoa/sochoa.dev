/**
 * API Client
 *
 * This module exports the API client with type-safe methods for all endpoints.
 * The types are generated from /api/docs/swagger.yaml
 */

import { authenticatedFetch, getAuthHeaders } from './client'

// Export the authenticated fetch and auth helpers
export { authenticatedFetch, getAuthHeaders }

// Export all generated types
export * from './models'

// Export all generated API methods
export * from './generated'

/**
 * Get the configured base API URL
 */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL || 'http://localhost:8080'
}
