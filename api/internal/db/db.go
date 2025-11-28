package db

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	_ "github.com/lib/pq" // PostgreSQL driver
)

// QueryExecutor interface for mocking database queries
type QueryExecutor interface {
	QueryRowContext(ctx context.Context, query string, args ...interface{}) *sql.Row
	QueryContext(ctx context.Context, query string, args ...interface{}) (*sql.Rows, error)
	ExecContext(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
}

// Connection represents a PostgreSQL database connection pool
type Connection struct {
	db *sql.DB
}

// Connect establishes a PostgreSQL connection pool
func Connect(ctx context.Context, dsn string) (*Connection, error) {
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Configure connection pool
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)
	db.SetConnMaxIdleTime(10 * time.Minute)

	// Test the connection
	if err := db.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &Connection{db: db}, nil
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
