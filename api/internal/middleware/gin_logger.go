package middleware

import (
	"log/slog"
	"time"

	"github.com/gin-gonic/gin"
)

// GinLogWriter is a custom writer for Gin that redirects output to slog
type GinLogWriter struct {
	log *slog.Logger
}

func (w *GinLogWriter) Write(p []byte) (int, error) {
	// Suppress Gin's default debug output - only log HTTP requests via middleware
	return len(p), nil
}

// SetGinLogger configures Gin to use slog for internal logging
func SetGinLogger(log *slog.Logger) {
	gin.DefaultWriter = &GinLogWriter{log: log}
	gin.DefaultErrorWriter = &GinLogWriter{log: log}
}

// GinLogger returns a Gin middleware that logs requests using slog in structured JSON format
func GinLogger(log *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()

		// Process request
		c.Next()

		// Calculate duration
		duration := time.Since(startTime)

		// Log with structured format
		log.Info("http request",
			slog.String("method", c.Request.Method),
			slog.String("path", c.Request.RequestURI),
			slog.Int("status", c.Writer.Status()),
			slog.Int("bytes", c.Writer.Size()),
			slog.Duration("latency", duration),
			slog.String("user_agent", c.Request.UserAgent()),
			slog.String("ip", c.ClientIP()),
		)
	}
}

// GinErrorLogger returns a Gin middleware that logs errors using slog
func GinErrorLogger(log *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// Log errors if any
		for _, err := range c.Errors {
			log.Error("gin error",
				slog.String("method", c.Request.Method),
				slog.String("path", c.Request.RequestURI),
				slog.Int("status", c.Writer.Status()),
				slog.String("error", err.Error()),
			)
		}
	}
}
