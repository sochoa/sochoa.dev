/**
 * Auto-generated API models from Swagger specification
 * Generated manually from /api/docs/swagger.json
 */

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface SubmitContactRequest {
  name?: string
  email?: string
  message?: string
  honeypot?: string
}

export interface UpdateContactStatusRequest {
  status: string
}

export interface SubmitGuestbookEntryRequest {
  display_name?: string
  message?: string
  honeypot?: string
}

export interface ApproveGuestbookEntryRequest {
  approve: boolean
}

export interface CreatePostRequest {
  slug: string
  title: string
  body: string
  status: string
  summary?: string
  tags?: string[]
}

export interface UpdatePostRequest {
  slug: string
  title: string
  body: string
  status: string
  summary?: string
  tags?: string[]
}

export interface RecordStatsRequest {
  page_path: string
  date: string
  pageviews?: number
  unique_visitors?: number
  referrer_domain?: string
  country?: string
  latency_p50?: number
  latency_p95?: number
  latency_p99?: number
  errors_4xx?: number
  errors_5xx?: number
}

export interface UpdateStatsRequest {
  pageviews?: number
  unique_visitors?: number
  latency_p50?: number
  latency_p95?: number
  latency_p99?: number
  errors_4xx?: number
  errors_5xx?: number
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface ContactSubmissionResponse {
  id: string
  name?: string
  email?: string
  message?: string
  status: string
  created_at: string
  expires_at?: string
}

export interface GuestbookEntryResponse {
  id: string
  display_name?: string
  message?: string
  is_approved: boolean
  user_id?: string
  user_provider?: string
  created_at: string
}

export interface PostResponse {
  id: string
  slug: string
  title: string
  body: string
  summary?: string
  tags?: string[]
  status: string
  created_at: string
  updated_at?: string
  published_at?: string
}

export interface VisitorStatResponse {
  id: string
  page_path: string
  date: string
  pageviews: number
  unique_visitors: number
  referrer_domain?: string
  country?: string
  latency_p50?: number
  latency_p95?: number
  latency_p99?: number
  errors_4xx: number
  errors_5xx: number
  created_at: string
  updated_at?: string
}

// ============================================================================
// OTHER TYPES
// ============================================================================

export interface ApiErrorResponse {
  error?: string
  [key: string]: string | undefined
}

export interface PaginationParams {
  limit?: number
  offset?: number
}
