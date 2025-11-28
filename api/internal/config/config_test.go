package config

import (
	"testing"
)

func TestConfig(t *testing.T) {
	cfg := Config{
		DBDsn:             "postgres://user:pass@localhost/db",
		AWSRegion:         "us-east-1",
		CognitoUserPoolID: "us-east-1_XXXXXXXXX",
		CognitoClientID:   "client_id",
		LogLevel:          "info",
		DevMode:           false,
		DevUserRole:       "user",
	}

	if cfg.DBDsn == "" {
		t.Error("expected non-empty DBDsn")
	}
	if cfg.AWSRegion != "us-east-1" {
		t.Errorf("expected us-east-1, got %s", cfg.AWSRegion)
	}
}
