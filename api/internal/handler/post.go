package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/google/uuid"
	apierrors "github.com/sochoa/sochoa.dev/api/internal/errors"
	"github.com/sochoa/sochoa.dev/api/internal/middleware"
	"github.com/sochoa/sochoa.dev/api/internal/model"
	"github.com/sochoa/sochoa.dev/api/internal/view"
)

// PostHandler handles post-related HTTP requests
type PostHandler struct {
	postRepo *model.PostRepository
}

// NewPostHandler creates a new post handler
func NewPostHandler(postRepo *model.PostRepository) *PostHandler {
	return &PostHandler{
		postRepo: postRepo,
	}
}

// CreatePostRequest represents the request body for creating a post
type CreatePostRequest struct {
	Slug      string   `json:"slug"`
	Title     string   `json:"title"`
	Summary   string   `json:"summary"`
	Body      string   `json:"body"`
	Tags      []string `json:"tags"`
	Status    string   `json:"status"`
}

// CreatePost handles POST /api/posts (admin only)
func (h *PostHandler) CreatePost(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r)
	if user == nil || !user.IsAdmin() {
		writeJSONError(w, http.StatusForbidden, "admin role required")
		return
	}

	var req CreatePostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	post := &model.Post{
		Slug:    req.Slug,
		Title:   req.Title,
		Summary: req.Summary,
		Body:    req.Body,
		Tags:    req.Tags,
		Status:  model.PostStatus(req.Status),
	}

	if err := h.postRepo.Create(r.Context(), post); err != nil {
		status, message := statusCodeFromError(err)
		writeJSONError(w, status, message)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(view.ToPostResponse(post))
}

// GetPost handles GET /api/posts/:slug (public)
func (h *PostHandler) GetPost(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("slug")
	if slug == "" {
		writeJSONError(w, http.StatusBadRequest, "slug is required")
		return
	}

	post, err := h.postRepo.GetBySlug(r.Context(), slug)
	if err != nil {
		status, message := statusCodeFromError(err)
		writeJSONError(w, status, message)
		return
	}

	// For public access, only show published posts
	if post.Status != model.PostStatusPublished {
		user := middleware.UserFromContext(r)
		if user == nil || !user.IsAdmin() {
			writeJSONError(w, http.StatusNotFound, "post not found")
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(view.ToPostResponse(post))
}

// ListPublishedPosts handles GET /api/posts (public)
func (h *PostHandler) ListPublishedPosts(w http.ResponseWriter, r *http.Request) {
	limit, offset := parsePagination(r)
	tag := r.URL.Query().Get("tag")

	posts, err := h.postRepo.ListPublished(r.Context(), limit, offset, tag)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to list posts")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(view.ToPostResponses(posts))
}

// UpdatePostRequest represents the request body for updating a post
type UpdatePostRequest struct {
	Slug      string   `json:"slug"`
	Title     string   `json:"title"`
	Summary   string   `json:"summary"`
	Body      string   `json:"body"`
	Tags      []string `json:"tags"`
	Status    string   `json:"status"`
}

// UpdatePost handles PUT /api/posts/:id (admin only)
func (h *PostHandler) UpdatePost(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r)
	if user == nil || !user.IsAdmin() {
		writeJSONError(w, http.StatusForbidden, "admin role required")
		return
	}

	idStr := r.PathValue("id")
	if idStr == "" {
		writeJSONError(w, http.StatusBadRequest, "id is required")
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid id format")
		return
	}

	var req UpdatePostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	post, err := h.postRepo.GetByID(r.Context(), id)
	if err != nil {
		status, message := statusCodeFromError(err)
		writeJSONError(w, status, message)
		return
	}

	post.Slug = req.Slug
	post.Title = req.Title
	post.Summary = req.Summary
	post.Body = req.Body
	post.Tags = req.Tags
	post.Status = model.PostStatus(req.Status)

	if err := h.postRepo.Update(r.Context(), post); err != nil {
		status, message := statusCodeFromError(err)
		writeJSONError(w, status, message)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(view.ToPostResponse(post))
}

// DeletePost handles DELETE /api/posts/:id (admin only)
func (h *PostHandler) DeletePost(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r)
	if user == nil || !user.IsAdmin() {
		writeJSONError(w, http.StatusForbidden, "admin role required")
		return
	}

	idStr := r.PathValue("id")
	if idStr == "" {
		writeJSONError(w, http.StatusBadRequest, "id is required")
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid id format")
		return
	}

	if err := h.postRepo.Delete(r.Context(), id); err != nil {
		status, message := statusCodeFromError(err)
		writeJSONError(w, status, message)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// helper functions

func parsePagination(r *http.Request) (limit, offset int) {
	limit = 10
	offset = 0

	if l := r.URL.Query().Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	if o := r.URL.Query().Get("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	return
}

func statusCodeFromError(err error) (int, string) {
	var validationErr apierrors.ValidationError
	var notFoundErr apierrors.NotFoundError
	var conflictErr apierrors.ConflictError
	var forbiddenErr apierrors.ForbiddenError

	if errors.As(err, &validationErr) {
		return http.StatusBadRequest, validationErr.Message
	}
	if errors.As(err, &notFoundErr) {
		return http.StatusNotFound, notFoundErr.Message
	}
	if errors.As(err, &conflictErr) {
		return http.StatusConflict, conflictErr.Message
	}
	if errors.As(err, &forbiddenErr) {
		return http.StatusForbidden, forbiddenErr.Message
	}

	return http.StatusInternalServerError, "internal server error"
}

func writeJSONError(w http.ResponseWriter, statusCode int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(view.ErrorResponse{Error: message})
}
