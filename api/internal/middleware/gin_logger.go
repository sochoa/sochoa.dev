package middleware

import (
	"log/slog"
	"time"

	"github.com/gin-gonic/gin"
)

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
