package handler

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/sochoa/sochoa.dev/api/internal/middleware"
	"github.com/sochoa/sochoa.dev/api/internal/model"
	"github.com/sochoa/sochoa.dev/api/internal/view"
)

// GuestbookHandler handles guestbook-related HTTP requests
type GuestbookHandler struct {
	guestbookRepo *model.GuestbookRepository
}

// NewGuestbookHandler creates a new guestbook handler
func NewGuestbookHandler(guestbookRepo *model.GuestbookRepository) *GuestbookHandler {
	return &GuestbookHandler{
		guestbookRepo: guestbookRepo,
	}
}

// SubmitGuestbookEntryRequest represents the request body for submitting a guestbook entry
type SubmitGuestbookEntryRequest struct {
	DisplayName string `json:"display_name"`
	Message     string `json:"message"`
	Honeypot    string `json:"honeypot,omitempty"` // Anti-spam field - should be empty
}

// SubmitGuestbookEntry handles POST /api/guestbook (authenticated users)
func (h *GuestbookHandler) SubmitGuestbookEntry(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r)
	if user == nil {
		writeJSONError(w, http.StatusUnauthorized, "authentication required")
		return
	}

	// Honeypot check - if filled, reject
	var req SubmitGuestbookEntryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Honeypot != "" {
		// Silently treat as success to not reveal honeypot
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{"id": uuid.New().String()})
		return
	}

	// Check rate limit: 3 entries per day per user
	since := model.GetStartOfDay()
	count, err := h.guestbookRepo.CountByUserInTimeWindow(r.Context(), "cognito", user.ID, since)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to check rate limit")
		return
	}

	if count >= 3 {
		writeJSONError(w, http.StatusTooManyRequests, "rate limit exceeded: 3 entries per day")
		return
	}

	entry := &model.GuestbookEntry{
		UserProvider: "cognito",
		UserID:       user.ID,
		DisplayName:  req.DisplayName,
		Message:      req.Message,
		IsApproved:   false, // Requires admin approval by default
	}

	if err := h.guestbookRepo.Create(r.Context(), entry); err != nil {
		status, message := statusCodeFromError(err)
		writeJSONError(w, status, message)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(view.ToGuestbookEntryResponse(entry))
}

// ListApprovedGuestbookEntries handles GET /api/guestbook (public)
func (h *GuestbookHandler) ListApprovedGuestbookEntries(w http.ResponseWriter, r *http.Request) {
	limit, offset := parsePagination(r)

	entries, err := h.guestbookRepo.ListApproved(r.Context(), limit, offset)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to list guestbook entries")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(view.ToGuestbookEntryResponses(entries))
}

// ListPendingGuestbookEntries handles GET /api/guestbook/pending (admin only)
func (h *GuestbookHandler) ListPendingGuestbookEntries(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r)
	if user == nil || !user.IsAdmin() {
		writeJSONError(w, http.StatusForbidden, "admin role required")
		return
	}

	limit, offset := parsePagination(r)

	entries, err := h.guestbookRepo.ListPending(r.Context(), limit, offset)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to list pending entries")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(view.ToGuestbookEntryResponses(entries))
}

// ApproveGuestbookEntryRequest represents the request body for approving an entry
type ApproveGuestbookEntryRequest struct {
	Approve bool `json:"approve"`
}

// ApproveGuestbookEntry handles POST /api/guestbook/:id/approve (admin only)
func (h *GuestbookHandler) ApproveGuestbookEntry(w http.ResponseWriter, r *http.Request) {
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

	var req ApproveGuestbookEntryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Approve {
		if err := h.guestbookRepo.Approve(r.Context(), id); err != nil {
			status, message := statusCodeFromError(err)
			writeJSONError(w, status, message)
			return
		}
	} else {
		if err := h.guestbookRepo.Delete(r.Context(), id); err != nil {
			status, message := statusCodeFromError(err)
			writeJSONError(w, status, message)
			return
		}
	}

	w.WriteHeader(http.StatusNoContent)
}

// DeleteGuestbookEntry handles DELETE /api/guestbook/:id (admin only)
func (h *GuestbookHandler) DeleteGuestbookEntry(w http.ResponseWriter, r *http.Request) {
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

	if err := h.guestbookRepo.Delete(r.Context(), id); err != nil {
		status, message := statusCodeFromError(err)
		writeJSONError(w, status, message)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
