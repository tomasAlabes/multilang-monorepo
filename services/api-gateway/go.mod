module github.com/greenhouse-monorepo/services/api-gateway

go 1.25.0

require (
	github.com/99designs/gqlgen v0.17.90
	github.com/greenhouse-monorepo/libs/common-go v0.0.0
	github.com/greenhouse-monorepo/libs/models-go v0.0.0
	github.com/vektah/gqlparser/v2 v2.5.33
	google.golang.org/grpc v1.67.1
)

require (
	github.com/agnivade/levenshtein v1.2.1 // indirect
	github.com/go-viper/mapstructure/v2 v2.5.0 // indirect
	github.com/goccy/go-yaml v1.19.2 // indirect
	github.com/google/uuid v1.6.0 // indirect
	github.com/gorilla/websocket v1.5.0 // indirect
	github.com/hashicorp/golang-lru/v2 v2.0.7 // indirect
	github.com/sosodev/duration v1.4.0 // indirect
	github.com/urfave/cli/v3 v3.8.0 // indirect
	golang.org/x/mod v0.33.0 // indirect
	golang.org/x/net v0.52.0 // indirect
	golang.org/x/sync v0.20.0 // indirect
	golang.org/x/sys v0.42.0 // indirect
	golang.org/x/text v0.35.0 // indirect
	golang.org/x/tools v0.42.0 // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20240814211410-ddb44dafa142 // indirect
	google.golang.org/protobuf v1.36.11 // indirect
)

// Intra-repo modules resolve to local source. go.work unifies them for
// one-shot `go build ./...` and IDEs; these replace directives additionally
// let the module build and `go mod tidy` standalone (CI, Docker).
replace (
	github.com/greenhouse-monorepo/libs/common-go => ../../libs/common-go
	github.com/greenhouse-monorepo/libs/models-go => ../../libs/models-go
)

tool github.com/99designs/gqlgen
