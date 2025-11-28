package model

import (
	"context"
	"database/sql"
	"errors"
	"testing"

	"github.com/google/uuid"
)

func TestGuestbookEntryValidate(t *testing.T) {
	tests := []struct {
		name      string
		entry     *GuestbookEntry
		shouldErr bool
	}{
		{
			name: "valid entry",
			entry: &GuestbookEntry{
				UserProvider: "google",
				UserID:       "user123",
				DisplayName:  "John Doe",
				Message:      "Great site!",
			},
			shouldErr: false,
		},
		{
			name: "valid entry with linkedin",
			entry: &GuestbookEntry{
				UserProvider: "linkedin",
				UserID:       "user456",
				DisplayName:  "Jane Smith",
				Message:      "Love your work",
			},
			shouldErr: false,
		},
		{
			name: "missing user_provider",
			entry: &GuestbookEntry{
				UserID:      "user123",
				DisplayName: "John Doe",
				Message:     "Great site!",
			},
			shouldErr: true,
		},
		{
			name: "invalid user_provider",
			entry: &GuestbookEntry{
				UserProvider: "twitter",
				UserID:       "user123",
				DisplayName:  "John Doe",
				Message:      "Great site!",
			},
			shouldErr: true,
		},
		{
			name: "missing user_id",
			entry: &GuestbookEntry{
				UserProvider: "google",
				DisplayName:  "John Doe",
				Message:      "Great site!",
			},
			shouldErr: true,
		},
		{
			name: "missing display_name",
			entry: &GuestbookEntry{
				UserProvider: "google",
				UserID:       "user123",
				Message:      "Great site!",
			},
			shouldErr: true,
		},
		{
			name: "display_name too long",
			entry: &GuestbookEntry{
				UserProvider: "google",
				UserID:       "user123",
				DisplayName:  string(make([]byte, 256)),
				Message:      "Great site!",
			},
			shouldErr: true,
		},
		{
			name: "missing message",
			entry: &GuestbookEntry{
				UserProvider: "google",
				UserID:       "user123",
				DisplayName:  "John Doe",
			},
			shouldErr: true,
		},
		{
			name: "message too long",
			entry: &GuestbookEntry{
				UserProvider: "google",
				UserID:       "user123",
				DisplayName:  "John Doe",
				Message:      string(make([]byte, 501)),
			},
			shouldErr: true,
		},
		{
			name: "message with HTML tags",
			entry: &GuestbookEntry{
				UserProvider: "google",
				UserID:       "user123",
				DisplayName:  "John Doe",
				Message:      "<script>alert('xss')</script>",
			},
			shouldErr: true,
		},
		{
			name: "message with angle brackets",
			entry: &GuestbookEntry{
				UserProvider: "google",
				UserID:       "user123",
				DisplayName:  "John Doe",
				Message:      "Check out <example.com>",
			},
			shouldErr: true,
		},
		{
			name: "message with exactly 500 chars",
			entry: &GuestbookEntry{
				UserProvider: "google",
				UserID:       "user123",
				DisplayName:  "John Doe",
				Message:      string(make([]byte, 500)),
			},
			shouldErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.entry.Validate()
			if tt.shouldErr && err == nil {
				t.Fatalf("expected error, got nil")
			}
			if !tt.shouldErr && err != nil {
				t.Fatalf("expected no error, got %v", err)
			}
		})
	}
}

func TestGuestbookRepositoryCreate(t *testing.T) {
	ctx := context.Background()

	tests := []struct {
		name      string
		entry     *GuestbookEntry
		execFunc  func(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
		shouldErr bool
	}{
		{
			name: "create valid entry",
			entry: &GuestbookEntry{
				UserProvider: "google",
				UserID:       "user123",
				DisplayName:  "John Doe",
				Message:      "Great site!",
			},
			execFunc: func(ctx context.Context, query string, args ...interface{}) (sql.Result, error) {
				return mockResult{rowsAffected: 1}, nil
			},
			shouldErr: false,
		},
		{
			name: "invalid entry",
			entry: &GuestbookEntry{
				DisplayName: "John Doe",
				Message:     "Great site!",
			},
			execFunc:  nil,
			shouldErr: true,
		},
		{
			name: "database error",
			entry: &GuestbookEntry{
				UserProvider: "google",
				UserID:       "user123",
				DisplayName:  "John Doe",
				Message:      "Great site!",
			},
			execFunc: func(ctx context.Context, query string, args ...interface{}) (sql.Result, error) {
				return nil, errors.New("database error")
			},
			shouldErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := &mockQueryExecutor{
				execFunc: tt.execFunc,
			}
			repo := NewGuestbookRepository(mock)

			err := repo.Create(ctx, tt.entry)
			if tt.shouldErr && err == nil {
				t.Fatalf("expected error, got nil")
			}
			if !tt.shouldErr && err != nil {
				t.Fatalf("expected no error, got %v", err)
			}

			if !tt.shouldErr && tt.entry.ID == uuid.Nil {
				t.Fatalf("expected ID to be set")
			}
		})
	}
}

func TestGuestbookRepositoryApprove(t *testing.T) {
	ctx := context.Background()
	entryID := uuid.New()

	tests := []struct {
		name      string
		id        uuid.UUID
		execFunc  func(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
		shouldErr bool
	}{
		{
			name: "approve existing entry",
			id:   entryID,
			execFunc: func(ctx context.Context, query string, args ...interface{}) (sql.Result, error) {
				return mockResult{rowsAffected: 1}, nil
			},
			shouldErr: false,
		},
		{
			name: "entry not found",
			id:   entryID,
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
			repo := NewGuestbookRepository(mock)

			err := repo.Approve(ctx, tt.id)
			if tt.shouldErr && err == nil {
				t.Fatalf("expected error, got nil")
			}
			if !tt.shouldErr && err != nil {
				t.Fatalf("expected no error, got %v", err)
			}
		})
	}
}

func TestGuestbookRepositoryDelete(t *testing.T) {
	ctx := context.Background()
	entryID := uuid.New()

	tests := []struct {
		name      string
		id        uuid.UUID
		execFunc  func(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
		shouldErr bool
	}{
		{
			name: "delete existing entry",
			id:   entryID,
			execFunc: func(ctx context.Context, query string, args ...interface{}) (sql.Result, error) {
				return mockResult{rowsAffected: 1}, nil
			},
			shouldErr: false,
		},
		{
			name: "entry not found",
			id:   entryID,
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
			repo := NewGuestbookRepository(mock)

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
