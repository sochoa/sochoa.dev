package middleware

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sochoa/sochoa.dev/api/internal/logger" // nosec
)

// contextKeyRequestID is used to store the request ID in request context
type contextKeyRequestID struct{}

// ContextKeyRequestID is the key for accessing the request ID from context
var ContextKeyRequestID = contextKeyRequestID{}

// RequestLogger returns a middleware that logs HTTP requests with request IDs
func RequestLogger(log *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Generate request ID
			requestID := uuid.New().String()

			// Inject request ID into context
			ctx := logger.WithRequestID(r.Context(), requestID)

			// Wrap response writer to capture status code and size
			wrapped := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}

			// Record start time
			start := time.Now()

			// Log request
			log.Info("request received",
				slog.String("request_id", requestID),
				slog.String("method", r.Method),
				slog.String("path", r.RequestURI),
				slog.String("remote_addr", r.RemoteAddr),
			)

			// Call next handler
			next.ServeHTTP(wrapped, r.WithContext(ctx))

			// Log response
			duration := time.Since(start)
			log.Info("request completed",
				slog.String("request_id", requestID),
				slog.String("method", r.Method),
				slog.String("path", r.RequestURI),
				slog.Int("status", wrapped.statusCode),
				slog.Int("size", wrapped.size),
				slog.Duration("latency", duration),
			)
		})
	}
}

// responseWriter wraps http.ResponseWriter to capture status code and size
type responseWriter struct {
	http.ResponseWriter
	statusCode int
	size       int
}

// WriteHeader captures the status code
func (rw *responseWriter) WriteHeader(statusCode int) {
	rw.statusCode = statusCode
	rw.ResponseWriter.WriteHeader(statusCode)
}

// Write captures the response size
func (rw *responseWriter) Write(b []byte) (int, error) {
	size, err := rw.ResponseWriter.Write(b)
	rw.size += size
	return size, err
}

// RequestLoggerGin returns a Gin middleware that logs HTTP requests with request IDs
func RequestLoggerGin(log *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Generate request ID
		requestID := uuid.New().String()

		// Inject request ID into context
		ctx := logger.WithRequestID(c.Request.Context(), requestID)
		c.Request = c.Request.WithContext(ctx)

		// Record start time
		start := time.Now()

		// Log request
		log.Info("request received",
			slog.String("request_id", requestID),
			slog.String("method", c.Request.Method),
			slog.String("path", c.Request.RequestURI),
			slog.String("remote_addr", c.Request.RemoteAddr),
		)

		// Call next handler
		c.Next()

		// Log response
		duration := time.Since(start)
		log.Info("request completed",
			slog.String("request_id", requestID),
			slog.String("method", c.Request.Method),
			slog.String("path", c.Request.RequestURI),
			slog.Int("status", c.Writer.Status()),
			slog.Int("size", c.Writer.Size()),
			slog.Duration("latency", duration),
		)
	}
}
