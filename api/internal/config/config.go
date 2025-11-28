package config

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
