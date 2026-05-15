# common-go

Shared Go packages used by every service:

- `config` — environment-based configuration helpers.
- `log` — structured `slog` logger with a consistent JSON format.

Import path: `github.com/greenhouse-monorepo/libs/common-go/...`. Registered
in the root `go.work`. Services list it under `implicitDependencies` so Nx
knows a change here marks them affected.
