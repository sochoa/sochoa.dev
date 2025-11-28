package model

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/sochoa/sochoa.dev/api/internal/db"
	apierrors "github.com/sochoa/sochoa.dev/api/internal/errors"
)

// PostStatus represents the state of a post
type PostStatus string

const (
	PostStatusDraft     PostStatus = "draft"
	PostStatusPublished PostStatus = "published"
	PostStatusArchived  PostStatus = "archived"
)

// Post represents a blog post
type Post struct {
	ID          uuid.UUID
	Slug        string
	Title       string
	Summary     string
	Body        string
	Tags        []string
	Status      PostStatus
	PublishedAt *time.Time
	UpdatedAt   time.Time
	CreatedAt   time.Time
}

// PostRepository handles post data access
type PostRepository struct {
	db db.QueryExecutor
}

// NewPostRepository creates a new post repository
func NewPostRepository(db db.QueryExecutor) *PostRepository {
	return &PostRepository{db: db}
}

// Validate ensures the post meets business requirements
func (p *Post) Validate() error {
	if strings.TrimSpace(p.Slug) == "" {
		return apierrors.ValidationError{Message: "slug is required"}
	}

	if !isValidSlug(p.Slug) {
		return apierrors.ValidationError{Message: "slug must be lowercase alphanumeric with hyphens only"}
	}

	if strings.TrimSpace(p.Title) == "" {
		return apierrors.ValidationError{Message: "title is required"}
	}

	if len(p.Title) > 255 {
		return apierrors.ValidationError{Message: "title must be 255 characters or less"}
	}

	if strings.TrimSpace(p.Body) == "" {
		return apierrors.ValidationError{Message: "body is required"}
	}

	if p.Status != PostStatusDraft && p.Status != PostStatusPublished && p.Status != PostStatusArchived {
		return apierrors.ValidationError{Message: "invalid post status"}
	}

	if p.Status == PostStatusPublished && p.PublishedAt == nil {
		return apierrors.ValidationError{Message: "published posts must have a published_at timestamp"}
	}

	return nil
}

// Create inserts a new post
func (r *PostRepository) Create(ctx context.Context, post *Post) error {
	if post.ID == uuid.Nil {
		post.ID = uuid.New()
	}

	if err := post.Validate(); err != nil {
		return err
	}

	now := time.Now().UTC()
	post.CreatedAt = now
	post.UpdatedAt = now

	if post.Status == PostStatusPublished && post.PublishedAt == nil {
		post.PublishedAt = &now
	}

	query := `
		INSERT INTO posts (id, slug, title, summary, body, tags, status, published_at, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`

	_, err := r.db.ExecContext(ctx, query,
		post.ID,
		post.Slug,
		post.Title,
		post.Summary,
		post.Body,
		post.Tags,
		post.Status,
		post.PublishedAt,
		post.CreatedAt,
		post.UpdatedAt,
	)

	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			return apierrors.ConflictError{Message: fmt.Sprintf("post with slug '%s' already exists", post.Slug)}
		}
		return fmt.Errorf("failed to create post: %w", err)
	}

	return nil
}

// GetBySlug retrieves a post by its slug
func (r *PostRepository) GetBySlug(ctx context.Context, slug string) (*Post, error) {
	post := &Post{}

	query := `
		SELECT id, slug, title, summary, body, tags, status, published_at, created_at, updated_at
		FROM posts
		WHERE slug = $1
	`

	row := r.db.QueryRowContext(ctx, query, slug)
	err := row.Scan(
		&post.ID,
		&post.Slug,
		&post.Title,
		&post.Summary,
		&post.Body,
		&post.Tags,
		&post.Status,
		&post.PublishedAt,
		&post.CreatedAt,
		&post.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, context.Canceled) {
			return nil, err
		}
		return nil, apierrors.NotFoundError{Message: "post not found"}
	}

	return post, nil
}

// GetByID retrieves a post by its ID
func (r *PostRepository) GetByID(ctx context.Context, id uuid.UUID) (*Post, error) {
	post := &Post{}

	query := `
		SELECT id, slug, title, summary, body, tags, status, published_at, created_at, updated_at
		FROM posts
		WHERE id = $1
	`

	row := r.db.QueryRowContext(ctx, query, id)
	err := row.Scan(
		&post.ID,
		&post.Slug,
		&post.Title,
		&post.Summary,
		&post.Body,
		&post.Tags,
		&post.Status,
		&post.PublishedAt,
		&post.CreatedAt,
		&post.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, context.Canceled) {
			return nil, err
		}
		return nil, apierrors.NotFoundError{Message: "post not found"}
	}

	return post, nil
}

// ListPublished retrieves all published posts, optionally filtered by tag
func (r *PostRepository) ListPublished(ctx context.Context, limit int, offset int, tag string) ([]Post, error) {
	query := `
		SELECT id, slug, title, summary, body, tags, status, published_at, created_at, updated_at
		FROM posts
		WHERE status = $1
	`
	args := []interface{}{PostStatusPublished}

	if tag != "" {
		query += ` AND $4::TEXT = ANY(tags)`
		args = append(args, tag)
	}

	query += ` ORDER BY published_at DESC NULLS LAST LIMIT $2 OFFSET $3`
	args = append([]interface{}{PostStatusPublished, limit, offset}, args[1:]...)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to list published posts: %w", err)
	}
	defer rows.Close()

	var posts []Post
	for rows.Next() {
		post := Post{}
		err := rows.Scan(
			&post.ID,
			&post.Slug,
			&post.Title,
			&post.Summary,
			&post.Body,
			&post.Tags,
			&post.Status,
			&post.PublishedAt,
			&post.CreatedAt,
			&post.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan post: %w", err)
		}
		posts = append(posts, post)
	}

	return posts, rows.Err()
}

// Update updates an existing post
func (r *PostRepository) Update(ctx context.Context, post *Post) error {
	if post.ID == uuid.Nil {
		return apierrors.ValidationError{Message: "post ID is required"}
	}

	if err := post.Validate(); err != nil {
		return err
	}

	post.UpdatedAt = time.Now().UTC()

	if post.Status == PostStatusPublished && post.PublishedAt == nil {
		post.PublishedAt = &post.UpdatedAt
	}

	query := `
		UPDATE posts
		SET slug = $1, title = $2, summary = $3, body = $4, tags = $5, status = $6, published_at = $7, updated_at = $8
		WHERE id = $9
	`

	result, err := r.db.ExecContext(ctx, query,
		post.Slug,
		post.Title,
		post.Summary,
		post.Body,
		post.Tags,
		post.Status,
		post.PublishedAt,
		post.UpdatedAt,
		post.ID,
	)

	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			return apierrors.ConflictError{Message: fmt.Sprintf("post with slug '%s' already exists", post.Slug)}
		}
		return fmt.Errorf("failed to update post: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rows == 0 {
		return apierrors.NotFoundError{Message: "post not found"}
	}

	return nil
}

// Delete removes a post
func (r *PostRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM posts WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete post: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rows == 0 {
		return apierrors.NotFoundError{Message: "post not found"}
	}

	return nil
}

// isValidSlug validates that a slug is lowercase alphanumeric with hyphens
func isValidSlug(slug string) bool {
	matched, _ := regexp.MatchString(`^[a-z0-9]+(?:-[a-z0-9]+)*$`, slug)
	return matched
}
