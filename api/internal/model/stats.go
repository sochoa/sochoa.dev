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

// VisitorStat represents aggregated visitor statistics for a given date and page
type VisitorStat struct {
	ID             uuid.UUID
	Date           time.Time
	PagePath       string
	Country        *string
	ReferrerDomain *string
	Pageviews      int
	UniqueVisitors int
	LatencyP50     *float64
	LatencyP95     *float64
	LatencyP99     *float64
	Errors4xx      int
	Errors5xx      int
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

// StatsRepository handles visitor stats data access
type StatsRepository struct {
	db db.QueryExecutor
}

// NewStatsRepository creates a new stats repository
func NewStatsRepository(db db.QueryExecutor) *StatsRepository {
	return &StatsRepository{db: db}
}

// Validate ensures the visitor stat meets business requirements
func (s *VisitorStat) Validate() error {
	if s.Date.IsZero() {
		return apierrors.ValidationError{Message: "date is required"}
	}

	if strings.TrimSpace(s.PagePath) == "" {
		return apierrors.ValidationError{Message: "page_path is required"}
	}

	if len(s.PagePath) > 1024 {
		return apierrors.ValidationError{Message: "page_path must be 1024 characters or less"}
	}

	if s.Country != nil && len(*s.Country) > 2 {
		return apierrors.ValidationError{Message: "country must be 2 characters or less (ISO 3166-1 alpha-2)"}
	}

	if s.ReferrerDomain != nil && len(*s.ReferrerDomain) > 255 {
		return apierrors.ValidationError{Message: "referrer_domain must be 255 characters or less"}
	}

	if s.Pageviews < 0 {
		return apierrors.ValidationError{Message: "pageviews cannot be negative"}
	}

	if s.UniqueVisitors < 0 {
		return apierrors.ValidationError{Message: "unique_visitors cannot be negative"}
	}

	if s.Errors4xx < 0 {
		return apierrors.ValidationError{Message: "errors_4xx cannot be negative"}
	}

	if s.Errors5xx < 0 {
		return apierrors.ValidationError{Message: "errors_5xx cannot be negative"}
	}

	return nil
}

// Create inserts a new visitor stat
func (r *StatsRepository) Create(ctx context.Context, stat *VisitorStat) error {
	if stat.ID == uuid.Nil {
		stat.ID = uuid.New()
	}

	if err := stat.Validate(); err != nil {
		return err
	}

	now := time.Now().UTC()
	stat.CreatedAt = now
	stat.UpdatedAt = now

	query := `
		INSERT INTO visitor_stats (id, date, page_path, country, referrer_domain, pageviews, unique_visitors, latency_p50, latency_p95, latency_p99, errors_4xx, errors_5xx, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
	`

	_, err := r.db.ExecContext(ctx, query,
		stat.ID,
		stat.Date,
		stat.PagePath,
		stat.Country,
		stat.ReferrerDomain,
		stat.Pageviews,
		stat.UniqueVisitors,
		stat.LatencyP50,
		stat.LatencyP95,
		stat.LatencyP99,
		stat.Errors4xx,
		stat.Errors5xx,
		stat.CreatedAt,
		stat.UpdatedAt,
	)

	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "UNIQUE") {
			return apierrors.ConflictError{Message: "stat for this date and page_path already exists"}
		}
		return fmt.Errorf("failed to create visitor stat: %w", err)
	}

	return nil
}

// GetByID retrieves a visitor stat by ID
func (r *StatsRepository) GetByID(ctx context.Context, id uuid.UUID) (*VisitorStat, error) {
	stat := &VisitorStat{}

	query := `
		SELECT id, date, page_path, country, referrer_domain, pageviews, unique_visitors, latency_p50, latency_p95, latency_p99, errors_4xx, errors_5xx, created_at, updated_at
		FROM visitor_stats
		WHERE id = $1
	`

	row := r.db.QueryRowContext(ctx, query, id)
	err := row.Scan(
		&stat.ID,
		&stat.Date,
		&stat.PagePath,
		&stat.Country,
		&stat.ReferrerDomain,
		&stat.Pageviews,
		&stat.UniqueVisitors,
		&stat.LatencyP50,
		&stat.LatencyP95,
		&stat.LatencyP99,
		&stat.Errors4xx,
		&stat.Errors5xx,
		&stat.CreatedAt,
		&stat.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, context.Canceled) {
			return nil, err
		}
		return nil, apierrors.NotFoundError{Message: "visitor stat not found"}
	}

	return stat, nil
}

// GetByDateAndPath retrieves a visitor stat by date and page path
func (r *StatsRepository) GetByDateAndPath(ctx context.Context, date time.Time, pagePath string) (*VisitorStat, error) {
	stat := &VisitorStat{}

	query := `
		SELECT id, date, page_path, country, referrer_domain, pageviews, unique_visitors, latency_p50, latency_p95, latency_p99, errors_4xx, errors_5xx, created_at, updated_at
		FROM visitor_stats
		WHERE date = $1 AND page_path = $2
	`

	row := r.db.QueryRowContext(ctx, query, date, pagePath)
	err := row.Scan(
		&stat.ID,
		&stat.Date,
		&stat.PagePath,
		&stat.Country,
		&stat.ReferrerDomain,
		&stat.Pageviews,
		&stat.UniqueVisitors,
		&stat.LatencyP50,
		&stat.LatencyP95,
		&stat.LatencyP99,
		&stat.Errors4xx,
		&stat.Errors5xx,
		&stat.CreatedAt,
		&stat.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, context.Canceled) {
			return nil, err
		}
		return nil, apierrors.NotFoundError{Message: "visitor stat not found"}
	}

	return stat, nil
}

// ListByDateRange retrieves all visitor stats within a date range
func (r *StatsRepository) ListByDateRange(ctx context.Context, startDate, endDate time.Time, limit int, offset int) ([]VisitorStat, error) {
	query := `
		SELECT id, date, page_path, country, referrer_domain, pageviews, unique_visitors, latency_p50, latency_p95, latency_p99, errors_4xx, errors_5xx, created_at, updated_at
		FROM visitor_stats
		WHERE date >= $1 AND date <= $2
		ORDER BY date DESC, page_path ASC
		LIMIT $3 OFFSET $4
	`

	rows, err := r.db.QueryContext(ctx, query, startDate, endDate, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list visitor stats: %w", err)
	}
	defer rows.Close()

	var stats []VisitorStat
	for rows.Next() {
		stat := VisitorStat{}
		err := rows.Scan(
			&stat.ID,
			&stat.Date,
			&stat.PagePath,
			&stat.Country,
			&stat.ReferrerDomain,
			&stat.Pageviews,
			&stat.UniqueVisitors,
			&stat.LatencyP50,
			&stat.LatencyP95,
			&stat.LatencyP99,
			&stat.Errors4xx,
			&stat.Errors5xx,
			&stat.CreatedAt,
			&stat.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan visitor stat: %w", err)
		}
		stats = append(stats, stat)
	}

	return stats, rows.Err()
}

// ListByPage retrieves all visitor stats for a specific page path
func (r *StatsRepository) ListByPage(ctx context.Context, pagePath string, limit int, offset int) ([]VisitorStat, error) {
	query := `
		SELECT id, date, page_path, country, referrer_domain, pageviews, unique_visitors, latency_p50, latency_p95, latency_p99, errors_4xx, errors_5xx, created_at, updated_at
		FROM visitor_stats
		WHERE page_path = $1
		ORDER BY date DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.QueryContext(ctx, query, pagePath, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list visitor stats by page: %w", err)
	}
	defer rows.Close()

	var stats []VisitorStat
	for rows.Next() {
		stat := VisitorStat{}
		err := rows.Scan(
			&stat.ID,
			&stat.Date,
			&stat.PagePath,
			&stat.Country,
			&stat.ReferrerDomain,
			&stat.Pageviews,
			&stat.UniqueVisitors,
			&stat.LatencyP50,
			&stat.LatencyP95,
			&stat.LatencyP99,
			&stat.Errors4xx,
			&stat.Errors5xx,
			&stat.CreatedAt,
			&stat.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan visitor stat: %w", err)
		}
		stats = append(stats, stat)
	}

	return stats, rows.Err()
}

// Update updates an existing visitor stat
func (r *StatsRepository) Update(ctx context.Context, stat *VisitorStat) error {
	if stat.ID == uuid.Nil {
		return apierrors.ValidationError{Message: "stat ID is required"}
	}

	if err := stat.Validate(); err != nil {
		return err
	}

	stat.UpdatedAt = time.Now().UTC()

	query := `
		UPDATE visitor_stats
		SET date = $1, page_path = $2, country = $3, referrer_domain = $4, pageviews = $5, unique_visitors = $6, latency_p50 = $7, latency_p95 = $8, latency_p99 = $9, errors_4xx = $10, errors_5xx = $11, updated_at = $12
		WHERE id = $13
	`

	result, err := r.db.ExecContext(ctx, query,
		stat.Date,
		stat.PagePath,
		stat.Country,
		stat.ReferrerDomain,
		stat.Pageviews,
		stat.UniqueVisitors,
		stat.LatencyP50,
		stat.LatencyP95,
		stat.LatencyP99,
		stat.Errors4xx,
		stat.Errors5xx,
		stat.UpdatedAt,
		stat.ID,
	)

	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "UNIQUE") {
			return apierrors.ConflictError{Message: "stat for this date and page_path already exists"}
		}
		return fmt.Errorf("failed to update visitor stat: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rows == 0 {
		return apierrors.NotFoundError{Message: "visitor stat not found"}
	}

	return nil
}

// Delete removes a visitor stat
func (r *StatsRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM visitor_stats WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete visitor stat: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rows == 0 {
		return apierrors.NotFoundError{Message: "visitor stat not found"}
	}

	return nil
}

// DeleteExpiredByDate deletes all visitor stats older than the specified date
func (r *StatsRepository) DeleteExpiredByDate(ctx context.Context, beforeDate time.Time) (int64, error) {
	query := `DELETE FROM visitor_stats WHERE date < $1`

	result, err := r.db.ExecContext(ctx, query, beforeDate)
	if err != nil {
		return 0, fmt.Errorf("failed to delete expired visitor stats: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return 0, fmt.Errorf("failed to get rows affected: %w", err)
	}

	return rows, nil
}
