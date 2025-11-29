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
// @Summary		Submit a guestbook entry
// @Description	Submit a new guestbook entry (authenticated users only, requires approval)
// @Tags			Guestbook
// @Accept			json
// @Produce		json
// @Param			request	body		SubmitGuestbookEntryRequest	true	"Guestbook entry request"
// @Success		201		{object}	view.GuestbookEntryResponse	"Entry submitted successfully"
// @Failure		400		{object}	map[string]string			"Invalid request body"
// @Failure		401		{object}	map[string]string			"Unauthorized"
// @Failure		429		{object}	map[string]string			"Rate limit exceeded"
// @Router			/api/guestbook [post]
// @Security		BearerAuth
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
	count, err := h.guestbookRepo.CountByUserInTimeWindow(c, "google", user.ID, since)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check rate limit"})
		return
	}

	if count >= 3 {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "rate limit exceeded: 3 entries per day"})
		return
	}

	entry := &model.GuestbookEntry{
		UserProvider: "google",
		UserID:       user.ID,
		DisplayName:  req.DisplayName,
		Message:      req.Message,
		IsApproved:   false, // Requires admin approval by default
	}

	if err := h.guestbookRepo.Create(c, entry); err != nil {
		status, message := statusCodeFromError(err)
		if status == http.StatusInternalServerError {
			c.Error(err)
		}
		c.JSON(status, gin.H{"error": message})
		return
	}

	c.JSON(http.StatusCreated, view.ToGuestbookEntryResponse(entry))
}

// ListApprovedGuestbookEntries handles GET /api/guestbook (public)
// @Summary		List approved guestbook entries
// @Description	List all approved guestbook entries (public)
// @Tags			Guestbook
// @Produce		json
// @Param			limit	query		integer	false	"Number of entries per page (default: 10)"
// @Param			offset	query		integer	false	"Number of entries to skip (default: 0)"
// @Success		200		{array}		view.GuestbookEntryResponse	"List of approved entries"
// @Router			/api/guestbook [get]
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
// @Summary		List pending guestbook entries
// @Description	List all pending guestbook entries awaiting approval (admin only)
// @Tags			Guestbook
// @Produce		json
// @Param			limit	query		integer	false	"Number of entries per page (default: 10)"
// @Param			offset	query		integer	false	"Number of entries to skip (default: 0)"
// @Success		200		{array}		view.GuestbookEntryResponse	"List of pending entries"
// @Failure		403		{object}	map[string]string			"Forbidden - admin role required"
// @Router			/api/guestbook/pending [get]
// @Security		BearerAuth
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
// @Summary		Approve or reject a guestbook entry
// @Description	Approve or reject a pending guestbook entry (admin only)
// @Tags			Guestbook
// @Accept			json
// @Param			id		path		string									true	"Entry ID (UUID)"
// @Param			request	body		ApproveGuestbookEntryRequest	true	"Approve/reject request"
// @Success		204			"Entry status updated"
// @Failure		400		{object}	map[string]string			"Invalid request"
// @Failure		403		{object}	map[string]string			"Forbidden - admin role required"
// @Failure		404		{object}	map[string]string			"Entry not found"
// @Router			/api/guestbook/{id}/approve [post]
// @Security		BearerAuth
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
// @Summary		Delete a guestbook entry
// @Description	Delete a guestbook entry (admin only)
// @Tags			Guestbook
// @Param			id	path	string	true	"Entry ID (UUID)"
// @Success		204			"Entry deleted successfully"
// @Failure		400	{object}	map[string]string	"Invalid request"
// @Failure		403	{object}	map[string]string	"Forbidden - admin role required"
// @Failure		404	{object}	map[string]string	"Entry not found"
// @Router			/api/guestbook/{id} [delete]
// @Security		BearerAuth
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
