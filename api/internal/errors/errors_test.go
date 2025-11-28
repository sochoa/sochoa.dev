package errors

import (
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
