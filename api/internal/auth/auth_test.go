package auth

import (
	"context"
	"testing"
)

// MockTokenVerifier is a simple mock for testing
type MockTokenVerifier struct {
	user *User
	err  error
}

func (m *MockTokenVerifier) VerifyToken(_ context.Context, _ string) (*User, error) {
	return m.user, m.err
}

func TestTokenVerifierInterface(_ *testing.T) {
	var _ TokenVerifier = (*MockTokenVerifier)(nil)
}

func TestUserIsAdmin(t *testing.T) {
	tests := []struct {
		name     string
		user     *User
		expected bool
	}{
		{
			name:     "user without admin group",
			user:     &User{ID: "user1", Groups: []string{"user"}},
			expected: false,
		},
		{
			name:     "user with admin group",
			user:     &User{ID: "user2", Groups: []string{"admin"}},
			expected: true,
		},
		{
			name:     "user with multiple groups including admin",
			user:     &User{ID: "user3", Groups: []string{"user", "admin", "moderator"}},
			expected: true,
		},
		{
			name:     "user with no groups",
			user:     &User{ID: "user4", Groups: []string{}},
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			isAdmin := tt.user.IsAdmin()
			if isAdmin != tt.expected {
				t.Errorf("expected %v, got %v", tt.expected, isAdmin)
			}
		})
	}
}

func TestNewCognitoVerifier(t *testing.T) {
	userPoolID := "us-east-1_ABC123"
	region := "us-east-1"

	verifier := NewCognitoVerifier(userPoolID, region)
	if verifier.userPoolID != userPoolID {
		t.Errorf("expected userPoolID %s, got %s", userPoolID, verifier.userPoolID)
	}
	if verifier.region != region {
		t.Errorf("expected region %s, got %s", region, verifier.region)
	}
}

func TestVerifyTokenEmptyToken(t *testing.T) {
	verifier := NewCognitoVerifier("us-east-1_ABC123", "us-east-1")
	ctx := context.Background()

	_, err := verifier.VerifyToken(ctx, "")
	if err == nil {
		t.Error("expected error for empty token")
	}
}

func TestVerifyTokenBearerPrefix(t *testing.T) {
	verifier := NewCognitoVerifier("us-east-1_ABC123", "us-east-1")
	ctx := context.Background()

	// Should strip "Bearer " prefix
	_, err := verifier.VerifyToken(ctx, "Bearer invalid.token.here")
	if err == nil {
		t.Error("expected error for invalid token")
	}
}
