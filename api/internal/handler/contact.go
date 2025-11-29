package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sochoa/sochoa.dev/api/internal/auth"
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
	Email    string `json:"email"`
	Name     string `json:"name"`
	Message  string `json:"message"`
	Honeypot string `json:"honeypot,omitempty"` // Anti-spam field - should be empty
}

// SubmitContact handles POST /api/contact (public with optional auth for rate limiting bypass)
// @Summary		Submit a contact form
// @Description	Submit a contact form message (public, rate limited to 5 per day per email)
// @Tags			Contact
// @Accept			json
// @Produce		json
// @Param			request	body		SubmitContactRequest	true	"Contact form request"
// @Success		201		{object}	view.ContactSubmissionResponse	"Submission received"
// @Failure		400		{object}	map[string]string				"Invalid request body"
// @Failure		429		{object}	map[string]string				"Rate limit exceeded"
// @Router			/api/contact [post]
func (h *ContactHandler) SubmitContact(c *gin.Context) {
	var req SubmitContactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	// Honeypot check - if filled, reject
	if req.Honeypot != "" {
		// Silently treat as success to not reveal honeypot
		c.JSON(http.StatusCreated, gin.H{"id": uuid.New().String()})
		return
	}

	// Rate limit: 5 submissions per day per email
	since := model.GetStartOfDay()
	count, err := h.contactRepo.CountByEmailInTimeWindow(c, req.Email, since)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check rate limit"})
		return
	}

	if count >= 5 {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "rate limit exceeded: 5 submissions per day"})
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

	if err := h.contactRepo.Create(c, submission); err != nil {
		status, message := statusCodeFromError(err)
		c.JSON(status, gin.H{"error": message})
		return
	}

	c.JSON(http.StatusCreated, view.ToContactSubmissionResponse(submission))
}

// ListContactSubmissions handles GET /api/contact (admin only)
// @Summary		List contact submissions
// @Description	List contact submissions (admin only, can filter by status)
// @Tags			Contact
// @Produce		json
// @Param			status	query		string	false	"Filter by status (received, replied, archived)"
// @Param			limit	query		integer	false	"Number of submissions per page (default: 10)"
// @Param			offset	query		integer	false	"Number of submissions to skip (default: 0)"
// @Success		200		{array}		view.ContactSubmissionResponse	"List of submissions"
// @Failure		403		{object}	map[string]string				"Forbidden - admin role required"
// @Router			/api/contact [get]
// @Security		BearerAuth
func (h *ContactHandler) ListContactSubmissions(c *gin.Context) {
	user := c.MustGet("user").(*auth.User)
	if user == nil || !user.IsAdmin() {
		c.JSON(http.StatusForbidden, gin.H{"error": "admin role required"})
		return
	}

	status := c.Query("status")
	limit, offset := parsePaginationGin(c)

	var submissions []model.ContactSubmission
	var err error

	if status != "" {
		submissions, err = h.contactRepo.ListByStatus(c, model.ContactStatus(status), limit, offset)
	} else {
		submissions, err = h.contactRepo.ListActive(c, limit, offset)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list submissions"})
		return
	}

	c.JSON(http.StatusOK, view.ToContactSubmissionResponses(submissions))
}

// UpdateContactStatusRequest represents the request body for updating contact status
type UpdateContactStatusRequest struct {
	Status string `json:"status"`
}

// UpdateContactStatus handles PATCH /api/contact/:id (admin only)
// @Summary		Update contact submission status
// @Description	Update the status of a contact submission (admin only)
// @Tags			Contact
// @Accept			json
// @Param			id		path		string							true	"Submission ID (UUID)"
// @Param			request	body		UpdateContactStatusRequest	true	"Status update request"
// @Success		204			"Status updated"
// @Failure		400		{object}	map[string]string	"Invalid request"
// @Failure		403		{object}	map[string]string	"Forbidden - admin role required"
// @Failure		404		{object}	map[string]string	"Submission not found"
// @Router			/api/contact/{id} [patch]
// @Security		BearerAuth
func (h *ContactHandler) UpdateContactStatus(c *gin.Context) {
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

	var req UpdateContactStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	if err := h.contactRepo.UpdateStatus(c, id, model.ContactStatus(req.Status)); err != nil {
		status, message := statusCodeFromError(err)
		c.JSON(status, gin.H{"error": message})
		return
	}

	c.Status(http.StatusNoContent)
}
