package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"time"

	"github.com/sochoa/sochoa.dev/api/internal/auth"
	"github.com/sochoa/sochoa.dev/api/internal/middleware"
	"github.com/sochoa/sochoa.dev/api/internal/model"
	"github.com/sochoa/sochoa.dev/api/internal/view"
)

// Router sets up all HTTP routes with middleware
type Router struct {
	mux *http.ServeMux
	log *slog.Logger

	postHandler      *PostHandler
	guestbookHandler *GuestbookHandler
	contactHandler   *ContactHandler
	statsHandler     *StatsHandler

	tokenVerifier auth.TokenVerifier
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
	return &Router{
		mux:              http.NewServeMux(),
		log:              log,
		postHandler:      NewPostHandler(postRepo),
		guestbookHandler: NewGuestbookHandler(guestbookRepo),
		contactHandler:   NewContactHandler(contactRepo),
		statsHandler:     NewStatsHandler(statsRepo),
		tokenVerifier:    tokenVerifier,
	}
}

// Register sets up all routes and returns the configured handler
func (r *Router) Register() http.Handler {
	// Apply global middleware (recovery first, then logging)
	recoveryHandler := middleware.Recovery(r.log)(r.mux)
	loggingHandler := middleware.RequestLogger(r.log)(recoveryHandler)

	// Health check (no auth required)
	r.mux.HandleFunc("GET /api/health", r.healthCheck)

	// Posts endpoints
	// GET /api/posts - list published posts (public)
	r.mux.HandleFunc("GET /api/posts", r.postsHandler(r.postHandler.ListPublishedPosts, nil))

	// GET /api/posts/:slug - get single post (public, but admin can see unpublished)
	r.mux.HandleFunc("GET /api/posts/{slug}", r.postsHandler(r.postHandler.GetPost, nil))

	// POST /api/posts - create post (admin only)
	r.mux.HandleFunc("POST /api/posts", r.postsHandler(r.postHandler.CreatePost, middleware.RequireAdmin(r.tokenVerifier)))

	// PUT /api/posts/:id - update post (admin only)
	r.mux.HandleFunc("PUT /api/posts/{id}", r.postsHandler(r.postHandler.UpdatePost, middleware.RequireAdmin(r.tokenVerifier)))

	// DELETE /api/posts/:id - delete post (admin only)
	r.mux.HandleFunc("DELETE /api/posts/{id}", r.postsHandler(r.postHandler.DeletePost, middleware.RequireAdmin(r.tokenVerifier)))

	// Guestbook endpoints
	// GET /api/guestbook - list approved entries (public)
	r.mux.HandleFunc("GET /api/guestbook", r.postsHandler(r.guestbookHandler.ListApprovedGuestbookEntries, nil))

	// POST /api/guestbook - submit entry (authenticated)
	r.mux.HandleFunc("POST /api/guestbook", r.postsHandler(r.guestbookHandler.SubmitGuestbookEntry, middleware.RequireAuth(r.tokenVerifier)))

	// GET /api/guestbook/pending - list pending entries (admin only)
	r.mux.HandleFunc("GET /api/guestbook/pending", r.postsHandler(r.guestbookHandler.ListPendingGuestbookEntries, middleware.RequireAdmin(r.tokenVerifier)))

	// POST /api/guestbook/:id/approve - approve/reject entry (admin only)
	r.mux.HandleFunc("POST /api/guestbook/{id}/approve", r.postsHandler(r.guestbookHandler.ApproveGuestbookEntry, middleware.RequireAdmin(r.tokenVerifier)))

	// DELETE /api/guestbook/:id - delete entry (admin only)
	r.mux.HandleFunc("DELETE /api/guestbook/{id}", r.postsHandler(r.guestbookHandler.DeleteGuestbookEntry, middleware.RequireAdmin(r.tokenVerifier)))

	// Contact endpoints
	// POST /api/contact - submit contact form (public)
	r.mux.HandleFunc("POST /api/contact", r.postsHandler(r.contactHandler.SubmitContact, nil))

	// GET /api/contact - list submissions (admin only)
	r.mux.HandleFunc("GET /api/contact", r.postsHandler(r.contactHandler.ListContactSubmissions, middleware.RequireAdmin(r.tokenVerifier)))

	// PATCH /api/contact/:id - update submission status (admin only)
	r.mux.HandleFunc("PATCH /api/contact/{id}", r.postsHandler(r.contactHandler.UpdateContactStatus, middleware.RequireAdmin(r.tokenVerifier)))

	// Stats endpoints
	// POST /api/stats - record stats (admin only - in production would use signed key)
	r.mux.HandleFunc("POST /api/stats", r.postsHandler(r.statsHandler.RecordStats, middleware.RequireAdmin(r.tokenVerifier)))

	// GET /api/stats/:id - get specific stat (admin only)
	r.mux.HandleFunc("GET /api/stats/{id}", r.postsHandler(r.statsHandler.GetStats, middleware.RequireAdmin(r.tokenVerifier)))

	// GET /api/stats - list stats by date range (admin only)
	r.mux.HandleFunc("GET /api/stats", r.postsHandler(r.statsHandler.ListStatsByDateRange, middleware.RequireAdmin(r.tokenVerifier)))

	// GET /api/stats/page/:page_path - list stats by page (admin only)
	r.mux.HandleFunc("GET /api/stats/page/{page_path}", r.postsHandler(r.statsHandler.ListStatsByPage, middleware.RequireAdmin(r.tokenVerifier)))

	// PUT /api/stats/:id - update stat (admin only)
	r.mux.HandleFunc("PUT /api/stats/{id}", r.postsHandler(r.statsHandler.UpdateStats, middleware.RequireAdmin(r.tokenVerifier)))

	return loggingHandler
}

// postsHandler applies optional auth middleware to a handler
func (r *Router) postsHandler(handler http.HandlerFunc, authMiddleware func(http.Handler) http.Handler) http.HandlerFunc {
	if authMiddleware == nil {
		return handler
	}
	return func(w http.ResponseWriter, req *http.Request) {
		authMiddleware(http.HandlerFunc(handler)).ServeHTTP(w, req)
	}
}

// healthCheck handles GET /api/health
func (r *Router) healthCheck(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(view.HealthResponse{
		Status: "healthy",
		Time:   time.Now().UTC(),
	})
}
