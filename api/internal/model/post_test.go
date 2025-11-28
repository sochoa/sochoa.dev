package model

import (
	"context"
	"database/sql"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	apierrors "github.com/sochoa/sochoa.dev/api/internal/errors"
)

type mockQueryExecutor struct {
	queryRowFunc func(ctx context.Context, query string, args ...interface{}) *sql.Row
	queryFunc    func(ctx context.Context, query string, args ...interface{}) (*sql.Rows, error)
	execFunc     func(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
}

func (m *mockQueryExecutor) QueryRowContext(ctx context.Context, query string, args ...interface{}) *sql.Row {
	if m.queryRowFunc != nil {
		return m.queryRowFunc(ctx, query, args...)
	}
	return nil
}

func (m *mockQueryExecutor) QueryContext(ctx context.Context, query string, args ...interface{}) (*sql.Rows, error) {
	if m.queryFunc != nil {
		return m.queryFunc(ctx, query, args...)
	}
	return nil, nil
}

func (m *mockQueryExecutor) ExecContext(ctx context.Context, query string, args ...interface{}) (sql.Result, error) {
	if m.execFunc != nil {
		return m.execFunc(ctx, query, args...)
	}
	return nil, nil
}

func TestPostValidate(t *testing.T) {
	tests := []struct {
		name      string
		post      *Post
		shouldErr bool
		errType   interface{}
	}{
		{
			name: "valid post",
			post: &Post{
				Slug:   "valid-slug",
				Title:  "Valid Title",
				Body:   "Valid body content",
				Status: PostStatusDraft,
			},
			shouldErr: false,
		},
		{
			name: "missing slug",
			post: &Post{
				Title:  "Title",
				Body:   "Body",
				Status: PostStatusDraft,
			},
			shouldErr: true,
			errType:   apierrors.ValidationError{},
		},
		{
			name: "invalid slug with uppercase",
			post: &Post{
				Slug:   "Invalid-Slug",
				Title:  "Title",
				Body:   "Body",
				Status: PostStatusDraft,
			},
			shouldErr: true,
		},
		{
			name: "invalid slug with spaces",
			post: &Post{
				Slug:   "invalid slug",
				Title:  "Title",
				Body:   "Body",
				Status: PostStatusDraft,
			},
			shouldErr: true,
		},
		{
			name: "missing title",
			post: &Post{
				Slug:   "valid-slug",
				Body:   "Body",
				Status: PostStatusDraft,
			},
			shouldErr: true,
		},
		{
			name: "title too long",
			post: &Post{
				Slug:   "valid-slug",
				Title:  string(make([]byte, 256)),
				Body:   "Body",
				Status: PostStatusDraft,
			},
			shouldErr: true,
		},
		{
			name: "missing body",
			post: &Post{
				Slug:   "valid-slug",
				Title:  "Title",
				Status: PostStatusDraft,
			},
			shouldErr: true,
		},
		{
			name: "invalid status",
			post: &Post{
				Slug:   "valid-slug",
				Title:  "Title",
				Body:   "Body",
				Status: "invalid",
			},
			shouldErr: true,
		},
		{
			name: "published post without published_at",
			post: &Post{
				Slug:   "valid-slug",
				Title:  "Title",
				Body:   "Body",
				Status: PostStatusPublished,
			},
			shouldErr: true,
		},
		{
			name: "published post with published_at",
			post: &Post{
				Slug:        "valid-slug",
				Title:       "Title",
				Body:        "Body",
				Status:      PostStatusPublished,
				PublishedAt: &time.Time{},
			},
			shouldErr: false,
		},
		{
			name: "valid slug with numbers",
			post: &Post{
				Slug:   "valid-slug-123",
				Title:  "Title",
				Body:   "Body",
				Status: PostStatusDraft,
			},
			shouldErr: false,
		},
		{
			name: "single word slug",
			post: &Post{
				Slug:   "slug",
				Title:  "Title",
				Body:   "Body",
				Status: PostStatusDraft,
			},
			shouldErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.post.Validate()
			if tt.shouldErr && err == nil {
				t.Fatalf("expected error, got nil")
			}
			if !tt.shouldErr && err != nil {
				t.Fatalf("expected no error, got %v", err)
			}
		})
	}
}

type mockResult struct {
	rowsAffected int64
}

func (m mockResult) LastInsertId() (int64, error) {
	return 0, nil
}

func (m mockResult) RowsAffected() (int64, error) {
	return m.rowsAffected, nil
}

func TestPostRepositoryCreate(t *testing.T) {
	ctx := context.Background()

	tests := []struct {
		name      string
		post      *Post
		execFunc  func(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
		shouldErr bool
	}{
		{
			name: "create valid post",
			post: &Post{
				Slug:   "valid-slug",
				Title:  "Title",
				Body:   "Body",
				Status: PostStatusDraft,
			},
			execFunc: func(ctx context.Context, query string, args ...interface{}) (sql.Result, error) {
				return mockResult{rowsAffected: 1}, nil
			},
			shouldErr: false,
		},
		{
			name: "duplicate slug",
			post: &Post{
				Slug:   "duplicate",
				Title:  "Title",
				Body:   "Body",
				Status: PostStatusDraft,
			},
			execFunc: func(ctx context.Context, query string, args ...interface{}) (sql.Result, error) {
				return nil, errors.New("duplicate key value")
			},
			shouldErr: true,
		},
		{
			name: "invalid post",
			post: &Post{
				Title:  "Title",
				Body:   "Body",
				Status: PostStatusDraft,
			},
			execFunc: nil,
			shouldErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := &mockQueryExecutor{
				execFunc: tt.execFunc,
			}
			repo := NewPostRepository(mock)

			err := repo.Create(ctx, tt.post)
			if tt.shouldErr && err == nil {
				t.Fatalf("expected error, got nil")
			}
			if !tt.shouldErr && err != nil {
				t.Fatalf("expected no error, got %v", err)
			}

			if !tt.shouldErr && tt.post.ID == uuid.Nil {
				t.Fatalf("expected ID to be set")
			}
		})
	}
}

func TestPostRepositoryUpdate(t *testing.T) {
	ctx := context.Background()
	postID := uuid.New()

	tests := []struct {
		name      string
		post      *Post
		execFunc  func(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
		shouldErr bool
	}{
		{
			name: "update valid post",
			post: &Post{
				ID:     postID,
				Slug:   "updated-slug",
				Title:  "Updated Title",
				Body:   "Updated Body",
				Status: PostStatusDraft,
			},
			execFunc: func(ctx context.Context, query string, args ...interface{}) (sql.Result, error) {
				return mockResult{rowsAffected: 1}, nil
			},
			shouldErr: false,
		},
		{
			name: "post not found",
			post: &Post{
				ID:     postID,
				Slug:   "slug",
				Title:  "Title",
				Body:   "Body",
				Status: PostStatusDraft,
			},
			execFunc: func(ctx context.Context, query string, args ...interface{}) (sql.Result, error) {
				return mockResult{rowsAffected: 0}, nil
			},
			shouldErr: true,
		},
		{
			name: "missing ID",
			post: &Post{
				Slug:   "slug",
				Title:  "Title",
				Body:   "Body",
				Status: PostStatusDraft,
			},
			execFunc: nil,
			shouldErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := &mockQueryExecutor{
				execFunc: tt.execFunc,
			}
			repo := NewPostRepository(mock)

			err := repo.Update(ctx, tt.post)
			if tt.shouldErr && err == nil {
				t.Fatalf("expected error, got nil")
			}
			if !tt.shouldErr && err != nil {
				t.Fatalf("expected no error, got %v", err)
			}
		})
	}
}

func TestPostRepositoryDelete(t *testing.T) {
	ctx := context.Background()
	postID := uuid.New()

	tests := []struct {
		name      string
		id        uuid.UUID
		execFunc  func(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
		shouldErr bool
	}{
		{
			name: "delete existing post",
			id:   postID,
			execFunc: func(ctx context.Context, query string, args ...interface{}) (sql.Result, error) {
				return mockResult{rowsAffected: 1}, nil
			},
			shouldErr: false,
		},
		{
			name: "post not found",
			id:   postID,
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
			repo := NewPostRepository(mock)

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
