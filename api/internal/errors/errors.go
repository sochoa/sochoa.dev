package errors

import (
	"errors"
	"net/http"
)

// ValidationError represents a validation failure
type ValidationError struct {
	Message string
}

func (e ValidationError) Error() string {
	return e.Message
}

// NotFoundError represents a resource not found
type NotFoundError struct {
	Message string
}

func (e NotFoundError) Error() string {
	return e.Message
}

// UnauthorizedError represents an authentication failure
type UnauthorizedError struct {
	Message string
}

func (e UnauthorizedError) Error() string {
	return e.Message
}

// ForbiddenError represents an authorization failure
type ForbiddenError struct {
	Message string
}

func (e ForbiddenError) Error() string {
	return e.Message
}

// ConflictError represents a resource already exists
type ConflictError struct {
	Message string
}

func (e ConflictError) Error() string {
	return e.Message
}

// RateLimitError represents rate limit exceeded
type RateLimitError struct {
	Message string
}

func (e RateLimitError) Error() string {
	return e.Message
}

// HTTPStatusCode returns the appropriate HTTP status code for an error
func HTTPStatusCode(err error) int {
	if err == nil {
		return http.StatusOK
	}

	// Try to get the underlying error if wrapped
	unwrapped := errors.Unwrap(err)
	if unwrapped != nil {
		err = unwrapped
	}

	// Check the error type
	switch err.(type) {
	case ValidationError:
		return http.StatusBadRequest
	case NotFoundError:
		return http.StatusNotFound
	case UnauthorizedError:
		return http.StatusUnauthorized
	case ForbiddenError:
		return http.StatusForbidden
	case ConflictError:
		return http.StatusConflict
	case RateLimitError:
		return http.StatusTooManyRequests
	default:
		return http.StatusInternalServerError
	}
}
