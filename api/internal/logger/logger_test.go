package logger

import (
	"testing"
)

func TestSetup(t *testing.T) {
	tests := []struct {
		name  string
		level string
	}{
		{"debug", "debug"},
		{"info", "info"},
		{"warn", "warn"},
		{"error", "error"},
		{"unknown", "unknown"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			logger := Setup(tt.level)
			if logger == nil {
				t.Error("expected non-nil logger")
			}
		})
	}
}
