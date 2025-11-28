package errors

import (
	"net/http"
	"testing"
)

func TestValidationError(t *testing.T) {
	err := ValidationError{Message: "invalid input"}
	if err.Error() != "invalid input" {
		t.Errorf("expected 'invalid input', got '%s'", err.Error())
	}
}

func TestNotFoundError(t *testing.T) {
	err := NotFoundError{Message: "resource not found"}
	if err.Error() != "resource not found" {
		t.Errorf("expected 'resource not found', got '%s'", err.Error())
	}
}

func TestUnauthorizedError(t *testing.T) {
	err := UnauthorizedError{Message: "unauthorized"}
	if err.Error() != "unauthorized" {
		t.Errorf("expected 'unauthorized', got '%s'", err.Error())
	}
}

func TestForbiddenError(t *testing.T) {
	err := ForbiddenError{Message: "forbidden"}
	if err.Error() != "forbidden" {
		t.Errorf("expected 'forbidden', got '%s'", err.Error())
	}
}

func TestConflictError(t *testing.T) {
	err := ConflictError{Message: "resource already exists"}
	if err.Error() != "resource already exists" {
		t.Errorf("expected 'resource already exists', got '%s'", err.Error())
	}
}

func TestRateLimitError(t *testing.T) {
	err := RateLimitError{Message: "rate limit exceeded"}
	if err.Error() != "rate limit exceeded" {
		t.Errorf("expected 'rate limit exceeded', got '%s'", err.Error())
	}
}

func TestHTTPStatusCode(t *testing.T) {
	tests := []struct {
		name           string
		err            error
		expectedStatus int
	}{
		{
			name:           "nil error",
			err:            nil,
			expectedStatus: http.StatusOK,
		},
		{
			name:           "validation error",
			err:            ValidationError{Message: "invalid"},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "not found error",
			err:            NotFoundError{Message: "not found"},
			expectedStatus: http.StatusNotFound,
		},
		{
			name:           "unauthorized error",
			err:            UnauthorizedError{Message: "unauthorized"},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "forbidden error",
			err:            ForbiddenError{Message: "forbidden"},
			expectedStatus: http.StatusForbidden,
		},
		{
			name:           "conflict error",
			err:            ConflictError{Message: "conflict"},
			expectedStatus: http.StatusConflict,
		},
		{
			name:           "rate limit error",
			err:            RateLimitError{Message: "rate limit"},
			expectedStatus: http.StatusTooManyRequests,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			status := HTTPStatusCode(tt.err)
			if status != tt.expectedStatus {
				t.Errorf("expected %d, got %d", tt.expectedStatus, status)
			}
		})
	}
}
