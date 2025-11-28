package model

import "time"

// GetStartOfDay returns the start of the current day in UTC
func GetStartOfDay() time.Time {
	now := time.Now().UTC()
	return time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
}
