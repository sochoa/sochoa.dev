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
// @Summary		Create a new blog post
// @Description	Create a new blog post (admin only)
// @Tags			Posts
// @Accept			json
// @Produce		json
// @Param			request	body		CreatePostRequest	true	"Post request body"
// @Success		201		{object}	view.PostResponse	"Post created successfully"
// @Failure		400		{object}	map[string]string	"Invalid request body"
// @Failure		401		{object}	map[string]string	"Unauthorized"
// @Failure		403		{object}	map[string]string	"Forbidden - admin role required"
// @Router			/api/posts [post]
// @Security		BearerAuth
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
		if status == http.StatusInternalServerError {
			// Log the actual error for debugging
			c.Error(err)
		}
		c.JSON(status, gin.H{"error": message})
		return
	}

	c.JSON(http.StatusCreated, view.ToPostResponse(post))
}

// GetPost handles GET /api/posts/:slug (public)
// @Summary		Get a blog post by slug
// @Description	Get a blog post by slug (public posts visible to all, drafts only to admin)
// @Tags			Posts
// @Produce		json
// @Param			slug	path		string	true	"Post slug"
// @Success		200		{object}	view.PostResponse	"Post found"
// @Failure		400		{object}	map[string]string	"Missing slug parameter"
// @Failure		404		{object}	map[string]string	"Post not found"
// @Router			/api/posts/{slug} [get]
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
// @Summary		List all published blog posts
// @Description	List all published blog posts with optional pagination and tag filtering
// @Tags			Posts
// @Produce		json
// @Param			limit	query		integer	false	"Number of posts per page (default: 10)"
// @Param			offset	query		integer	false	"Number of posts to skip (default: 0)"
// @Param			tag		query		string	false	"Filter posts by tag"
// @Success		200		{array}		view.PostResponse	"List of published posts"
// @Failure		500		{object}	map[string]string	"Internal server error"
// @Router			/api/posts [get]
func (h *PostHandler) ListPublishedPosts(c *gin.Context) {
	limit, offset := parsePaginationGin(c)
	tag := c.Query("tag")

	posts, err := h.postRepo.ListPublished(c, limit, offset, tag)
	if err != nil {
		c.Error(err)
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
// @Summary		Update a blog post
// @Description	Update a blog post by ID (admin only)
// @Tags			Posts
// @Accept			json
// @Produce		json
// @Param			id		path		string				true	"Post ID (UUID)"
// @Param			request	body		UpdatePostRequest	true	"Updated post data"
// @Success		200		{object}	view.PostResponse	"Post updated successfully"
// @Failure		400		{object}	map[string]string	"Invalid request"
// @Failure		401		{object}	map[string]string	"Unauthorized"
// @Failure		403		{object}	map[string]string	"Forbidden - admin role required"
// @Failure		404		{object}	map[string]string	"Post not found"
// @Router			/api/posts/{id} [put]
// @Security		BearerAuth
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
// @Summary		Delete a blog post
// @Description	Delete a blog post by ID (admin only)
// @Tags			Posts
// @Param			id	path	string	true	"Post ID (UUID)"
// @Success		204			"Post deleted successfully"
// @Failure		400	{object}	map[string]string	"Invalid request"
// @Failure		401	{object}	map[string]string	"Unauthorized"
// @Failure		403	{object}	map[string]string	"Forbidden - admin role required"
// @Failure		404	{object}	map[string]string	"Post not found"
// @Router			/api/posts/{id} [delete]
// @Security		BearerAuth
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
