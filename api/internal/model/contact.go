package model

import (
	"context"
	"errors"
	"fmt"
	"net/mail"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/sochoa/sochoa.dev/api/internal/db"
	apierrors "github.com/sochoa/sochoa.dev/api/internal/errors"
)

// ContactStatus represents the state of a contact submission
type ContactStatus string

const (
	ContactStatusReceived ContactStatus = "received"
	ContactStatusRead     ContactStatus = "read"
	ContactStatusReplied  ContactStatus = "replied"
)

// ContactSubmission represents a contact form submission
type ContactSubmission struct {
	ID        uuid.UUID
	Email     string
	Name      string
	Message   string
	Status    ContactStatus
	ExpiresAt time.Time
	CreatedAt time.Time
}

// ContactRepository handles contact submission data access
type ContactRepository struct {
	db db.QueryExecutor
}

// NewContactRepository creates a new contact repository
func NewContactRepository(db db.QueryExecutor) *ContactRepository {
	return &ContactRepository{db: db}
}

// Validate ensures the contact submission meets business requirements
func (c *ContactSubmission) Validate() error {
	if strings.TrimSpace(c.Email) == "" {
		return apierrors.ValidationError{Message: "email is required"}
	}

	if _, err := mail.ParseAddress(c.Email); err != nil {
		return apierrors.ValidationError{Message: "invalid email address"}
	}

	if len(c.Email) > 255 {
		return apierrors.ValidationError{Message: "email must be 255 characters or less"}
	}

	if strings.TrimSpace(c.Name) == "" {
		return apierrors.ValidationError{Message: "name is required"}
	}

	if len(c.Name) > 255 {
		return apierrors.ValidationError{Message: "name must be 255 characters or less"}
	}

	if strings.TrimSpace(c.Message) == "" {
		return apierrors.ValidationError{Message: "message is required"}
	}

	if len(c.Message) > 5000 {
		return apierrors.ValidationError{Message: "message must be 5000 characters or less"}
	}

	// Check for HTML/links (basic validation)
	if strings.Contains(c.Message, "<") || strings.Contains(c.Message, ">") {
		return apierrors.ValidationError{Message: "message contains invalid characters"}
	}

	if c.Status != ContactStatusReceived && c.Status != ContactStatusRead && c.Status != ContactStatusReplied {
		return apierrors.ValidationError{Message: "invalid contact status"}
	}

	if c.ExpiresAt.IsZero() {
		return apierrors.ValidationError{Message: "expires_at is required"}
	}

	if c.ExpiresAt.Before(time.Now().UTC()) {
		return apierrors.ValidationError{Message: "expires_at must be in the future"}
	}

	return nil
}

// Create inserts a new contact submission
func (r *ContactRepository) Create(ctx context.Context, submission *ContactSubmission) error {
	if submission.ID == uuid.Nil {
		submission.ID = uuid.New()
	}

	if err := submission.Validate(); err != nil {
		return err
	}

	submission.CreatedAt = time.Now().UTC()
	if submission.Status == "" {
		submission.Status = ContactStatusReceived
	}

	query := `
		INSERT INTO contact_submissions (id, email, name, message, status, expires_at, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	_, err := r.db.ExecContext(ctx, query,
		submission.ID,
		submission.Email,
		submission.Name,
		submission.Message,
		submission.Status,
		submission.ExpiresAt,
		submission.CreatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create contact submission: %w", err)
	}

	return nil
}

// GetByID retrieves a contact submission by ID
func (r *ContactRepository) GetByID(ctx context.Context, id uuid.UUID) (*ContactSubmission, error) {
	submission := &ContactSubmission{}

	query := `
		SELECT id, email, name, message, status, expires_at, created_at
		FROM contact_submissions
		WHERE id = $1
	`

	row := r.db.QueryRowContext(ctx, query, id)
	err := row.Scan(
		&submission.ID,
		&submission.Email,
		&submission.Name,
		&submission.Message,
		&submission.Status,
		&submission.ExpiresAt,
		&submission.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, context.Canceled) {
			return nil, err
		}
		return nil, apierrors.NotFoundError{Message: "contact submission not found"}
	}

	return submission, nil
}

// ListActive retrieves all contact submissions that haven't expired, ordered by creation time (newest first)
func (r *ContactRepository) ListActive(ctx context.Context, limit int, offset int) ([]ContactSubmission, error) {
	now := time.Now().UTC()
	query := `
		SELECT id, email, name, message, status, expires_at, created_at
		FROM contact_submissions
		WHERE expires_at > $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.QueryContext(ctx, query, now, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list active contact submissions: %w", err)
	}
	defer rows.Close()

	var submissions []ContactSubmission
	for rows.Next() {
		submission := ContactSubmission{}
		err := rows.Scan(
			&submission.ID,
			&submission.Email,
			&submission.Name,
			&submission.Message,
			&submission.Status,
			&submission.ExpiresAt,
			&submission.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan contact submission: %w", err)
		}
		submissions = append(submissions, submission)
	}

	return submissions, rows.Err()
}

// ListByStatus retrieves all active contact submissions with a specific status
func (r *ContactRepository) ListByStatus(ctx context.Context, status ContactStatus, limit int, offset int) ([]ContactSubmission, error) {
	now := time.Now().UTC()
	query := `
		SELECT id, email, name, message, status, expires_at, created_at
		FROM contact_submissions
		WHERE status = $1 AND expires_at > $2
		ORDER BY created_at DESC
		LIMIT $3 OFFSET $4
	`

	rows, err := r.db.QueryContext(ctx, query, status, now, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list contact submissions by status: %w", err)
	}
	defer rows.Close()

	var submissions []ContactSubmission
	for rows.Next() {
		submission := ContactSubmission{}
		err := rows.Scan(
			&submission.ID,
			&submission.Email,
			&submission.Name,
			&submission.Message,
			&submission.Status,
			&submission.ExpiresAt,
			&submission.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan contact submission: %w", err)
		}
		submissions = append(submissions, submission)
	}

	return submissions, rows.Err()
}

// UpdateStatus updates a contact submission's status
func (r *ContactRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status ContactStatus) error {
	if status != ContactStatusReceived && status != ContactStatusRead && status != ContactStatusReplied {
		return apierrors.ValidationError{Message: "invalid contact status"}
	}

	query := `UPDATE contact_submissions SET status = $1 WHERE id = $2`

	result, err := r.db.ExecContext(ctx, query, status, id)
	if err != nil {
		return fmt.Errorf("failed to update contact submission status: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rows == 0 {
		return apierrors.NotFoundError{Message: "contact submission not found"}
	}

	return nil
}

// CountByEmailInTimeWindow returns the number of submissions from an email in the given time window
// Used for rate limiting checks
func (r *ContactRepository) CountByEmailInTimeWindow(ctx context.Context, email string, since time.Time) (int, error) {
	query := `
		SELECT COUNT(*)
		FROM contact_submissions
		WHERE email = $1 AND created_at >= $2
	`

	var count int
	row := r.db.QueryRowContext(ctx, query, email, since)
	if err := row.Scan(&count); err != nil {
		return 0, fmt.Errorf("failed to count submissions: %w", err)
	}

	return count, nil
}
