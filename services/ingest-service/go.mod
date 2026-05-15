module github.com/greenhouse-monorepo/services/ingest-service

go 1.24

require (
	github.com/greenhouse-monorepo/libs/common-go v0.0.0
	github.com/greenhouse-monorepo/libs/models-go v0.0.0
	google.golang.org/grpc v1.67.1
)

require (
	golang.org/x/net v0.28.0 // indirect
	golang.org/x/sys v0.24.0 // indirect
	golang.org/x/text v0.17.0 // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20240814211410-ddb44dafa142 // indirect
	google.golang.org/protobuf v1.35.1 // indirect
)

// Intra-repo modules resolve to local source. go.work unifies them for
// one-shot `go build ./...` and IDEs; these replace directives additionally
// let the module build and `go mod tidy` standalone (CI, Docker).
replace (
	github.com/greenhouse-monorepo/libs/common-go => ../../libs/common-go
	github.com/greenhouse-monorepo/libs/models-go => ../../libs/models-go
)
