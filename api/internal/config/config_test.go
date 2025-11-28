package config

import (
	"os"
	"testing"
)

func TestValidate(t *testing.T) {
	tests := []struct {
		name      string
		cfg       *Config
		shouldErr bool
	}{
		{
			name: "valid production config",
			cfg: &Config{
				DBDsn:             "postgres://localhost/db",
				AWSRegion:         "us-east-1",
				CognitoUserPoolID: "us-east-1_ABC123",
				CognitoClientID:   "client123",
				LogLevel:          "info",
				DevMode:           false,
				DevUserRole:       "user",
			},
			shouldErr: false,
		},
		{
			name: "valid dev mode config",
			cfg: &Config{
				DBDsn:       "postgres://localhost/db",
				AWSRegion:   "us-east-1",
				LogLevel:    "debug",
				DevMode:     true,
				DevUserRole: "admin",
			},
			shouldErr: false,
		},
		{
			name: "missing DB_DSN",
			cfg: &Config{
				AWSRegion:         "us-east-1",
				CognitoUserPoolID: "us-east-1_ABC123",
				CognitoClientID:   "client123",
				LogLevel:          "info",
				DevMode:           false,
			},
			shouldErr: true,
		},
		{
			name: "missing Cognito in production",
			cfg: &Config{
				DBDsn:     "postgres://localhost/db",
				AWSRegion: "us-east-1",
				LogLevel:  "info",
				DevMode:   false,
			},
			shouldErr: true,
		},
		{
			name: "invalid log level",
			cfg: &Config{
				DBDsn:             "postgres://localhost/db",
				AWSRegion:         "us-east-1",
				CognitoUserPoolID: "us-east-1_ABC123",
				CognitoClientID:   "client123",
				LogLevel:          "invalid",
				DevMode:           false,
			},
			shouldErr: true,
		},
		{
			name: "invalid dev user role",
			cfg: &Config{
				DBDsn:       "postgres://localhost/db",
				AWSRegion:   "us-east-1",
				LogLevel:    "info",
				DevMode:     true,
				DevUserRole: "superuser",
			},
			shouldErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.cfg.Validate()
			if (err != nil) != tt.shouldErr {
				t.Errorf("expected error: %v, got: %v", tt.shouldErr, err)
			}
		})
	}
}

func TestLoad(t *testing.T) {
	// Save original env vars
	origDBDsn := os.Getenv("DB_DSN")
	origAWSRegion := os.Getenv("AWS_REGION")
	origCognitoPoolID := os.Getenv("COGNITO_USER_POOL_ID")
	origCognitoClientID := os.Getenv("COGNITO_CLIENT_ID")
	origLogLevel := os.Getenv("LOG_LEVEL")
	origDevMode := os.Getenv("DEV_MODE")
	origDevUserRole := os.Getenv("DEV_USER_ROLE")

	defer func() {
		// Restore original env vars
		os.Setenv("DB_DSN", origDBDsn)
		os.Setenv("AWS_REGION", origAWSRegion)
		os.Setenv("COGNITO_USER_POOL_ID", origCognitoPoolID)
		os.Setenv("COGNITO_CLIENT_ID", origCognitoClientID)
		os.Setenv("LOG_LEVEL", origLogLevel)
		os.Setenv("DEV_MODE", origDevMode)
		os.Setenv("DEV_USER_ROLE", origDevUserRole)
	}()

	// Test successful load with dev mode
	os.Clearenv()
	os.Setenv("DB_DSN", "postgres://localhost/db")
	os.Setenv("AWS_REGION", "us-west-2")
	os.Setenv("LOG_LEVEL", "debug")
	os.Setenv("DEV_MODE", "true")
	os.Setenv("DEV_USER_ROLE", "admin")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	if cfg.DBDsn != "postgres://localhost/db" {
		t.Errorf("expected postgres://localhost/db, got %s", cfg.DBDsn)
	}
	if cfg.AWSRegion != "us-west-2" {
		t.Errorf("expected us-west-2, got %s", cfg.AWSRegion)
	}
	if cfg.LogLevel != "debug" {
		t.Errorf("expected debug, got %s", cfg.LogLevel)
	}
	if !cfg.DevMode {
		t.Error("expected DevMode to be true")
	}
	if cfg.DevUserRole != "admin" {
		t.Errorf("expected admin, got %s", cfg.DevUserRole)
	}

	// Test load failure with missing required field
	os.Clearenv()
	_, err = Load()
	if err == nil {
		t.Error("expected error for missing DB_DSN")
	}
}
