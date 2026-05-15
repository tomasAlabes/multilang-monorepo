module github.com/greenhouse-monorepo/services/ingest-service

go 1.24

// Intra-repo modules are resolved via the root go.work; the v0.0.0
// pseudo-versions below are placeholders that the workspace overrides.
require (
	github.com/greenhouse-monorepo/libs/common-go v0.0.0
	github.com/greenhouse-monorepo/libs/models-go v0.0.0
	google.golang.org/grpc v1.67.1
)
