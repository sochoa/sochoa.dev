package auth

// TokenVerifier interface for mocking JWT token verification
type TokenVerifier interface {
	// VerifyToken placeholder method
	VerifyToken(token string) error
}
