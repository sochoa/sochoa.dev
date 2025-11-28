package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sochoa/sochoa.dev/api/internal/auth"
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
	Slug      string   `json:"slug" binding:"required"`
	Title     string   `json:"title" binding:"required"`
	Summary   string   `json:"summary"`
	Body      string   `json:"body" binding:"required"`
	Tags      []string `json:"tags"`
	Status    string   `json:"status" binding:"required"`
}

// CreatePost handles POST /api/posts (admin only)
func (h *PostHandler) CreatePost(c *gin.Context) {
	user := c.MustGet("user").(*auth.User)
	if !user.IsAdmin() {
		c.JSON(http.StatusForbidden, gin.H{"error": "admin role required"})
		return
	}

	var req CreatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
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

	if err := h.postRepo.Create(c, post); err != nil {
		status, message := statusCodeFromError(err)
		c.JSON(status, gin.H{"error": message})
		return
	}

	c.JSON(http.StatusCreated, view.ToPostResponse(post))
}

// GetPost handles GET /api/posts/:slug (public)
func (h *PostHandler) GetPost(c *gin.Context) {
	slug := c.Param("slug")
	if slug == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "slug is required"})
		return
	}

	post, err := h.postRepo.GetBySlug(c, slug)
	if err != nil {
		status, message := statusCodeFromError(err)
		c.JSON(status, gin.H{"error": message})
		return
	}

	// For public access, only show published posts
	if post.Status != model.PostStatusPublished {
		user, exists := c.Get("user")
		if !exists || user.(*auth.User) == nil || !user.(*auth.User).IsAdmin() {
			c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
			return
		}
	}

	c.JSON(http.StatusOK, view.ToPostResponse(post))
}

// ListPublishedPosts handles GET /api/posts (public)
func (h *PostHandler) ListPublishedPosts(c *gin.Context) {
	limit, offset := parsePaginationGin(c)
	tag := c.Query("tag")

	posts, err := h.postRepo.ListPublished(c, limit, offset, tag)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list posts"})
		return
	}

	c.JSON(http.StatusOK, view.ToPostResponses(posts))
}

// UpdatePostRequest represents the request body for updating a post
type UpdatePostRequest struct {
	Slug      string   `json:"slug" binding:"required"`
	Title     string   `json:"title" binding:"required"`
	Summary   string   `json:"summary"`
	Body      string   `json:"body" binding:"required"`
	Tags      []string `json:"tags"`
	Status    string   `json:"status" binding:"required"`
}

// UpdatePost handles PUT /api/posts/:id (admin only)
func (h *PostHandler) UpdatePost(c *gin.Context) {
	user := c.MustGet("user").(*auth.User)
	if !user.IsAdmin() {
		c.JSON(http.StatusForbidden, gin.H{"error": "admin role required"})
		return
	}

	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id is required"})
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id format"})
		return
	}

	var req UpdatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	post, err := h.postRepo.GetByID(c, id)
	if err != nil {
		status, message := statusCodeFromError(err)
		c.JSON(status, gin.H{"error": message})
		return
	}

	post.Slug = req.Slug
	post.Title = req.Title
	post.Summary = req.Summary
	post.Body = req.Body
	post.Tags = req.Tags
	post.Status = model.PostStatus(req.Status)

	if err := h.postRepo.Update(c, post); err != nil {
		status, message := statusCodeFromError(err)
		c.JSON(status, gin.H{"error": message})
		return
	}

	c.JSON(http.StatusOK, view.ToPostResponse(post))
}

// DeletePost handles DELETE /api/posts/:id (admin only)
func (h *PostHandler) DeletePost(c *gin.Context) {
	user := c.MustGet("user").(*auth.User)
	if !user.IsAdmin() {
		c.JSON(http.StatusForbidden, gin.H{"error": "admin role required"})
		return
	}

	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id is required"})
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id format"})
		return
	}

	if err := h.postRepo.Delete(c, id); err != nil {
		status, message := statusCodeFromError(err)
		c.JSON(status, gin.H{"error": message})
		return
	}

	c.Status(http.StatusNoContent)
}
