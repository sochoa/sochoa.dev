package middleware

import (
	"github.com/gin-gonic/gin"
)

// CORSGin returns a Gin middleware that handles CORS headers for local development
// In production, CORS is handled by AWS API Gateway
func CORSGin() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Allow requests from localhost (Vite dev server supports both 3000 and 5173)
		// For development, we allow all localhost variations
		origin := c.Request.Header.Get("Origin")
		if origin == "http://localhost:3000" || origin == "http://localhost:5173" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		}

		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Max-Age", "86400")

		// Handle preflight requests
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
