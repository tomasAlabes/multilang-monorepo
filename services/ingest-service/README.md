# ingest-service (Go)

gRPC service implementing `TelemetryService` from `libs/proto`. Field
gateways stream sensor readings in; downstream services query the latest
value.

- **Depends on:** `models-go`, `common-go` (Nx `implicitDependencies`).
- **Affected cascade:** editing `telemetry.proto` → `models-go` regenerates →
  this service is rebuilt and re-tested by `nx affected`.

```bash
nx serve ingest-service     # go run ./cmd/server
nx build ingest-service
```

> Compiles once `buf generate` has produced `libs/models-go/gen`. On a fresh
> clone run `nx codegen proto` (or `buf generate`) first.
