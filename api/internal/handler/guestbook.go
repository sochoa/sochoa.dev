package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sochoa/sochoa.dev/api/internal/auth"
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
func (h *GuestbookHandler) SubmitGuestbookEntry(c *gin.Context) {
	user := c.MustGet("user").(*auth.User)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "authentication required"})
		return
	}

	var req SubmitGuestbookEntryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	if req.Honeypot != "" {
		// Silently treat as success to not reveal honeypot
		c.JSON(http.StatusCreated, gin.H{"id": uuid.New().String()})
		return
	}

	// Check rate limit: 3 entries per day per user
	since := model.GetStartOfDay()
	count, err := h.guestbookRepo.CountByUserInTimeWindow(c, "cognito", user.ID, since)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check rate limit"})
		return
	}

	if count >= 3 {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "rate limit exceeded: 3 entries per day"})
		return
	}

	entry := &model.GuestbookEntry{
		UserProvider: "cognito",
		UserID:       user.ID,
		DisplayName:  req.DisplayName,
		Message:      req.Message,
		IsApproved:   false, // Requires admin approval by default
	}

	if err := h.guestbookRepo.Create(c, entry); err != nil {
		status, message := statusCodeFromError(err)
		c.JSON(status, gin.H{"error": message})
		return
	}

	c.JSON(http.StatusCreated, view.ToGuestbookEntryResponse(entry))
}

// ListApprovedGuestbookEntries handles GET /api/guestbook (public)
func (h *GuestbookHandler) ListApprovedGuestbookEntries(c *gin.Context) {
	limit, offset := parsePaginationGin(c)

	entries, err := h.guestbookRepo.ListApproved(c, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list guestbook entries"})
		return
	}

	c.JSON(http.StatusOK, view.ToGuestbookEntryResponses(entries))
}

// ListPendingGuestbookEntries handles GET /api/guestbook/pending (admin only)
func (h *GuestbookHandler) ListPendingGuestbookEntries(c *gin.Context) {
	user := c.MustGet("user").(*auth.User)
	if user == nil || !user.IsAdmin() {
		c.JSON(http.StatusForbidden, gin.H{"error": "admin role required"})
		return
	}

	limit, offset := parsePaginationGin(c)

	entries, err := h.guestbookRepo.ListPending(c, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list pending entries"})
		return
	}

	c.JSON(http.StatusOK, view.ToGuestbookEntryResponses(entries))
}

// ApproveGuestbookEntryRequest represents the request body for approving an entry
type ApproveGuestbookEntryRequest struct {
	Approve bool `json:"approve"`
}

// ApproveGuestbookEntry handles POST /api/guestbook/:id/approve (admin only)
func (h *GuestbookHandler) ApproveGuestbookEntry(c *gin.Context) {
	user := c.MustGet("user").(*auth.User)
	if user == nil || !user.IsAdmin() {
		c.JSON(http.StatusForbidden, gin.H{"error": "admin role required"})
		return
	}

	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id is required"})
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id format"})
		return
	}

	var req ApproveGuestbookEntryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	if req.Approve {
		if err := h.guestbookRepo.Approve(c, id); err != nil {
			status, message := statusCodeFromError(err)
			c.JSON(status, gin.H{"error": message})
			return
		}
	} else {
		if err := h.guestbookRepo.Delete(c, id); err != nil {
			status, message := statusCodeFromError(err)
			c.JSON(status, gin.H{"error": message})
			return
		}
	}

	c.Status(http.StatusNoContent)
}

// DeleteGuestbookEntry handles DELETE /api/guestbook/:id (admin only)
func (h *GuestbookHandler) DeleteGuestbookEntry(c *gin.Context) {
	user := c.MustGet("user").(*auth.User)
	if user == nil || !user.IsAdmin() {
		c.JSON(http.StatusForbidden, gin.H{"error": "admin role required"})
		return
	}

	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id is required"})
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id format"})
		return
	}

	if err := h.guestbookRepo.Delete(c, id); err != nil {
		status, message := statusCodeFromError(err)
		c.JSON(status, gin.H{"error": message})
		return
	}

	c.Status(http.StatusNoContent)
}
