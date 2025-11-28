package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/sochoa/sochoa.dev/api/internal/middleware"
	"github.com/sochoa/sochoa.dev/api/internal/model"
	"github.com/sochoa/sochoa.dev/api/internal/view"
)

// ContactHandler handles contact-related HTTP requests
type ContactHandler struct {
	contactRepo *model.ContactRepository
}

// NewContactHandler creates a new contact handler
func NewContactHandler(contactRepo *model.ContactRepository) *ContactHandler {
	return &ContactHandler{
		contactRepo: contactRepo,
	}
}

// SubmitContactRequest represents the request body for submitting a contact form
type SubmitContactRequest struct {
	Email   string `json:"email"`
	Name    string `json:"name"`
	Message string `json:"message"`
	Honeypot string `json:"honeypot,omitempty"` // Anti-spam field - should be empty
}

// SubmitContact handles POST /api/contact (public with optional auth for rate limiting bypass)
func (h *ContactHandler) SubmitContact(w http.ResponseWriter, r *http.Request) {
	var req SubmitContactRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Honeypot check - if filled, reject
	if req.Honeypot != "" {
		// Silently treat as success to not reveal honeypot
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{"id": uuid.New().String()})
		return
	}

	// Rate limit: 5 submissions per day per email
	since := model.GetStartOfDay()
	count, err := h.contactRepo.CountByEmailInTimeWindow(r.Context(), req.Email, since)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to check rate limit")
		return
	}

	if count >= 5 {
		writeJSONError(w, http.StatusTooManyRequests, "rate limit exceeded: 5 submissions per day")
		return
	}

	// Set expiration to 180 days from now
	expiresAt := time.Now().UTC().AddDate(0, 0, 180)

	submission := &model.ContactSubmission{
		Email:     req.Email,
		Name:      req.Name,
		Message:   req.Message,
		Status:    model.ContactStatusReceived,
		ExpiresAt: expiresAt,
	}

	if err := h.contactRepo.Create(r.Context(), submission); err != nil {
		status, message := statusCodeFromError(err)
		writeJSONError(w, status, message)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(view.ToContactSubmissionResponse(submission))
}

// ListContactSubmissions handles GET /api/contact (admin only)
func (h *ContactHandler) ListContactSubmissions(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r)
	if user == nil || !user.IsAdmin() {
		writeJSONError(w, http.StatusForbidden, "admin role required")
		return
	}

	status := r.URL.Query().Get("status")
	limit, offset := parsePagination(r)

	var submissions []model.ContactSubmission
	var err error

	if status != "" {
		submissions, err = h.contactRepo.ListByStatus(r.Context(), model.ContactStatus(status), limit, offset)
	} else {
		submissions, err = h.contactRepo.ListActive(r.Context(), limit, offset)
	}

	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to list submissions")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(view.ToContactSubmissionResponses(submissions))
}

// UpdateContactStatusRequest represents the request body for updating contact status
type UpdateContactStatusRequest struct {
	Status string `json:"status"`
}

// UpdateContactStatus handles PATCH /api/contact/:id (admin only)
func (h *ContactHandler) UpdateContactStatus(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r)
	if user == nil || !user.IsAdmin() {
		writeJSONError(w, http.StatusForbidden, "admin role required")
		return
	}

	idStr := r.PathValue("id")
	if idStr == "" {
		writeJSONError(w, http.StatusBadRequest, "id is required")
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid id format")
		return
	}

	var req UpdateContactStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := h.contactRepo.UpdateStatus(r.Context(), id, model.ContactStatus(req.Status)); err != nil {
		status, message := statusCodeFromError(err)
		writeJSONError(w, status, message)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
