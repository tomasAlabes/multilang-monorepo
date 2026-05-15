module github.com/greenhouse-monorepo/services/api-gateway

go 1.24

// Intra-repo modules resolve via the root go.work.
require (
	github.com/99designs/gqlgen v0.17.55
	github.com/greenhouse-monorepo/libs/common-go v0.0.0
	github.com/greenhouse-monorepo/libs/models-go v0.0.0
	github.com/vektah/gqlparser/v2 v2.5.17
	google.golang.org/grpc v1.67.1
)
