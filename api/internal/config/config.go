package config

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
)

// Config holds application configuration
type Config struct {
	DBDsn             string
	AWSRegion         string
	CognitoUserPoolID string
	CognitoClientID   string
	LogLevel          string
	DevMode           bool
	DevUserRole       string
}

// Load loads configuration from environment variables with validation
func Load() (*Config, error) {
	dbDsn := getEnv("DB_DSN", "")

	// If DB_DSN not provided, default to SQLite in ~/.cache
	if dbDsn == "" {
		var err error
		dbDsn, err = getDefaultSQLitePath()
		if err != nil {
			return nil, fmt.Errorf("failed to create default database path: %w", err)
		}
	}

	cfg := &Config{
		DBDsn:             dbDsn,
		AWSRegion:         getEnv("AWS_REGION", "us-east-1"),
		CognitoUserPoolID: getEnv("COGNITO_USER_POOL_ID", ""),
		CognitoClientID:   getEnv("COGNITO_CLIENT_ID", ""),
		LogLevel:          getEnv("LOG_LEVEL", "debug"),
		DevMode:           getEnvBool("DEV_MODE", true),
		DevUserRole:       getEnv("DEV_USER_ROLE", "admin"),
	}

	// Validate required fields
	if err := cfg.Validate(); err != nil {
		return nil, err
	}

	return cfg, nil
}

// Validate checks that required configuration values are present
func (c *Config) Validate() error {
	if c.AWSRegion == "" {
		return fmt.Errorf("AWS_REGION environment variable is required")
	}

	// In production (non-DEV_MODE), Cognito settings are required
	if !c.DevMode {
		if c.CognitoUserPoolID == "" {
			return fmt.Errorf("COGNITO_USER_POOL_ID environment variable is required")
		}
		if c.CognitoClientID == "" {
			return fmt.Errorf("COGNITO_CLIENT_ID environment variable is required")
		}
	}

	// Validate log level
	validLogLevels := map[string]bool{
		"debug": true,
		"info":  true,
		"warn":  true,
		"error": true,
	}
	if !validLogLevels[c.LogLevel] {
		return fmt.Errorf("invalid LOG_LEVEL: %s (must be debug, info, warn, or error)", c.LogLevel)
	}

	// Validate dev user role
	if c.DevMode {
		validRoles := map[string]bool{
			"user":  true,
			"admin": true,
		}
		if !validRoles[c.DevUserRole] {
			return fmt.Errorf("invalid DEV_USER_ROLE: %s (must be user or admin)", c.DevUserRole)
		}
	}

	return nil
}

// getEnv retrieves an environment variable with a default value
func getEnv(key, defaultVal string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultVal
}

// getEnvBool retrieves an environment variable as a boolean with a default value
func getEnvBool(key string, defaultVal bool) bool {
	value := os.Getenv(key)
	if value == "" {
		return defaultVal
	}
	boolVal, err := strconv.ParseBool(value)
	if err != nil {
		return defaultVal
	}
	return boolVal
}

// getDefaultSQLitePath creates and returns a default SQLite database path in ~/.cache
func getDefaultSQLitePath() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("failed to get home directory: %w", err)
	}

	cacheDir := filepath.Join(home, ".cache", "sochoa.dev")
	if err := os.MkdirAll(cacheDir, 0700); err != nil {
		return "", fmt.Errorf("failed to create cache directory: %w", err)
	}

	dbPath := filepath.Join(cacheDir, "api.db")
	dsn := "file:" + dbPath + "?cache=shared&mode=rwc"
	return dsn, nil
}
