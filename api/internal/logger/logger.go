package logger

import (
	"context"
	"log/slog"
	"os"
)

// Setup initializes structured logging with slog
// Returns a logger configured with JSON output, specified log level,
// and source file/line information
func Setup(level string) *slog.Logger {
	var logLevel slog.Level
	switch level {
	case "debug":
		logLevel = slog.LevelDebug
	case "warn":
		logLevel = slog.LevelWarn
	case "error":
		logLevel = slog.LevelError
	default:
		logLevel = slog.LevelInfo
	}

	opts := &slog.HandlerOptions{
		Level:     logLevel,
		AddSource: true, // Include filename and line number
	}

	handler := slog.NewJSONHandler(os.Stdout, opts)
	return slog.New(handler)
}

// WithRequestID attaches a request ID to the context for propagation through logs
func WithRequestID(ctx context.Context, requestID string) context.Context {
	return context.WithValue(ctx, requestIDKey, requestID)
}

// WithUser attaches a user ID to the context for propagation through logs
func WithUser(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, userIDKey, userID)
}

// WithRole attaches a user role to the context for propagation through logs
func WithRole(ctx context.Context, role string) context.Context {
	return context.WithValue(ctx, roleKey, role)
}

// RequestIDKey and other context keys for logger attribute propagation
type contextKey string

const (
	requestIDKey contextKey = "request_id"
	userIDKey    contextKey = "user_id"
	roleKey      contextKey = "role"
)

// AttrsFromContext extracts logging attributes from context values
func AttrsFromContext(ctx context.Context) []slog.Attr {
	var attrs []slog.Attr

	if requestID, ok := ctx.Value(requestIDKey).(string); ok && requestID != "" {
		attrs = append(attrs, slog.String("request_id", requestID))
	}

	if userID, ok := ctx.Value(userIDKey).(string); ok && userID != "" {
		attrs = append(attrs, slog.String("user_id", userID))
	}

	if role, ok := ctx.Value(roleKey).(string); ok && role != "" {
		attrs = append(attrs, slog.String("role", role))
	}

	return attrs
}
