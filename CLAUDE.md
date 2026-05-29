# CLAUDE.md

Sample **polyglot monorepo** for a greenhouse climate-monitoring platform:
TypeScript (Next.js), Go services, Python ML, with shared gRPC + GraphQL
contracts. Built as a reference for current monorepo best practices.

## Branches — read this first

The **same modules** are scaffolded under three orchestrators, one per branch:

| Branch | Orchestrator | State |
| --- | --- | --- |
| `main` | **Nx** | verified — install, codegen and `build` all pass |
| `experiment/native-paths-filter` | native tooling (Turborepo + `go.work` + `uv` + `Makefile`), CI via `dorny/paths-filter` | structured scaffold |
| `experiment/pants` | **Pants** | structured scaffold |

Only `main` is verified buildable; the two `experiment/*` branches are
scaffolds (representative config, not run end-to-end). The orchestration
files differ per branch, but **shared source** (protos, service/app/lib code)
is meant to stay consistent — a change there usually belongs on all three.

## Toolchain — mise

All tools are pinned in `mise.toml` and provisioned by **mise**: Node 22,
pnpm 9, Go 1.25, Python 3.12, uv, buf. `pnpm` / `go` / `buf` are mise shims —
if invoking them directly fails, prefix with `mise exec --`
(e.g. `mise exec -- pnpm install`). The config must be trusted once with
`mise trust`.

## Layout

```
apps/dashboard                       Next.js + React frontend
services/{ingest-service,api-gateway} Go — gRPC service + GraphQL BFF
ml/anomaly-detector                  Python — gRPC ML service
libs/proto                           protobuf contracts — SOURCE OF TRUTH
libs/graphql-schema                  public GraphQL SDL
libs/models-{ts,go,py}               generated types, one per language
libs/common-{ts,go,py}, libs/ui      shared code
infra/{modules,live}                 Terragrunt (Terraform) — IaC sample
```

## Commands (main / Nx branch)

```bash
mise exec -- pnpm install
mise exec -- pnpm exec nx codegen proto         # buf generate
mise exec -- pnpm exec nx run-many -t build     # build everything
mise exec -- pnpm exec nx affected -t build     # build only affected
mise exec -- pnpm exec nx show projects --affected --files=<path>
```

- Go (workspace mode forbids `-mod=mod`; tidy each module standalone):
  `cd services/<svc> && mise exec -- env GOWORK=off go mod tidy && go build ./...`
- Python tests: `mise exec -- uv run pytest ml/anomaly-detector`
- Infra (Terragrunt): `mise exec -- pnpm exec nx run infra:plan` (also
  `validate`, `apply`, `destroy`, `fmt`). Credential-free sample — local
  backend + `null`/`local` providers. See `infra/README.md`.

## Conventions

- **`libs/proto` is the single source of truth.** Edit `.proto`, then run
  `buf generate` (`nx codegen proto`). Never hand-edit generated code.
- **Generated code is committed** — `models-{ts,go,py}`, gqlgen output,
  graphql-codegen output. `codegen-verify.yml` fails PRs with stale output.
- **Affected graph:** Nx infers TypeScript edges from imports; Go/Python
  edges are declared in each `project.json` `implicitDependencies`. When you
  add a cross-language dependency, declare it there or the cascade misses it.
- **gRPC = internal** service-to-service; **GraphQL = public** frontend
  contract (api-gateway is a Backend-for-Frontend). The dashboard depends on
  the contracts, never directly on a Go service.
- Go: intra-repo modules use `replace` directives plus `go.work`; gqlgen runs
  via the Go `tool` directive (`go tool gqlgen generate`).
- TS: cross-package imports (`@greenhouse/*`) resolve through pnpm workspace
  symlinks to each package's built `dist` — do **not** add tsconfig `paths`.

## Gotchas

- Go 1.25 is required (current gqlgen needs it).
- `nx affected` needs git history; CI uses `nrwl/nx-set-shas` for the base SHA.
- A `.proto` change cascades to all three languages — expect a wide affected
  set; that is intended.
