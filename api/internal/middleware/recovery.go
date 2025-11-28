package middleware

import (
	"fmt"
	"log/slog"
	"net/http"
	"runtime/debug"

	"github.com/gin-gonic/gin"
)

// Recovery returns a middleware that recovers from panics and logs the error
func Recovery(log *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if err := recover(); err != nil {
					// Log the panic with stack trace
					log.Error("panic recovered",
						slog.String("method", r.Method),
						slog.String("path", r.RequestURI),
						slog.String("error", fmt.Sprint(err)),
						slog.String("stack", string(debug.Stack())),
					)

					// Write error response
					w.Header().Set("Content-Type", "application/json")
					w.WriteHeader(http.StatusInternalServerError)
					fmt.Fprintf(w, `{"error":"internal server error"}`)
				}
			}()

			next.ServeHTTP(w, r)
		})
	}
}

// RecoveryGin returns a Gin middleware that recovers from panics and logs the error
func RecoveryGin(log *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Log the panic with stack trace
				log.Error("panic recovered",
					slog.String("method", c.Request.Method),
					slog.String("path", c.Request.RequestURI),
					slog.String("error", fmt.Sprint(err)),
					slog.String("stack", string(debug.Stack())),
				)

				// Write error response
				c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
				c.Abort()
			}
		}()

		c.Next()
	}
}
