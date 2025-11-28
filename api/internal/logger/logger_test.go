package logger

import (
	"context"
	"testing"
)

func TestSetup(t *testing.T) {
	tests := []struct {
		name  string
		level string
	}{
		{"debug", "debug"},
		{"info", "info"},
		{"warn", "warn"},
		{"error", "error"},
		{"unknown", "unknown"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			logger := Setup(tt.level)
			if logger == nil {
				t.Error("expected non-nil logger")
			}
		})
	}
}

func TestWithRequestID(t *testing.T) {
	ctx := context.Background()
	reqID := "test-request-123"

	ctxWithReqID := WithRequestID(ctx, reqID)
	if ctxWithReqID == nil {
		t.Error("expected non-nil context")
	}

	retrieved := ctxWithReqID.Value(requestIDKey)
	if retrieved != reqID {
		t.Errorf("expected %s, got %v", reqID, retrieved)
	}
}

func TestWithUser(t *testing.T) {
	ctx := context.Background()
	userID := "user-456"

	ctxWithUser := WithUser(ctx, userID)
	if ctxWithUser == nil {
		t.Error("expected non-nil context")
	}

	retrieved := ctxWithUser.Value(userIDKey)
	if retrieved != userID {
		t.Errorf("expected %s, got %v", userID, retrieved)
	}
}

func TestWithRole(t *testing.T) {
	ctx := context.Background()
	role := "admin"

	ctxWithRole := WithRole(ctx, role)
	if ctxWithRole == nil {
		t.Error("expected non-nil context")
	}

	retrieved := ctxWithRole.Value(roleKey)
	if retrieved != role {
		t.Errorf("expected %s, got %v", role, retrieved)
	}
}

func TestAttrsFromContext(t *testing.T) {
	tests := []struct {
		name            string
		ctx             context.Context
		expectedAttrLen int
	}{
		{
			name:            "empty context",
			ctx:             context.Background(),
			expectedAttrLen: 0,
		},
		{
			name:            "context with request ID",
			ctx:             WithRequestID(context.Background(), "req-123"),
			expectedAttrLen: 1,
		},
		{
			name:            "context with request ID and user ID",
			ctx:             WithUser(WithRequestID(context.Background(), "req-123"), "user-456"),
			expectedAttrLen: 2,
		},
		{
			name:            "context with all values",
			ctx:             WithRole(WithUser(WithRequestID(context.Background(), "req-123"), "user-456"), "admin"),
			expectedAttrLen: 3,
		},
		{
			name:            "context with empty request ID",
			ctx:             WithRequestID(context.Background(), ""),
			expectedAttrLen: 0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			attrs := AttrsFromContext(tt.ctx)
			if len(attrs) != tt.expectedAttrLen {
				t.Errorf("expected %d attrs, got %d", tt.expectedAttrLen, len(attrs))
			}
		})
	}
}
