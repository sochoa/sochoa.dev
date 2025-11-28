package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	apierrors "github.com/sochoa/sochoa.dev/api/internal/errors"
)

// statusCodeFromError converts domain errors to HTTP status codes
func statusCodeFromError(err error) (int, string) {
	var validationErr apierrors.ValidationError
	var notFoundErr apierrors.NotFoundError
	var conflictErr apierrors.ConflictError
	var forbiddenErr apierrors.ForbiddenError

	if errors.As(err, &validationErr) {
		return http.StatusBadRequest, validationErr.Message
	}
	if errors.As(err, &notFoundErr) {
		return http.StatusNotFound, notFoundErr.Message
	}
	if errors.As(err, &conflictErr) {
		return http.StatusConflict, conflictErr.Message
	}
	if errors.As(err, &forbiddenErr) {
		return http.StatusForbidden, forbiddenErr.Message
	}

	return http.StatusInternalServerError, "internal server error"
}

// parsePaginationGin extracts pagination parameters from Gin context
func parsePaginationGin(c *gin.Context) (limit, offset int) {
	limit = 10
	offset = 0

	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	if o := c.Query("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	return
}
