package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/sochoa/api/internal/auth"
)

// contextKeyUser is used to store the user in request context
type contextKeyUser struct{}

// ContextKeyUser is the key for accessing the authenticated user from context
var ContextKeyUser = contextKeyUser{}

// RequireAuth returns a middleware that validates JWT token and requires authentication
func RequireAuth(tokenVerifier auth.TokenVerifier) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token := extractToken(r)
			if token == "" {
				writeJSONError(w, http.StatusUnauthorized, "missing authorization header")
				return
			}

			user, err := tokenVerifier.VerifyToken(r.Context(), token)
			if err != nil {
				writeJSONError(w, http.StatusUnauthorized, fmt.Sprintf("invalid token: %v", err))
				return
			}

			// Inject user into context
			ctx := context.WithValue(r.Context(), ContextKeyUser, user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireAdmin returns a middleware that requires admin role
func RequireAdmin(tokenVerifier auth.TokenVerifier) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token := extractToken(r)
			if token == "" {
				writeJSONError(w, http.StatusUnauthorized, "missing authorization header")
				return
			}

			user, err := tokenVerifier.VerifyToken(r.Context(), token)
			if err != nil {
				writeJSONError(w, http.StatusUnauthorized, fmt.Sprintf("invalid token: %v", err))
				return
			}

			if !user.IsAdmin() {
				writeJSONError(w, http.StatusForbidden, "admin role required")
				return
			}

			// Inject user into context
			ctx := context.WithValue(r.Context(), ContextKeyUser, user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// OptionalAuth returns a middleware that validates JWT token if present, but doesn't require it
func OptionalAuth(tokenVerifier auth.TokenVerifier) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token := extractToken(r)

			// If token is present, verify it. Otherwise, continue without user.
			if token != "" {
				user, err := tokenVerifier.VerifyToken(r.Context(), token)
				if err == nil {
					// Inject user into context if verification succeeded
					ctx := context.WithValue(r.Context(), ContextKeyUser, user)
					next.ServeHTTP(w, r.WithContext(ctx))
					return
				}
				// If verification failed, continue without user (optional)
			}

			next.ServeHTTP(w, r)
		})
	}
}

// UserFromContext extracts the authenticated user from the request context
func UserFromContext(r *http.Request) *auth.User {
	user, ok := r.Context().Value(ContextKeyUser).(*auth.User)
	if !ok {
		return nil
	}
	return user
}

// extractToken extracts the JWT token from the Authorization header
func extractToken(r *http.Request) string {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return ""
	}

	// Expected format: "Bearer <token>"
	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return ""
	}

	return parts[1]
}

// writeJSONError writes an error response as JSON
func writeJSONError(w http.ResponseWriter, statusCode int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	fmt.Fprintf(w, `{"error":"%s"}`, message)
}
