package model

import (
	"context"
	"database/sql"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestVisitorStatValidate(t *testing.T) {
	now := time.Now().UTC()
	country := "US"
	domain := "example.com"

	tests := []struct {
		name      string
		stat      *VisitorStat
		shouldErr bool
	}{
		{
			name: "valid stat",
			stat: &VisitorStat{
				Date:           now,
				PagePath:       "/index",
				Pageviews:      100,
				UniqueVisitors: 50,
			},
			shouldErr: false,
		},
		{
			name: "valid stat with all fields",
			stat: &VisitorStat{
				Date:           now,
				PagePath:       "/blog/post-1",
				Country:        &country,
				ReferrerDomain: &domain,
				Pageviews:      100,
				UniqueVisitors: 50,
				Errors4xx:      2,
				Errors5xx:      1,
			},
			shouldErr: false,
		},
		{
			name: "missing date",
			stat: &VisitorStat{
				PagePath:       "/index",
				Pageviews:      100,
				UniqueVisitors: 50,
			},
			shouldErr: true,
		},
		{
			name: "missing page_path",
			stat: &VisitorStat{
				Date:           now,
				Pageviews:      100,
				UniqueVisitors: 50,
			},
			shouldErr: true,
		},
		{
			name: "page_path too long",
			stat: &VisitorStat{
				Date:           now,
				PagePath:       string(make([]byte, 1025)),
				Pageviews:      100,
				UniqueVisitors: 50,
			},
			shouldErr: true,
		},
		{
			name: "country too long",
			stat: &VisitorStat{
				Date:      now,
				PagePath:  "/index",
				Country:   stringPtr("USA"),
				Pageviews: 100,
			},
			shouldErr: true,
		},
		{
			name: "referrer_domain too long",
			stat: &VisitorStat{
				Date:           now,
				PagePath:       "/index",
				ReferrerDomain: stringPtr(string(make([]byte, 256))),
				Pageviews:      100,
			},
			shouldErr: true,
		},
		{
			name: "negative pageviews",
			stat: &VisitorStat{
				Date:      now,
				PagePath:  "/index",
				Pageviews: -1,
			},
			shouldErr: true,
		},
		{
			name: "negative unique_visitors",
			stat: &VisitorStat{
				Date:           now,
				PagePath:       "/index",
				Pageviews:      100,
				UniqueVisitors: -1,
			},
			shouldErr: true,
		},
		{
			name: "negative errors_4xx",
			stat: &VisitorStat{
				Date:      now,
				PagePath:  "/index",
				Pageviews: 100,
				Errors4xx: -1,
			},
			shouldErr: true,
		},
		{
			name: "negative errors_5xx",
			stat: &VisitorStat{
				Date:      now,
				PagePath:  "/index",
				Pageviews: 100,
				Errors5xx: -1,
			},
			shouldErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.stat.Validate()
			if tt.shouldErr && err == nil {
				t.Fatalf("expected error, got nil")
			}
			if !tt.shouldErr && err != nil {
				t.Fatalf("expected no error, got %v", err)
			}
		})
	}
}

func TestStatsRepositoryCreate(t *testing.T) {
	ctx := context.Background()
	now := time.Now().UTC()

	tests := []struct {
		name      string
		stat      *VisitorStat
		execFunc  func(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
		shouldErr bool
	}{
		{
			name: "create valid stat",
			stat: &VisitorStat{
				Date:           now,
				PagePath:       "/index",
				Pageviews:      100,
				UniqueVisitors: 50,
			},
			execFunc: func(ctx context.Context, query string, args ...interface{}) (sql.Result, error) {
				return mockResult{rowsAffected: 1}, nil
			},
			shouldErr: false,
		},
		{
			name: "duplicate stat",
			stat: &VisitorStat{
				Date:           now,
				PagePath:       "/index",
				Pageviews:      100,
				UniqueVisitors: 50,
			},
			execFunc: func(ctx context.Context, query string, args ...interface{}) (sql.Result, error) {
				return nil, errors.New("UNIQUE constraint failed")
			},
			shouldErr: true,
		},
		{
			name: "invalid stat",
			stat: &VisitorStat{
				PagePath:       "/index",
				Pageviews:      100,
				UniqueVisitors: 50,
			},
			execFunc:  nil,
			shouldErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := &mockQueryExecutor{
				execFunc: tt.execFunc,
			}
			repo := NewStatsRepository(mock)

			err := repo.Create(ctx, tt.stat)
			if tt.shouldErr && err == nil {
				t.Fatalf("expected error, got nil")
			}
			if !tt.shouldErr && err != nil {
				t.Fatalf("expected no error, got %v", err)
			}

			if !tt.shouldErr && tt.stat.ID == uuid.Nil {
				t.Fatalf("expected ID to be set")
			}
		})
	}
}

func TestStatsRepositoryUpdate(t *testing.T) {
	ctx := context.Background()
	statID := uuid.New()
	now := time.Now().UTC()

	tests := []struct {
		name      string
		stat      *VisitorStat
		execFunc  func(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
		shouldErr bool
	}{
		{
			name: "update valid stat",
			stat: &VisitorStat{
				ID:             statID,
				Date:           now,
				PagePath:       "/index",
				Pageviews:      200,
				UniqueVisitors: 100,
			},
			execFunc: func(ctx context.Context, query string, args ...interface{}) (sql.Result, error) {
				return mockResult{rowsAffected: 1}, nil
			},
			shouldErr: false,
		},
		{
			name: "stat not found",
			stat: &VisitorStat{
				ID:             statID,
				Date:           now,
				PagePath:       "/index",
				Pageviews:      200,
				UniqueVisitors: 100,
			},
			execFunc: func(ctx context.Context, query string, args ...interface{}) (sql.Result, error) {
				return mockResult{rowsAffected: 0}, nil
			},
			shouldErr: true,
		},
		{
			name: "missing ID",
			stat: &VisitorStat{
				Date:           now,
				PagePath:       "/index",
				Pageviews:      200,
				UniqueVisitors: 100,
			},
			execFunc:  nil,
			shouldErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := &mockQueryExecutor{
				execFunc: tt.execFunc,
			}
			repo := NewStatsRepository(mock)

			err := repo.Update(ctx, tt.stat)
			if tt.shouldErr && err == nil {
				t.Fatalf("expected error, got nil")
			}
			if !tt.shouldErr && err != nil {
				t.Fatalf("expected no error, got %v", err)
			}
		})
	}
}

func TestStatsRepositoryDelete(t *testing.T) {
	ctx := context.Background()
	statID := uuid.New()

	tests := []struct {
		name      string
		id        uuid.UUID
		execFunc  func(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
		shouldErr bool
	}{
		{
			name: "delete existing stat",
			id:   statID,
			execFunc: func(ctx context.Context, query string, args ...interface{}) (sql.Result, error) {
				return mockResult{rowsAffected: 1}, nil
			},
			shouldErr: false,
		},
		{
			name: "stat not found",
			id:   statID,
			execFunc: func(ctx context.Context, query string, args ...interface{}) (sql.Result, error) {
				return mockResult{rowsAffected: 0}, nil
			},
			shouldErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := &mockQueryExecutor{
				execFunc: tt.execFunc,
			}
			repo := NewStatsRepository(mock)

			err := repo.Delete(ctx, tt.id)
			if tt.shouldErr && err == nil {
				t.Fatalf("expected error, got nil")
			}
			if !tt.shouldErr && err != nil {
				t.Fatalf("expected no error, got %v", err)
			}
		})
	}
}

// helper function to create a string pointer
func stringPtr(s string) *string {
	return &s
}
