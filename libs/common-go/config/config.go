// Package config provides environment-based configuration helpers shared by
// the Go services.
package config

import (
	"fmt"
	"os"
)

// MustGet returns the value of an environment variable or panics if it is
// unset. Services call this during startup to fail fast on misconfiguration.
func MustGet(key string) string {
	value, ok := os.LookupEnv(key)
	if !ok || value == "" {
		panic(fmt.Sprintf("missing required environment variable: %s", key))
	}
	return value
}

// GetOr returns the value of an environment variable, or fallback if unset.
func GetOr(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok && value != "" {
		return value
	}
	return fallback
}
