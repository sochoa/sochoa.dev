package db

import (
	"context"
	"database/sql"
	"testing"
)

// MockQueryExecutor is a simple mock for testing
type MockQueryExecutor struct{}

func (m *MockQueryExecutor) QueryRowContext(_ context.Context, _ string, _ ...interface{}) *sql.Row {
	// Mock implementation
	return nil
}

func (m *MockQueryExecutor) QueryContext(_ context.Context, _ string, _ ...interface{}) (*sql.Rows, error) {
	// Mock implementation
	return nil, nil
}

func (m *MockQueryExecutor) ExecContext(_ context.Context, _ string, _ ...interface{}) (sql.Result, error) {
	// Mock implementation
	return nil, nil
}

func TestQueryExecutorInterface(_ *testing.T) {
	var _ QueryExecutor = (*MockQueryExecutor)(nil)
}
