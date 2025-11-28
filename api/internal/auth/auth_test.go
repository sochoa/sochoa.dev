package auth

import (
	"testing"
)

// MockTokenVerifier is a simple mock for testing
type MockTokenVerifier struct{}

func (m *MockTokenVerifier) VerifyToken(_ string) error {
	return nil
}

func TestTokenVerifierInterface(_ *testing.T) {
	var _ TokenVerifier = (*MockTokenVerifier)(nil)
}
