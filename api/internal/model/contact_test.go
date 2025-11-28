package model

import (
	"context"
	"database/sql"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestContactSubmissionValidate(t *testing.T) {
	futureTime := time.Now().UTC().Add(24 * time.Hour)

	tests := []struct {
		name      string
		submission *ContactSubmission
		shouldErr bool
	}{
		{
			name: "valid submission",
			submission: &ContactSubmission{
				Email:     "test@example.com",
				Name:      "John Doe",
				Message:   "I have a question",
				Status:    ContactStatusReceived,
				ExpiresAt: futureTime,
			},
			shouldErr: false,
		},
		{
			name: "missing email",
			submission: &ContactSubmission{
				Name:      "John Doe",
				Message:   "I have a question",
				Status:    ContactStatusReceived,
				ExpiresAt: futureTime,
			},
			shouldErr: true,
		},
		{
			name: "invalid email",
			submission: &ContactSubmission{
				Email:     "not-an-email",
				Name:      "John Doe",
				Message:   "I have a question",
				Status:    ContactStatusReceived,
				ExpiresAt: futureTime,
			},
			shouldErr: true,
		},
		{
			name: "email too long",
			submission: &ContactSubmission{
				Email:     string(make([]byte, 256)),
				Name:      "John Doe",
				Message:   "I have a question",
				Status:    ContactStatusReceived,
				ExpiresAt: futureTime,
			},
			shouldErr: true,
		},
		{
			name: "missing name",
			submission: &ContactSubmission{
				Email:     "test@example.com",
				Message:   "I have a question",
				Status:    ContactStatusReceived,
				ExpiresAt: futureTime,
			},
			shouldErr: true,
		},
		{
			name: "name too long",
			submission: &ContactSubmission{
				Email:     "test@example.com",
				Name:      string(make([]byte, 256)),
				Message:   "I have a question",
				Status:    ContactStatusReceived,
				ExpiresAt: futureTime,
			},
			shouldErr: true,
		},
		{
			name: "missing message",
			submission: &ContactSubmission{
				Email:     "test@example.com",
				Name:      "John Doe",
				Status:    ContactStatusReceived,
				ExpiresAt: futureTime,
			},
			shouldErr: true,
		},
		{
			name: "message too long",
			submission: &ContactSubmission{
				Email:     "test@example.com",
				Name:      "John Doe",
				Message:   string(make([]byte, 5001)),
				Status:    ContactStatusReceived,
				ExpiresAt: futureTime,
			},
			shouldErr: true,
		},
		{
			name: "message with HTML",
			submission: &ContactSubmission{
				Email:     "test@example.com",
				Name:      "John Doe",
				Message:   "<script>alert('xss')</script>",
				Status:    ContactStatusReceived,
				ExpiresAt: futureTime,
			},
			shouldErr: true,
		},
		{
			name: "invalid status",
			submission: &ContactSubmission{
				Email:     "test@example.com",
				Name:      "John Doe",
				Message:   "I have a question",
				Status:    "invalid",
				ExpiresAt: futureTime,
			},
			shouldErr: true,
		},
		{
			name: "missing expires_at",
			submission: &ContactSubmission{
				Email:   "test@example.com",
				Name:    "John Doe",
				Message: "I have a question",
				Status:  ContactStatusReceived,
			},
			shouldErr: true,
		},
		{
			name: "expires_at in past",
			submission: &ContactSubmission{
				Email:     "test@example.com",
				Name:      "John Doe",
				Message:   "I have a question",
				Status:    ContactStatusReceived,
				ExpiresAt: time.Now().UTC().Add(-1 * time.Hour),
			},
			shouldErr: true,
		},
		{
			name: "valid with read status",
			submission: &ContactSubmission{
				Email:     "test@example.com",
				Name:      "John Doe",
				Message:   "I have a question",
				Status:    ContactStatusRead,
				ExpiresAt: futureTime,
			},
			shouldErr: false,
		},
		{
			name: "valid with replied status",
			submission: &ContactSubmission{
				Email:     "test@example.com",
				Name:      "John Doe",
				Message:   "I have a question",
				Status:    ContactStatusReplied,
				ExpiresAt: futureTime,
			},
			shouldErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.submission.Validate()
			if tt.shouldErr && err == nil {
				t.Fatalf("expected error, got nil")
			}
			if !tt.shouldErr && err != nil {
				t.Fatalf("expected no error, got %v", err)
			}
		})
	}
}

func TestContactRepositoryCreate(t *testing.T) {
	ctx := context.Background()
	futureTime := time.Now().UTC().Add(24 * time.Hour)

	tests := []struct {
		name      string
		submission *ContactSubmission
		execFunc  func(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
		shouldErr bool
	}{
		{
			name: "create valid submission",
			submission: &ContactSubmission{
				Email:     "test@example.com",
				Name:      "John Doe",
				Message:   "I have a question",
				Status:    ContactStatusReceived,
				ExpiresAt: futureTime,
			},
			execFunc: func(ctx context.Context, query string, args ...interface{}) (sql.Result, error) {
				return mockResult{rowsAffected: 1}, nil
			},
			shouldErr: false,
		},
		{
			name: "invalid submission",
			submission: &ContactSubmission{
				Name:      "John Doe",
				Message:   "I have a question",
				ExpiresAt: futureTime,
			},
			execFunc:  nil,
			shouldErr: true,
		},
		{
			name: "database error",
			submission: &ContactSubmission{
				Email:     "test@example.com",
				Name:      "John Doe",
				Message:   "I have a question",
				ExpiresAt: futureTime,
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
			repo := NewContactRepository(mock)

			err := repo.Create(ctx, tt.submission)
			if tt.shouldErr && err == nil {
				t.Fatalf("expected error, got nil")
			}
			if !tt.shouldErr && err != nil {
				t.Fatalf("expected no error, got %v", err)
			}

			if !tt.shouldErr && tt.submission.ID == uuid.Nil {
				t.Fatalf("expected ID to be set")
			}
		})
	}
}

func TestContactRepositoryUpdateStatus(t *testing.T) {
	ctx := context.Background()
	submissionID := uuid.New()

	tests := []struct {
		name      string
		id        uuid.UUID
		status    ContactStatus
		execFunc  func(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
		shouldErr bool
	}{
		{
			name:   "update to read status",
			id:     submissionID,
			status: ContactStatusRead,
			execFunc: func(ctx context.Context, query string, args ...interface{}) (sql.Result, error) {
				return mockResult{rowsAffected: 1}, nil
			},
			shouldErr: false,
		},
		{
			name:   "submission not found",
			id:     submissionID,
			status: ContactStatusRead,
			execFunc: func(ctx context.Context, query string, args ...interface{}) (sql.Result, error) {
				return mockResult{rowsAffected: 0}, nil
			},
			shouldErr: true,
		},
		{
			name:      "invalid status",
			id:        submissionID,
			status:    "invalid",
			execFunc:  nil,
			shouldErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := &mockQueryExecutor{
				execFunc: tt.execFunc,
			}
			repo := NewContactRepository(mock)

			err := repo.UpdateStatus(ctx, tt.id, tt.status)
			if tt.shouldErr && err == nil {
				t.Fatalf("expected error, got nil")
			}
			if !tt.shouldErr && err != nil {
				t.Fatalf("expected no error, got %v", err)
			}
		})
	}
}
