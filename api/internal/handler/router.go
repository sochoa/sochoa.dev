package handler

import (
	"log/slog"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sochoa/sochoa.dev/api/internal/auth"
	"github.com/sochoa/sochoa.dev/api/internal/middleware"
	"github.com/sochoa/sochoa.dev/api/internal/model"
)

// Router sets up all HTTP routes with Gin
type Router struct {
	engine           *gin.Engine
	log              *slog.Logger
	postHandler      *PostHandler
	guestbookHandler *GuestbookHandler
	contactHandler   *ContactHandler
	statsHandler     *StatsHandler
	tokenVerifier    auth.TokenVerifier
}

// NewRouter creates a new router with all handlers
func NewRouter(
	log *slog.Logger,
	tokenVerifier auth.TokenVerifier,
	postRepo *model.PostRepository,
	guestbookRepo *model.GuestbookRepository,
	contactRepo *model.ContactRepository,
	statsRepo *model.StatsRepository,
) *Router {
	engine := gin.Default()

	return &Router{
		engine:           engine,
		log:              log,
		postHandler:      NewPostHandler(postRepo),
		guestbookHandler: NewGuestbookHandler(guestbookRepo),
		contactHandler:   NewContactHandler(contactRepo),
		statsHandler:     NewStatsHandler(statsRepo),
		tokenVerifier:    tokenVerifier,
	}
}

// Register sets up all routes and returns the configured Gin engine
func (r *Router) Register() *gin.Engine {
	// Apply global middleware
	r.engine.Use(middleware.RecoveryGin(r.log))
	r.engine.Use(middleware.RequestLoggerGin(r.log))

	// Health check (no auth required)
	r.engine.GET("/api/health", r.healthCheck)

	// Posts endpoints
	r.engine.GET("/api/posts", r.postHandler.ListPublishedPosts)
	r.engine.GET("/api/posts/:slug", r.postHandler.GetPost)
	r.engine.POST("/api/posts", middleware.RequireAuthGin(r.tokenVerifier), r.postHandler.CreatePost)
	r.engine.PUT("/api/posts/:id", middleware.RequireAuthGin(r.tokenVerifier), r.postHandler.UpdatePost)
	r.engine.DELETE("/api/posts/:id", middleware.RequireAuthGin(r.tokenVerifier), r.postHandler.DeletePost)

	// Guestbook endpoints
	r.engine.GET("/api/guestbook", r.guestbookHandler.ListApprovedGuestbookEntries)
	r.engine.POST("/api/guestbook", middleware.RequireAuthGin(r.tokenVerifier), r.guestbookHandler.SubmitGuestbookEntry)
	r.engine.GET("/api/guestbook/pending", middleware.RequireAuthGin(r.tokenVerifier), r.guestbookHandler.ListPendingGuestbookEntries)
	r.engine.POST("/api/guestbook/:id/approve", middleware.RequireAuthGin(r.tokenVerifier), r.guestbookHandler.ApproveGuestbookEntry)
	r.engine.DELETE("/api/guestbook/:id", middleware.RequireAuthGin(r.tokenVerifier), r.guestbookHandler.DeleteGuestbookEntry)

	// Contact endpoints
	r.engine.POST("/api/contact", r.contactHandler.SubmitContact)
	r.engine.GET("/api/contact", middleware.RequireAuthGin(r.tokenVerifier), r.contactHandler.ListContactSubmissions)
	r.engine.PATCH("/api/contact/:id", middleware.RequireAuthGin(r.tokenVerifier), r.contactHandler.UpdateContactStatus)

	// Stats endpoints
	r.engine.POST("/api/stats", middleware.RequireAuthGin(r.tokenVerifier), r.statsHandler.RecordStats)
	r.engine.GET("/api/stats/:id", middleware.RequireAuthGin(r.tokenVerifier), r.statsHandler.GetStats)
	r.engine.GET("/api/stats", middleware.RequireAuthGin(r.tokenVerifier), r.statsHandler.ListStatsByDateRange)
	r.engine.GET("/api/stats/page/:page_path", middleware.RequireAuthGin(r.tokenVerifier), r.statsHandler.ListStatsByPage)
	r.engine.PUT("/api/stats/:id", middleware.RequireAuthGin(r.tokenVerifier), r.statsHandler.UpdateStats)

	return r.engine
}

// healthCheck handles GET /api/health
func (r *Router) healthCheck(c *gin.Context) {
	c.JSON(200, gin.H{
		"status": "healthy",
		"time":   time.Now().UTC(),
	})
}
