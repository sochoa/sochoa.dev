package view

import (
	"time"

	"github.com/google/uuid"
	"github.com/sochoa/sochoa.dev/api/internal/model"
)

// PostResponse represents a post in JSON format
type PostResponse struct {
	ID          uuid.UUID `json:"id"`
	Slug        string    `json:"slug"`
	Title       string    `json:"title"`
	Summary     string    `json:"summary"`
	Body        string    `json:"body"`
	Tags        []string  `json:"tags"`
	Status      string    `json:"status"`
	PublishedAt *time.Time `json:"published_at,omitempty"`
	UpdatedAt   time.Time `json:"updated_at"`
	CreatedAt   time.Time `json:"created_at"`
}

// ToPostResponse converts a Post model to a JSON response
func ToPostResponse(p *model.Post) *PostResponse {
	tags := p.Tags
	if tags == nil {
		tags = []string{}
	}
	return &PostResponse{
		ID:          p.ID,
		Slug:        p.Slug,
		Title:       p.Title,
		Summary:     p.Summary,
		Body:        p.Body,
		Tags:        tags,
		Status:      string(p.Status),
		PublishedAt: p.PublishedAt,
		UpdatedAt:   p.UpdatedAt,
		CreatedAt:   p.CreatedAt,
	}
}

// ToPostResponses converts multiple Post models to JSON responses
func ToPostResponses(posts []model.Post) []PostResponse {
	responses := make([]PostResponse, len(posts))
	for i, p := range posts {
		responses[i] = *ToPostResponse(&p)
	}
	return responses
}

// GuestbookEntryResponse represents a guestbook entry in JSON format
type GuestbookEntryResponse struct {
	ID           uuid.UUID `json:"id"`
	UserProvider string    `json:"user_provider"`
	UserID       string    `json:"user_id"`
	DisplayName  string    `json:"display_name"`
	Message      string    `json:"message"`
	IsApproved   bool      `json:"is_approved"`
	CreatedAt    time.Time `json:"created_at"`
}

// ToGuestbookEntryResponse converts a GuestbookEntry model to a JSON response
func ToGuestbookEntryResponse(g *model.GuestbookEntry) *GuestbookEntryResponse {
	return &GuestbookEntryResponse{
		ID:           g.ID,
		UserProvider: g.UserProvider,
		UserID:       g.UserID,
		DisplayName:  g.DisplayName,
		Message:      g.Message,
		IsApproved:   g.IsApproved,
		CreatedAt:    g.CreatedAt,
	}
}

// ToGuestbookEntryResponses converts multiple GuestbookEntry models to JSON responses
func ToGuestbookEntryResponses(entries []model.GuestbookEntry) []GuestbookEntryResponse {
	responses := make([]GuestbookEntryResponse, len(entries))
	for i, e := range entries {
		responses[i] = *ToGuestbookEntryResponse(&e)
	}
	return responses
}

// ContactSubmissionResponse represents a contact submission in JSON format
type ContactSubmissionResponse struct {
	ID        uuid.UUID `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	Message   string    `json:"message"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	ExpiresAt time.Time `json:"expires_at"`
}

// ToContactSubmissionResponse converts a ContactSubmission model to a JSON response
func ToContactSubmissionResponse(c *model.ContactSubmission) *ContactSubmissionResponse {
	return &ContactSubmissionResponse{
		ID:        c.ID,
		Email:     c.Email,
		Name:      c.Name,
		Message:   c.Message,
		Status:    string(c.Status),
		CreatedAt: c.CreatedAt,
		ExpiresAt: c.ExpiresAt,
	}
}

// ToContactSubmissionResponses converts multiple ContactSubmission models to JSON responses
func ToContactSubmissionResponses(submissions []model.ContactSubmission) []ContactSubmissionResponse {
	responses := make([]ContactSubmissionResponse, len(submissions))
	for i, s := range submissions {
		responses[i] = *ToContactSubmissionResponse(&s)
	}
	return responses
}

// VisitorStatResponse represents visitor statistics in JSON format
type VisitorStatResponse struct {
	ID             uuid.UUID  `json:"id"`
	Date           time.Time  `json:"date"`
	PagePath       string     `json:"page_path"`
	Country        *string    `json:"country,omitempty"`
	ReferrerDomain *string    `json:"referrer_domain,omitempty"`
	Pageviews      int        `json:"pageviews"`
	UniqueVisitors int        `json:"unique_visitors"`
	LatencyP50     *float64   `json:"latency_p50,omitempty"`
	LatencyP95     *float64   `json:"latency_p95,omitempty"`
	LatencyP99     *float64   `json:"latency_p99,omitempty"`
	Errors4xx      int        `json:"errors_4xx"`
	Errors5xx      int        `json:"errors_5xx"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

// ToVisitorStatResponse converts a VisitorStat model to a JSON response
func ToVisitorStatResponse(s *model.VisitorStat) *VisitorStatResponse {
	return &VisitorStatResponse{
		ID:             s.ID,
		Date:           s.Date,
		PagePath:       s.PagePath,
		Country:        s.Country,
		ReferrerDomain: s.ReferrerDomain,
		Pageviews:      s.Pageviews,
		UniqueVisitors: s.UniqueVisitors,
		LatencyP50:     s.LatencyP50,
		LatencyP95:     s.LatencyP95,
		LatencyP99:     s.LatencyP99,
		Errors4xx:      s.Errors4xx,
		Errors5xx:      s.Errors5xx,
		CreatedAt:      s.CreatedAt,
		UpdatedAt:      s.UpdatedAt,
	}
}

// ToVisitorStatResponses converts multiple VisitorStat models to JSON responses
func ToVisitorStatResponses(stats []model.VisitorStat) []VisitorStatResponse {
	responses := make([]VisitorStatResponse, len(stats))
	for i, s := range stats {
		responses[i] = *ToVisitorStatResponse(&s)
	}
	return responses
}

// ErrorResponse represents an error in JSON format
type ErrorResponse struct {
	Error string `json:"error"`
}

// ListResponse represents a paginated list response
type ListResponse struct {
	Data       interface{} `json:"data"`
	Total      int         `json:"total"`
	Limit      int         `json:"limit"`
	Offset     int         `json:"offset"`
}

// HealthResponse represents the health check response
type HealthResponse struct {
	Status string `json:"status"`
	Time   time.Time `json:"time"`
}
