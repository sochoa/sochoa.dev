/**
 * API Client Initialization
 *
 * This module initializes and exports the generated API client with authentication.
 *
 * The client is automatically generated from ../api/docs/swagger.yaml
 * Run `npm run api:generate` to regenerate the client after API changes.
 */

import { authenticatedFetch, getAuthHeaders } from './client'

// Export the authenticated fetch and auth helpers for direct use if needed
export { authenticatedFetch, getAuthHeaders }

// Export all generated types and models
export * from './generated/models/index'
export * from './generated/api/index'

/**
 * Initialize the generated API client with our custom fetch implementation
 * This is called when importing the API client module
 */
export function initializeApiClient(config?: { basePath?: string }) {
  const basePath =
    config?.basePath || import.meta.env.VITE_API_URL || 'http://localhost:8080'

  // The generated client will use our authenticatedFetch for all requests
  return {
    basePath,
    headers: {},
    fetch: authenticatedFetch,
  }
}

/**
 * Get the configured base API URL
 */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL || 'http://localhost:8080'
}
