# api-gateway (Go)

The public **GraphQL** API, serving the schema in `libs/graphql-schema`. It
is a Backend-for-Frontend: resolvers fan out over **gRPC** to the
`ingest-service` and the Python `anomaly-detector`.

- **Depends on:** `graphql-schema`, `models-go`, `common-go`.
- **Two codegen inputs feed it:**
  - a `graphql-schema` change → `gqlgen` regenerates `internal/graph`;
  - a `proto` change → `models-go` regenerates the gRPC clients.
  Either marks `api-gateway` affected in CI.

```bash
nx codegen api-gateway   # gqlgen generate
nx serve api-gateway     # GraphQL playground on :8080
```

> The committed `internal/graph/doc.go` is a placeholder; run `nx codegen
> api-gateway` to produce the real executable schema.
