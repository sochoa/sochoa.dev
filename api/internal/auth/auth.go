package auth

import (
	"context"
	"fmt"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// User represents an authenticated user from Cognito
type User struct {
	ID            string
	Email         string
	EmailVerified bool
	Groups        []string
}

// IsAdmin checks if the user has admin privileges
func (u *User) IsAdmin() bool {
	for _, group := range u.Groups {
		if group == "admin" {
			return true
		}
	}
	return false
}

// TokenVerifier defines the interface for JWT token verification
type TokenVerifier interface {
	VerifyToken(ctx context.Context, token string) (*User, error)
}

// CognitoClaims represents standard Cognito JWT claims
type CognitoClaims struct {
	Sub           string   `json:"sub"`
	Email         string   `json:"email"`
	EmailVerified bool     `json:"email_verified"`
	CognitoGroups []string `json:"cognito:groups"`
	TokenUse      string   `json:"token_use"`
	jwt.RegisteredClaims
}

// CognitoVerifier verifies JWT tokens from AWS Cognito
type CognitoVerifier struct {
	userPoolID string
	region     string
}

// NewCognitoVerifier creates a new Cognito token verifier
// Note: For production use, this should fetch the JWKS from Cognito
// For now, this is a placeholder structure
func NewCognitoVerifier(userPoolID, region string) *CognitoVerifier {
	return &CognitoVerifier{
		userPoolID: userPoolID,
		region:     region,
	}
}

// VerifyToken verifies a JWT token from Cognito and extracts the user
// Note: This is a simplified implementation. In production, you should:
// 1. Fetch the JWKS (JSON Web Key Set) from Cognito
// 2. Verify the signature against the public keys
// 3. Validate the token claims (issuer, audience, expiration, etc.)
func (cv *CognitoVerifier) VerifyToken(_ context.Context, token string) (*User, error) {
	// Remove "Bearer " prefix if present
	token = strings.TrimPrefix(token, "Bearer ")
	if token == "" {
		return nil, fmt.Errorf("empty token")
	}

	// Parse the JWT token
	claims := &CognitoClaims{}
	_, err := jwt.ParseWithClaims(token, claims, func(_ *jwt.Token) (interface{}, error) {
		// In production, verify the signing method and fetch the public key from Cognito JWKS
		// For now, return an error as placeholder
		return nil, fmt.Errorf("signature verification not implemented: use production Cognito setup")
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	// Validate required claims
	if claims.Sub == "" {
		return nil, fmt.Errorf("missing 'sub' claim")
	}

	user := &User{
		ID:            claims.Sub,
		Email:         claims.Email,
		EmailVerified: claims.EmailVerified,
		Groups:        claims.CognitoGroups,
	}

	return user, nil
}
