package model

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/sochoa/sochoa.dev/api/internal/db"
	apierrors "github.com/sochoa/sochoa.dev/api/internal/errors"
)

// GuestbookEntry represents an entry in the guestbook
type GuestbookEntry struct {
	ID           uuid.UUID
	UserProvider string // google, linkedin
	UserID       string
	DisplayName  string
	Message      string
	IsApproved   bool
	DeletedAt    *time.Time
	CreatedAt    time.Time
}

// GuestbookRepository handles guestbook data access
type GuestbookRepository struct {
	db db.QueryExecutor
}

// NewGuestbookRepository creates a new guestbook repository
func NewGuestbookRepository(db db.QueryExecutor) *GuestbookRepository {
	return &GuestbookRepository{db: db}
}

// Validate ensures the guestbook entry meets business requirements
func (g *GuestbookEntry) Validate() error {
	if strings.TrimSpace(g.UserProvider) == "" {
		return apierrors.ValidationError{Message: "user_provider is required"}
	}

	validProviders := map[string]bool{"google": true, "linkedin": true}
	if !validProviders[g.UserProvider] {
		return apierrors.ValidationError{Message: "invalid user_provider, must be 'google' or 'linkedin'"}
	}

	if strings.TrimSpace(g.UserID) == "" {
		return apierrors.ValidationError{Message: "user_id is required"}
	}

	if strings.TrimSpace(g.DisplayName) == "" {
		return apierrors.ValidationError{Message: "display_name is required"}
	}

	if len(g.DisplayName) > 255 {
		return apierrors.ValidationError{Message: "display_name must be 255 characters or less"}
	}

	if strings.TrimSpace(g.Message) == "" {
		return apierrors.ValidationError{Message: "message is required"}
	}

	if len(g.Message) > 500 {
		return apierrors.ValidationError{Message: "message must be 500 characters or less"}
	}

	// Check for HTML/links (basic validation - strip dangerous content)
	if strings.Contains(g.Message, "<") || strings.Contains(g.Message, ">") {
		return apierrors.ValidationError{Message: "message contains invalid characters"}
	}

	return nil
}

// Create inserts a new guestbook entry
func (r *GuestbookRepository) Create(ctx context.Context, entry *GuestbookEntry) error {
	if entry.ID == uuid.Nil {
		entry.ID = uuid.New()
	}

	if err := entry.Validate(); err != nil {
		return err
	}

	now := time.Now().UTC()
	entry.CreatedAt = now

	query := `
		INSERT INTO guestbook_entries (id, user_provider, user_id, display_name, message, approved, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	_, err := r.db.ExecContext(ctx, query,
		entry.ID,
		entry.UserProvider,
		entry.UserID,
		entry.DisplayName,
		entry.Message,
		entry.IsApproved,
		entry.CreatedAt,
		now,
	)

	if err != nil {
		return fmt.Errorf("failed to create guestbook entry: %w", err)
	}

	return nil
}

// GetByID retrieves a guestbook entry by ID
func (r *GuestbookRepository) GetByID(ctx context.Context, id uuid.UUID) (*GuestbookEntry, error) {
	entry := &GuestbookEntry{}

	query := `
		SELECT id, user_provider, user_id, display_name, message, approved, deleted_at, created_at
		FROM guestbook_entries
		WHERE id = $1
	`

	row := r.db.QueryRowContext(ctx, query, id)
	err := row.Scan(
		&entry.ID,
		&entry.UserProvider,
		&entry.UserID,
		&entry.DisplayName,
		&entry.Message,
		&entry.IsApproved,
		&entry.DeletedAt,
		&entry.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, context.Canceled) {
			return nil, err
		}
		return nil, apierrors.NotFoundError{Message: "guestbook entry not found"}
	}

	return entry, nil
}

// ListApproved retrieves all approved guestbook entries, ordered by creation time (newest first)
func (r *GuestbookRepository) ListApproved(ctx context.Context, limit int, offset int) ([]GuestbookEntry, error) {
	query := `
		SELECT id, user_provider, user_id, display_name, message, approved, deleted_at, created_at
		FROM guestbook_entries
		WHERE approved = true AND deleted_at IS NULL
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := r.db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list approved guestbook entries: %w", err)
	}
	defer rows.Close()

	var entries []GuestbookEntry
	for rows.Next() {
		entry := GuestbookEntry{}
		err := rows.Scan(
			&entry.ID,
			&entry.UserProvider,
			&entry.UserID,
			&entry.DisplayName,
			&entry.Message,
			&entry.IsApproved,
			&entry.DeletedAt,
			&entry.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan guestbook entry: %w", err)
		}
		entries = append(entries, entry)
	}

	return entries, rows.Err()
}

// ListPending retrieves all pending (not approved) guestbook entries for moderation
func (r *GuestbookRepository) ListPending(ctx context.Context, limit int, offset int) ([]GuestbookEntry, error) {
	query := `
		SELECT id, user_provider, user_id, display_name, message, approved, deleted_at, created_at
		FROM guestbook_entries
		WHERE approved = false AND deleted_at IS NULL
		ORDER BY created_at ASC
		LIMIT $1 OFFSET $2
	`

	rows, err := r.db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list pending guestbook entries: %w", err)
	}
	defer rows.Close()

	var entries []GuestbookEntry
	for rows.Next() {
		entry := GuestbookEntry{}
		err := rows.Scan(
			&entry.ID,
			&entry.UserProvider,
			&entry.UserID,
			&entry.DisplayName,
			&entry.Message,
			&entry.IsApproved,
			&entry.DeletedAt,
			&entry.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan guestbook entry: %w", err)
		}
		entries = append(entries, entry)
	}

	return entries, rows.Err()
}

// Approve marks a guestbook entry as approved
func (r *GuestbookRepository) Approve(ctx context.Context, id uuid.UUID) error {
	query := `UPDATE guestbook_entries SET approved = true WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to approve guestbook entry: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rows == 0 {
		return apierrors.NotFoundError{Message: "guestbook entry not found"}
	}

	return nil
}

// Delete marks a guestbook entry as deleted (soft delete)
func (r *GuestbookRepository) Delete(ctx context.Context, id uuid.UUID) error {
	now := time.Now().UTC()
	query := `UPDATE guestbook_entries SET deleted_at = $1 WHERE id = $2`

	result, err := r.db.ExecContext(ctx, query, now, id)
	if err != nil {
		return fmt.Errorf("failed to delete guestbook entry: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rows == 0 {
		return apierrors.NotFoundError{Message: "guestbook entry not found"}
	}

	return nil
}

// CountByUserInTimeWindow returns the number of entries by a user in the given time window
// Used for rate limiting checks
func (r *GuestbookRepository) CountByUserInTimeWindow(ctx context.Context, userProvider, userID string, since time.Time) (int, error) {
	query := `
		SELECT COUNT(*)
		FROM guestbook_entries
		WHERE user_provider = $1 AND user_id = $2 AND created_at >= $3 AND deleted_at IS NULL
	`

	var count int
	row := r.db.QueryRowContext(ctx, query, userProvider, userID, since)
	if err := row.Scan(&count); err != nil {
		return 0, fmt.Errorf("failed to count entries: %w", err)
	}

	return count, nil
}
