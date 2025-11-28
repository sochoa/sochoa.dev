package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/sochoa/sochoa.dev/api/internal/auth"
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

// RequireAuthGin returns a Gin middleware that validates JWT token and requires authentication
func RequireAuthGin(tokenVerifier auth.TokenVerifier) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := extractToken(c.Request)
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "missing authorization header"})
			c.Abort()
			return
		}

		user, err := tokenVerifier.VerifyToken(c.Request.Context(), token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": fmt.Sprintf("invalid token: %v", err)})
			c.Abort()
			return
		}

		// Inject user into Gin context
		c.Set("user", user)
		c.Next()
	}
}

// RequireAdminGin returns a Gin middleware that requires admin role
func RequireAdminGin(tokenVerifier auth.TokenVerifier) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := extractToken(c.Request)
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "missing authorization header"})
			c.Abort()
			return
		}

		user, err := tokenVerifier.VerifyToken(c.Request.Context(), token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": fmt.Sprintf("invalid token: %v", err)})
			c.Abort()
			return
		}

		if !user.IsAdmin() {
			c.JSON(http.StatusForbidden, gin.H{"error": "admin role required"})
			c.Abort()
			return
		}

		// Inject user into Gin context
		c.Set("user", user)
		c.Next()
	}
}

// OptionalAuthGin returns a Gin middleware that validates JWT token if present, but doesn't require it
func OptionalAuthGin(tokenVerifier auth.TokenVerifier) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := extractToken(c.Request)

		// If token is present, verify it. Otherwise, continue without user.
		if token != "" {
			user, err := tokenVerifier.VerifyToken(c.Request.Context(), token)
			if err == nil {
				// Inject user into Gin context if verification succeeded
				c.Set("user", user)
			}
			// If verification failed, continue without user (optional)
		}

		c.Next()
	}
}
