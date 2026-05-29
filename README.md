# Greenhouse Monitoring — polyglot monorepo

A sample monorepo for a greenhouse climate-monitoring platform, spanning
three languages with shared contracts and an affected-aware CI pipeline.

| Layer        | Tech                                  | Projects                          |
| ------------ | ------------------------------------- | --------------------------------- |
| Frontend     | Next.js (App Router) + React 19       | `apps/dashboard`                  |
| Services     | Go 1.25, gRPC + GraphQL               | `services/ingest-service`, `services/api-gateway` |
| ML           | Python 3.12, gRPC                     | `ml/anomaly-detector`             |
| Contracts    | Protobuf (Buf) + GraphQL SDL          | `libs/proto`, `libs/graphql-schema` |
| Shared code  | Generated models + common libs        | `libs/models-*`, `libs/common-*`, `libs/ui` |

## Layout

```
apps/dashboard           Next.js frontend
services/                Go services
  ingest-service           gRPC TelemetryService — sensor ingest
  api-gateway              GraphQL BFF — fans out to gRPC
ml/anomaly-detector      Python gRPC AnomalyDetectionService
libs/
  proto                  gRPC contracts + domain model (source of truth)
  graphql-schema         public GraphQL API contract
  models-ts/go/py        GENERATED types — one per language
  common-ts/go/py        shared utilities, one per language
  ui                     shared React component library
infra/                   Terragrunt (Terraform) — credential-free IaC sample
  modules/                 reusable Terraform module
  live/dev/                the deployment-manifest unit
```

## Architecture

```
            ┌─────────────┐   GraphQL    ┌──────────────┐
   browser ─┤  dashboard  ├──────────────┤ api-gateway  │
            └─────────────┘              └──────┬───────┘
                                          gRPC  │
                              ┌──────────────────┴───────────┐
                              ▼                              ▼
                     ┌─────────────────┐          ┌────────────────────┐
                     │ ingest-service  │          │  anomaly-detector  │
                     │      (Go)       │          │      (Python)      │
                     └─────────────────┘          └────────────────────┘
```

- **gRPC** is the internal service-to-service contract (`libs/proto`).
- **GraphQL** is the public, frontend-facing contract (`libs/graphql-schema`),
  served by the gateway in a Backend-for-Frontend pattern.

## Shared code & generated models

`libs/proto` is the **single source of truth** for the domain model. Running
`pants export-codegen ::` (or the CI `pants package` target) fans it out into
three generated libraries — `models-ts`, `models-go`, `models-py` — one per
language. The generated code is **committed** (see `libs/models-ts/README.md`);
the `codegen-verify` CI job fails any PR that edits a `.proto` without
regenerating.

## The affected graph (build only what changed)

Pants infers the dependency graph by parsing imports across all three languages
— no manual dependency declarations needed:

- **Python** edges are inferred from `import` statements.
- **Go** edges are inferred from `import` paths (including generated packages).
- **TypeScript** uses `package_json` targets; Next.js builds run via scripts.

```
proto ──▶ models-ts ──▶ ui ──▶ dashboard
      ├─▶ models-go ──▶ ingest-service
      │             └─▶ api-gateway
      └─▶ models-py ──▶ anomaly-detector

graphql-schema ──▶ api-gateway
               └─▶ dashboard
```

Because Pants parses `import greenhouse.v1` directly from source, **editing a
`.proto` file cascades to every service and app downstream** — no
`implicitDependencies` config to maintain.

## Orchestration

| Concern                | Mechanism                                              |
| ---------------------- | ------------------------------------------------------ |
| Config                 | `pants.toml` (one file, all languages)                 |
| Targets                | `BUILD` files — `pants tailor ::` generates most       |
| Protobuf → Go/Python   | native Pants backends (`protobuf_sources(grpc=True)`)  |
| Protobuf → TypeScript  | `buf` wrapped as `shell_command`                       |
| gRPC/GraphQL codegen   | `gqlgen` wrapped as `shell_command`                    |
| IaC (Terragrunt)       | `run_shell_command` targets (`pants run infra:…`)      |
| Affected detection     | `pants --changed-since --changed-dependents=transitive`|
| Caching                | per-target local cache + optional remote cache         |

## CI — `.github/workflows/`

- **`ci.yml`** — runs `pants --changed-since=origin/main --changed-dependents=transitive lint check test package`. Only targets touched by the diff (plus everything downstream) are built. One proto change rebuilds all three languages; a change isolated to `apps/dashboard` rebuilds only the dashboard.
- **`codegen-verify.yml`** — on proto changes: lint, format, breaking-change detection, and a stale-generated-code check.
- `pants tailor --check` runs on every PR; adding code without a `BUILD` target fails the check.

## Getting started

```bash
mise install                          # Node, pnpm, Go, Python, uv, buf
pnpm install                          # JS deps (dashboard / libs)
pants export-codegen ::               # buf generate -> models-ts/go/py
pants lint check test ::              # everything
docker compose up                     # full local stack
```

```bash
# affected only (what CI runs)
pants --changed-since=origin/main \
      --changed-dependents=transitive \
      lint check test package

pants run ml/anomaly-detector/src/anomaly_detector:server
```

> Service code that imports generated types compiles only **after**
> `pants export-codegen` has run. The committed placeholders keep import
> paths resolvable on a fresh clone.

## BUILD files

Pants targets live in `BUILD` files next to the code. `pants tailor ::`
generates the routine ones (`python_sources`, `python_tests`, `go_package`,
`go_binary`); only targets needing explicit configuration are hand-written:

- `libs/proto/greenhouse/v1/BUILD` — `protobuf_sources(grpc=True)`
- `libs/{common,models}-go/BUILD`, `services/*/BUILD` — `go_mod`
- `ml/anomaly-detector/.../BUILD` — `python_sources`, `python_tests`, `pex_binary`
- `apps/dashboard`, `libs/{ui,common-ts,models-ts}/BUILD` — `package_json`
- `shell_command` targets wrap `buf` (TS codegen) and `gqlgen`
- `infra/**/BUILD` — `run_shell_command` targets wrap `terragrunt`; side-effecting
  infra ops run in the workspace, unlike the sandboxed codegen `shell_command`s
  (see `infra/README.md`)
- `docker_image` targets for each service

## Toolchain

Pants 2.30 · Go 1.25 · Python 3.12 · Node 22 · Buf v2 · Terraform 1.14.7 ·
Terragrunt 0.99.4 — all pinned in `mise.toml` / `pants.toml`. Pants provisions
the Python interpreter and Go SDK itself; Node/pnpm and Terraform/Terragrunt
are managed by `mise`.

## Alternative orchestration branches

The same modules are scaffolded under two other build systems, so the
orchestration layer can be compared directly:

- **`main`** — [Nx](https://nx.dev/): TS dependency graph inferred; Go/Python
  edges declared via `implicitDependencies` in `project.json`.
- **`experiment/native-paths-filter`** — no framework: per-language native
  tooling (Turborepo, `go.work`, `uv`) glued by a `Makefile`, with CI using
  `dorny/paths-filter` and a hand-maintained dependency map.

Compare with `git diff main HEAD` or `git diff main experiment/native-paths-filter`.
