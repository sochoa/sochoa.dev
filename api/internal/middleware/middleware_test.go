package middleware

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/sochoa/api/internal/auth"
	"github.com/sochoa/api/internal/logger"
)

// mockTokenVerifier is a test implementation of TokenVerifier
type mockTokenVerifier struct {
	user *auth.User
	err  error
}

func (m *mockTokenVerifier) VerifyToken(_ context.Context, _ string) (*auth.User, error) {
	return m.user, m.err
}

func TestUserFromContext(t *testing.T) {
	req := httptest.NewRequest("GET", "/", nil)
	user := &auth.User{ID: "user123", Email: "user@example.com"}
	ctx := context.WithValue(req.Context(), ContextKeyUser, user)
	req = req.WithContext(ctx)

	retrieved := UserFromContext(req)
	if retrieved == nil || retrieved.ID != user.ID {
		t.Errorf("expected user %v, got %v", user, retrieved)
	}
}

func TestUserFromContextNil(t *testing.T) {
	req := httptest.NewRequest("GET", "/", nil)
	retrieved := UserFromContext(req)
	if retrieved != nil {
		t.Errorf("expected nil user, got %v", retrieved)
	}
}

func TestRequireAuthMissingHeader(t *testing.T) {
	verifier := &mockTokenVerifier{user: nil, err: nil}
	middleware := RequireAuth(verifier)

	handler := middleware(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	rec := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/", nil)

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("expected status %d, got %d", http.StatusUnauthorized, rec.Code)
	}
}

func TestRequireAuthInvalidToken(t *testing.T) {
	verifier := &mockTokenVerifier{user: nil, err: fmt.Errorf("invalid token")}
	middleware := RequireAuth(verifier)

	handler := middleware(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	rec := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/", nil)
	req.Header.Set("Authorization", "Bearer invalid.token.here")

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("expected status %d, got %d", http.StatusUnauthorized, rec.Code)
	}
}

func TestRequireAuthSuccess(t *testing.T) {
	user := &auth.User{ID: "user123", Email: "user@example.com", Groups: []string{"user"}}
	verifier := &mockTokenVerifier{user: user, err: nil}
	middleware := RequireAuth(verifier)

	called := false
	handler := middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
		retrieved := UserFromContext(r)
		if retrieved == nil || retrieved.ID != user.ID {
			t.Errorf("expected user in context")
		}
		w.WriteHeader(http.StatusOK)
	}))

	rec := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/", nil)
	req.Header.Set("Authorization", "Bearer valid.token.here")

	handler.ServeHTTP(rec, req)

	if !called {
		t.Error("expected handler to be called")
	}
	if rec.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, rec.Code)
	}
}

func TestRequireAdminNotAdmin(t *testing.T) {
	user := &auth.User{ID: "user123", Email: "user@example.com", Groups: []string{"user"}}
	verifier := &mockTokenVerifier{user: user, err: nil}
	middleware := RequireAdmin(verifier)

	handler := middleware(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	rec := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/", nil)
	req.Header.Set("Authorization", "Bearer valid.token.here")

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusForbidden {
		t.Errorf("expected status %d, got %d", http.StatusForbidden, rec.Code)
	}
}

func TestRequireAdminSuccess(t *testing.T) {
	user := &auth.User{ID: "admin123", Email: "admin@example.com", Groups: []string{"admin"}}
	verifier := &mockTokenVerifier{user: user, err: nil}
	middleware := RequireAdmin(verifier)

	called := false
	handler := middleware(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		called = true
		w.WriteHeader(http.StatusOK)
	}))

	rec := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/", nil)
	req.Header.Set("Authorization", "Bearer valid.token.here")

	handler.ServeHTTP(rec, req)

	if !called {
		t.Error("expected handler to be called")
	}
	if rec.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, rec.Code)
	}
}

func TestOptionalAuthNoToken(t *testing.T) {
	verifier := &mockTokenVerifier{user: nil, err: nil}
	middleware := OptionalAuth(verifier)

	called := false
	handler := middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
		// User should be nil when no token provided
		user := UserFromContext(r)
		if user != nil {
			t.Error("expected no user in context")
		}
		w.WriteHeader(http.StatusOK)
	}))

	rec := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/", nil)

	handler.ServeHTTP(rec, req)

	if !called {
		t.Error("expected handler to be called")
	}
	if rec.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, rec.Code)
	}
}

func TestOptionalAuthWithValidToken(t *testing.T) {
	user := &auth.User{ID: "user123", Email: "user@example.com"}
	verifier := &mockTokenVerifier{user: user, err: nil}
	middleware := OptionalAuth(verifier)

	called := false
	handler := middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
		retrieved := UserFromContext(r)
		if retrieved == nil || retrieved.ID != user.ID {
			t.Error("expected user in context")
		}
		w.WriteHeader(http.StatusOK)
	}))

	rec := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/", nil)
	req.Header.Set("Authorization", "Bearer valid.token.here")

	handler.ServeHTTP(rec, req)

	if !called {
		t.Error("expected handler to be called")
	}
	if rec.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, rec.Code)
	}
}

func TestRequestLogger(t *testing.T) {
	log := logger.Setup("info")
	middleware := RequestLogger(log)

	called := false
	handler := middleware(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		called = true
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("test"))
	}))

	rec := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/test", nil)

	handler.ServeHTTP(rec, req)

	if !called {
		t.Error("expected handler to be called")
	}
	if rec.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, rec.Code)
	}
}

func TestRecovery(t *testing.T) {
	log := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelError}))
	middleware := Recovery(log)

	handler := middleware(http.HandlerFunc(func(_ http.ResponseWriter, _ *http.Request) {
		panic("test panic")
	}))

	rec := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/", nil)

	// Should not panic
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusInternalServerError {
		t.Errorf("expected status %d, got %d", http.StatusInternalServerError, rec.Code)
	}

	// Response should contain error
	if !strings.Contains(rec.Body.String(), "error") {
		t.Error("expected error in response")
	}
}
