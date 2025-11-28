package handler

import (
	"context"
	"database/sql"
	"encoding/json"
	"log/slog"
	"os"
	"path/filepath"
	"testing"

	_ "github.com/mattn/go-sqlite3"
)

// setupTestDB creates a temporary SQLite database and runs migrations
func setupTestDB(t *testing.T) *sql.DB {
	// Create a temporary database file
	tempDir := t.TempDir()
	dbPath := filepath.Join(tempDir, "test.db")

	// Open temporary SQLite database file
	sqlDB, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		t.Fatalf("failed to open test database: %v", err)
	}

	// Enable foreign keys
	if _, err := sqlDB.Exec("PRAGMA foreign_keys = ON"); err != nil {
		t.Fatalf("failed to enable foreign keys: %v", err)
	}

	// Run migrations
	if err := runMigrations(t, sqlDB); err != nil {
		t.Fatalf("failed to run migrations: %v", err)
	}

	return sqlDB
}

// runMigrations reads and executes all migration SQL files
func runMigrations(t *testing.T, sqlDB *sql.DB) error {
	// Get the migrations directory path relative to this file
	migrationsDir := filepath.Join(filepath.Dir(filepath.Dir(filepath.Dir(filepath.Dir(filepath.Dir(os.Args[0]))))), "db", "migrations")

	// Handle different paths for tests vs development
	if _, err := os.Stat(migrationsDir); os.IsNotExist(err) {
		// Try relative to current working directory
		migrationsDir = filepath.Join(".", "db", "migrations")
	}
	if _, err := os.Stat(migrationsDir); os.IsNotExist(err) {
		// Try one level up
		migrationsDir = filepath.Join("..", "db", "migrations")
	}

	// SQLite-specific migration SQL (simplified for in-memory testing)
	migrations := []struct {
		name string
		sql  string
	}{
		{
			name: "posts",
			sql: `
CREATE TABLE posts (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT,
    body TEXT NOT NULL,
    tags TEXT,
    status TEXT NOT NULL,
    published_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'archived'))
);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
`,
		},
		{
			name: "guestbook_entries",
			sql: `
CREATE TABLE guestbook_entries (
    id TEXT PRIMARY KEY,
    user_provider TEXT NOT NULL,
    user_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    message TEXT NOT NULL,
    approved BOOLEAN NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT valid_provider CHECK (user_provider IN ('google', 'linkedin'))
);
CREATE INDEX idx_guestbook_approved ON guestbook_entries(approved) WHERE deleted_at IS NULL;
CREATE INDEX idx_guestbook_user ON guestbook_entries(user_provider, user_id) WHERE deleted_at IS NULL;
`,
		},
		{
			name: "contact_submissions",
			sql: `
CREATE TABLE contact_submissions (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'received',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT valid_status CHECK (status IN ('received', 'read', 'replied'))
);
CREATE INDEX idx_contact_status ON contact_submissions(status) WHERE expires_at > datetime('now');
CREATE INDEX idx_contact_email ON contact_submissions(email) WHERE expires_at > datetime('now');
CREATE INDEX idx_contact_created_at ON contact_submissions(created_at DESC) WHERE expires_at > datetime('now');
CREATE INDEX idx_contact_expires_at ON contact_submissions(expires_at);
`,
		},
		{
			name: "visitor_stats",
			sql: `
CREATE TABLE visitor_stats (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    page_path TEXT NOT NULL,
    country TEXT,
    referrer_domain TEXT,
    pageviews INTEGER NOT NULL DEFAULT 0,
    unique_visitors INTEGER NOT NULL DEFAULT 0,
    latency_p50 REAL,
    latency_p95 REAL,
    latency_p99 REAL,
    errors_4xx INTEGER NOT NULL DEFAULT 0,
    errors_5xx INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    UNIQUE (date, page_path),
    CONSTRAINT non_negative_pageviews CHECK (pageviews >= 0),
    CONSTRAINT non_negative_visitors CHECK (unique_visitors >= 0),
    CONSTRAINT non_negative_errors_4xx CHECK (errors_4xx >= 0),
    CONSTRAINT non_negative_errors_5xx CHECK (errors_5xx >= 0)
);
CREATE INDEX idx_visitor_stats_date ON visitor_stats(date DESC);
CREATE INDEX idx_visitor_stats_page_path ON visitor_stats(page_path);
CREATE INDEX idx_visitor_stats_date_page ON visitor_stats(date DESC, page_path);
`,
		},
	}

	// Execute migrations
	for _, m := range migrations {
		if _, err := sqlDB.Exec(m.sql); err != nil {
			return err
		}
	}

	return nil
}

// sqliteAdapter wraps sql.DB to convert PostgreSQL placeholders to SQLite
type sqliteAdapter struct {
	db *sql.DB
}

// convertQuery converts PostgreSQL $N placeholders to SQLite ? placeholders
func convertQuery(query string) string {
	// Replace $1, $2, etc. with ?
	result := ""
	i := 0
	for i < len(query) {
		if i+1 < len(query) && query[i] == '$' && query[i+1] >= '0' && query[i+1] <= '9' {
			result += "?"
			i += 2
			// Skip any additional digits
			for i < len(query) && query[i] >= '0' && query[i] <= '9' {
				i++
			}
		} else {
			result += string(query[i])
			i++
		}
	}
	return result
}

// convertArgs converts slice arguments to JSON strings for SQLite compatibility
func convertArgs(args ...interface{}) []interface{} {
	result := make([]interface{}, len(args))
	for i, arg := range args {
		if arg == nil {
			result[i] = arg
			continue
		}

		// Convert slices to JSON
		switch v := arg.(type) {
		case []string:
			jsonBytes, _ := json.Marshal(v)
			result[i] = string(jsonBytes)
		case []interface{}:
			jsonBytes, _ := json.Marshal(v)
			result[i] = string(jsonBytes)
		default:
			result[i] = arg
		}
	}
	return result
}

func (a *sqliteAdapter) QueryRowContext(ctx context.Context, query string, args ...interface{}) *sql.Row {
	return a.db.QueryRowContext(ctx, convertQuery(query), convertArgs(args...)...)
}

func (a *sqliteAdapter) QueryContext(ctx context.Context, query string, args ...interface{}) (*sql.Rows, error) {
	return a.db.QueryContext(ctx, convertQuery(query), convertArgs(args...)...)
}

func (a *sqliteAdapter) ExecContext(ctx context.Context, query string, args ...interface{}) (sql.Result, error) {
	return a.db.ExecContext(ctx, convertQuery(query), convertArgs(args...)...)
}

// Close closes the underlying database connection
func (a *sqliteAdapter) Close() error {
	return a.db.Close()
}

// setupTestConnection wraps a SQL DB for testing with query conversion
func setupTestConnection(t *testing.T) *sqliteAdapter {
	sqlDB := setupTestDB(t)
	return &sqliteAdapter{db: sqlDB}
}

// createTestLogger creates a logger for tests
func createTestLogger() *slog.Logger {
	return slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelError, // Only show errors to keep test output clean
	}))
}
