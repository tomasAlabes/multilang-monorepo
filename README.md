# Greenhouse Monitoring — polyglot monorepo

A sample monorepo for a greenhouse climate-monitoring platform, spanning
three languages with shared contracts and an affected-aware CI pipeline.

| Layer        | Tech                                  | Projects                          |
| ------------ | ------------------------------------- | --------------------------------- |
| Frontend     | Next.js (App Router) + React 19       | `apps/dashboard`                  |
| Services     | Go 1.24, gRPC + GraphQL               | `services/ingest-service`, `services/api-gateway` |
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
`buf generate` (`nx codegen proto`) fans it out into three generated
libraries — `models-ts`, `models-go`, `models-py` — one per language. The
generated code is **committed** (see `libs/models-ts/README.md`); the
`codegen-verify` CI job fails any PR that edits a `.proto` without
regenerating.

## The affected graph (build only what changed)

Nx maintains a project graph across all three languages:

- **TypeScript** edges are inferred from imports.
- **Go / Python** edges are declared explicitly via `implicitDependencies`
  in each `project.json` (Nx cannot parse those import graphs).

```
proto ──▶ models-ts ──▶ ui ──▶ dashboard
      ├─▶ models-go ──▶ ingest-service
      │             └─▶ api-gateway
      └─▶ models-py ──▶ anomaly-detector

graphql-schema ──▶ api-gateway
               └─▶ dashboard
```

Because every `models-*` library declares `implicitDependencies: ["proto"]`,
**editing a `.proto` file cascades to every service and app downstream** —
exactly the "auto-gen models change ⇒ dependents rebuild" requirement.
Inspect it with `pnpm graph` (`nx graph`).

`infra` is a first-class Nx project too: Terragrunt (which has no Nx plugin)
is wrapped via `nx:run-commands` — `nx run infra:plan|apply|validate|fmt` — the
same way the Go/Python projects are. It is standalone (no `implicitDependencies`);
see `infra/README.md`.

## CI — `.github/workflows/`

- **`ci.yml`** — runs `nx affected -t codegen lint test build`. Only
  projects touched by the diff (plus everything downstream) are built. One
  proto change rebuilds all three languages; a change isolated to
  `apps/dashboard` rebuilds only the dashboard. `nrwl/nx-set-shas` computes
  the correct base/head SHAs for push and PR events.
- **`codegen-verify.yml`** — on proto changes: lint, format, breaking-change
  detection, and a stale-generated-code check.

## Getting started

```bash
mise install            # Node, pnpm, Go, Python, uv, buf
pnpm install
nx codegen proto        # buf generate -> models-ts/go/py
nx run-many -t build    # or: nx affected -t build
docker compose up       # full local stack
```

> Service code that imports generated types compiles only **after**
> `nx codegen proto` has run. The committed placeholders keep import paths
> resolvable on a fresh clone.

## Toolchain

Node 22 · pnpm 9 · Go 1.24 · Python 3.12 · Nx 21 · Buf v2 · Terraform 1.14.7 ·
Terragrunt 0.99.4 — all pinned in `mise.toml`.

## Alternative orchestration branches

The same modules are scaffolded under two other build systems, so the
orchestration layer can be compared directly:

- **`experiment/native-paths-filter`** — no framework: per-language native
  tooling (Turborepo, `go.work`, `uv`) glued by a `Makefile`, with CI using
  `dorny/paths-filter` and a hand-maintained dependency map.
- **`experiment/pants`** — [Pants](https://www.pantsbuild.org/): the
  affected-graph is *inferred* from imports across Python and Go (no
  `implicitDependencies`, no filters), at the cost of experimental JS/TS
  support.

Compare with `git diff main experiment/native-paths-filter` or
`git diff main experiment/pants`. `main` (Nx) is the verified, buildable
branch; the other two are structured scaffolds.
