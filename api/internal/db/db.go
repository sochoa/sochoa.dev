package db

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	_ "github.com/lib/pq"              // PostgreSQL driver
	_ "github.com/mattn/go-sqlite3"    // SQLite driver
)

// QueryExecutor interface for mocking database queries
type QueryExecutor interface {
	QueryRowContext(ctx context.Context, query string, args ...interface{}) *sql.Row
	QueryContext(ctx context.Context, query string, args ...interface{}) (*sql.Rows, error)
	ExecContext(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
}

// Connection represents a database connection pool (PostgreSQL or SQLite)
type Connection struct {
	db     *sql.DB
	driver string
}

// Connect establishes a database connection pool (PostgreSQL or SQLite)
func Connect(ctx context.Context, dsn string) (*Connection, error) {
	var driver string

	// Determine driver based on DSN format
	if strings.HasPrefix(dsn, "file:") {
		driver = "sqlite3"
	} else {
		driver = "postgres"
	}

	db, err := sql.Open(driver, dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Configure connection pool (SQLite handles differently)
	if driver == "sqlite3" {
		db.SetMaxOpenConns(1)
		db.SetMaxIdleConns(0)
	} else {
		db.SetMaxOpenConns(25)
		db.SetMaxIdleConns(5)
		db.SetConnMaxLifetime(5 * time.Minute)
		db.SetConnMaxIdleTime(10 * time.Minute)
	}

	// Test the connection
	if err := db.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &Connection{db: db, driver: driver}, nil
}

// QueryRowContext executes a query that returns at most one row
func (c *Connection) QueryRowContext(ctx context.Context, query string, args ...interface{}) *sql.Row {
	return c.db.QueryRowContext(ctx, query, args...)
}

// QueryContext executes a query that returns rows
func (c *Connection) QueryContext(ctx context.Context, query string, args ...interface{}) (*sql.Rows, error) {
	return c.db.QueryContext(ctx, query, args...)
}

// ExecContext executes a command
func (c *Connection) ExecContext(ctx context.Context, query string, args ...interface{}) (sql.Result, error) {
	return c.db.ExecContext(ctx, query, args...)
}

// HealthCheck verifies the database connection is alive
func (c *Connection) HealthCheck(ctx context.Context) error {
	return c.db.PingContext(ctx)
}

// Close closes the database connection pool
func (c *Connection) Close() error {
	return c.db.Close()
}
