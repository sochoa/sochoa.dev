package db

import (
	"context"
	_ "embed"
	"fmt"
	"strings"
)

//go:embed migrations/001_init.up.sql
var migrationUp string

//go:embed migrations/001_init.down.sql
var migrationDown string

// MigrateUp applies all pending migrations
func MigrateUp(ctx context.Context, conn *Connection) error {
	if err := createMigrationsTable(ctx, conn); err != nil {
		return err
	}

	// Check if migration has already been applied
	isMigrated, err := isMigrationApplied(ctx, conn, "001_init")
	if err != nil {
		return err
	}

	if isMigrated {
		return nil // Already migrated
	}

	// Run the migration
	if _, err := conn.ExecContext(ctx, migrationUp); err != nil {
		return fmt.Errorf("failed to run migration: %w", err)
	}

	// Record the migration
	_, err = conn.ExecContext(ctx, `
		INSERT INTO schema_migrations (version, dirty) VALUES (?, ?)
	`, 001001, false)

	return err
}

// MigrateDown rolls back all applied migrations
func MigrateDown(ctx context.Context, conn *Connection) error {
	isMigrated, err := isMigrationApplied(ctx, conn, "001_init")
	if err != nil {
		return err
	}

	if !isMigrated {
		return nil // Not migrated, nothing to do
	}

	// Run the migration
	if _, err := conn.ExecContext(ctx, migrationDown); err != nil {
		return fmt.Errorf("failed to rollback migration: %w", err)
	}

	// Record the rollback
	_, err = conn.ExecContext(ctx, `
		DELETE FROM schema_migrations WHERE version = ?
	`, 001001)

	return err
}

// createMigrationsTable creates the schema_migrations table if it doesn't exist
func createMigrationsTable(ctx context.Context, conn *Connection) error {
	_, err := conn.ExecContext(ctx, `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version BIGINT PRIMARY KEY,
			dirty BOOLEAN NOT NULL DEFAULT 0
		)
	`)
	return err
}

// isMigrationApplied checks if a migration has been applied
func isMigrationApplied(ctx context.Context, conn *Connection, name string) (bool, error) {
	row := conn.QueryRowContext(ctx, `
		SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version = ?)
	`, 001001)

	var exists bool
	if err := row.Scan(&exists); err != nil {
		// Table doesn't exist yet
		if strings.Contains(err.Error(), "no such table") {
			return false, nil
		}
		return false, err
	}

	return exists, nil
}
