# models-go

Go structs and gRPC client/server stubs generated from `libs/proto`.

- **Import path:** `github.com/greenhouse-monorepo/libs/models-go/gen/greenhouse/v1`
- **Consumed by:** `ingest-service`, `api-gateway` (declared in their
  `project.json` `implicitDependencies`).
- **Graph edge:** `implicitDependencies: ["proto"]`.

The module is registered in the root `go.work`, so consumers resolve it to
this local source without `replace` directives. Generated `*.pb.go` files
are committed — see `libs/models-ts/README.md` for the rationale.
