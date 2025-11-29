/**
 * API Client Methods
 * Type-safe functions for all API endpoints
 * Generated manually from /api/docs/swagger.json
 */

import { authenticatedFetch } from '../client'
import * as Models from '../models'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// ============================================================================
// HEALTH CHECK
// ============================================================================

export async function healthCheck(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE}/api/health`)
  if (!response.ok) throw new Error(`Health check failed: ${response.statusText}`)
  return response.json()
}

// ============================================================================
// POSTS API
// ============================================================================

export async function listPosts(): Promise<Models.PostResponse[]> {
  const response = await fetch(`${API_BASE}/api/posts`)
  if (!response.ok) throw new Error(`Failed to list posts: ${response.statusText}`)
  return response.json()
}

export async function createPost(request: Models.CreatePostRequest): Promise<Models.PostResponse> {
  const response = await authenticatedFetch(`${API_BASE}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!response.ok) throw new Error(`Failed to create post: ${response.statusText}`)
  return response.json()
}

export async function getPostBySlug(slug: string): Promise<Models.PostResponse> {
  const response = await fetch(`${API_BASE}/api/posts/${encodeURIComponent(slug)}`)
  if (!response.ok) throw new Error(`Failed to get post: ${response.statusText}`)
  return response.json()
}

export async function updatePost(id: string, request: Models.UpdatePostRequest): Promise<Models.PostResponse> {
  const response = await authenticatedFetch(`${API_BASE}/api/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!response.ok) throw new Error(`Failed to update post: ${response.statusText}`)
  return response.json()
}

export async function deletePost(id: string): Promise<void> {
  const response = await authenticatedFetch(`${API_BASE}/api/posts/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error(`Failed to delete post: ${response.statusText}`)
}

// ============================================================================
// GUESTBOOK API
// ============================================================================

export async function listGuestbookEntries(
  pagination?: Models.PaginationParams
): Promise<Models.GuestbookEntryResponse[]> {
  const params = new URLSearchParams()
  if (pagination?.limit) params.append('limit', pagination.limit.toString())
  if (pagination?.offset) params.append('offset', pagination.offset.toString())

  const url = `${API_BASE}/api/guestbook${params.toString() ? `?${params}` : ''}`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to list guestbook entries: ${response.statusText}`)
  return response.json()
}

export async function submitGuestbookEntry(
  request: Models.SubmitGuestbookEntryRequest
): Promise<Models.GuestbookEntryResponse> {
  const response = await authenticatedFetch(`${API_BASE}/api/guestbook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to submit guestbook entry: ${text}`)
  }
  return response.json()
}

export async function listPendingGuestbookEntries(
  pagination?: Models.PaginationParams
): Promise<Models.GuestbookEntryResponse[]> {
  const params = new URLSearchParams()
  if (pagination?.limit) params.append('limit', pagination.limit.toString())
  if (pagination?.offset) params.append('offset', pagination.offset.toString())

  const url = `${API_BASE}/api/guestbook/pending${params.toString() ? `?${params}` : ''}`
  const response = await authenticatedFetch(url)
  if (!response.ok) throw new Error(`Failed to list pending entries: ${response.statusText}`)
  return response.json()
}

export async function approveGuestbookEntry(
  id: string,
  request: Models.ApproveGuestbookEntryRequest
): Promise<Models.GuestbookEntryResponse> {
  const response = await authenticatedFetch(`${API_BASE}/api/guestbook/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!response.ok) throw new Error(`Failed to approve entry: ${response.statusText}`)
  return response.json()
}

export async function deleteGuestbookEntry(id: string): Promise<void> {
  const response = await authenticatedFetch(`${API_BASE}/api/guestbook/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error(`Failed to delete entry: ${response.statusText}`)
}

// ============================================================================
// CONTACT API
// ============================================================================

export async function submitContact(
  request: Models.SubmitContactRequest
): Promise<Models.ContactSubmissionResponse> {
  const response = await authenticatedFetch(`${API_BASE}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to submit contact: ${text}`)
  }
  return response.json()
}

export async function listContactSubmissions(
  pagination?: Models.PaginationParams & { status?: string }
): Promise<Models.ContactSubmissionResponse[]> {
  const params = new URLSearchParams()
  if (pagination?.limit) params.append('limit', pagination.limit.toString())
  if (pagination?.offset) params.append('offset', pagination.offset.toString())
  if (pagination?.status) params.append('status', pagination.status)

  const url = `${API_BASE}/api/contact${params.toString() ? `?${params}` : ''}`
  const response = await authenticatedFetch(url)
  if (!response.ok) throw new Error(`Failed to list submissions: ${response.statusText}`)
  return response.json()
}

export async function updateContactSubmissionStatus(
  id: string,
  request: Models.UpdateContactStatusRequest
): Promise<void> {
  const response = await authenticatedFetch(`${API_BASE}/api/contact/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!response.ok) throw new Error(`Failed to update submission: ${response.statusText}`)
}

// ============================================================================
// STATS API
// ============================================================================

export async function recordStats(request: Models.RecordStatsRequest): Promise<Models.VisitorStatResponse> {
  const response = await authenticatedFetch(`${API_BASE}/api/stats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!response.ok) throw new Error(`Failed to record stats: ${response.statusText}`)
  return response.json()
}

export async function listStats(
  pagination?: Models.PaginationParams
): Promise<Models.VisitorStatResponse[]> {
  const params = new URLSearchParams()
  if (pagination?.limit) params.append('limit', pagination.limit.toString())
  if (pagination?.offset) params.append('offset', pagination.offset.toString())

  const url = `${API_BASE}/api/stats${params.toString() ? `?${params}` : ''}`
  const response = await authenticatedFetch(url)
  if (!response.ok) throw new Error(`Failed to list stats: ${response.statusText}`)
  return response.json()
}

export async function getStatById(id: string): Promise<Models.VisitorStatResponse> {
  const response = await authenticatedFetch(`${API_BASE}/api/stats/${id}`)
  if (!response.ok) throw new Error(`Failed to get stat: ${response.statusText}`)
  return response.json()
}

export async function listStatsByPage(
  pagePath: string,
  pagination?: Models.PaginationParams
): Promise<Models.VisitorStatResponse[]> {
  const params = new URLSearchParams()
  if (pagination?.limit) params.append('limit', pagination.limit.toString())
  if (pagination?.offset) params.append('offset', pagination.offset.toString())

  const url = `${API_BASE}/api/stats/page/${encodeURIComponent(pagePath)}${
    params.toString() ? `?${params}` : ''
  }`
  const response = await authenticatedFetch(url)
  if (!response.ok) throw new Error(`Failed to list page stats: ${response.statusText}`)
  return response.json()
}

export async function updateStats(id: string, request: Models.UpdateStatsRequest): Promise<Models.VisitorStatResponse> {
  const response = await authenticatedFetch(`${API_BASE}/api/stats/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!response.ok) throw new Error(`Failed to update stats: ${response.statusText}`)
  return response.json()
}
