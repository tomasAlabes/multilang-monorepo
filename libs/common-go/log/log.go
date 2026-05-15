// Package log provides a shared structured logger built on log/slog so every
// Go service emits logs in the same JSON format.
package log

import (
	"log/slog"
	"os"
)

// New returns a JSON structured logger tagged with the service name.
func New(service string) *slog.Logger {
	handler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	})
	return slog.New(handler).With("service", service)
}
