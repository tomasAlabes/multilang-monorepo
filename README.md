# Greenhouse Monitoring — polyglot monorepo (native-tooling variant)

> This is the **`experiment/native-paths-filter`** branch. It builds the
> exact same modules as `main` but **without Nx** — each language keeps its
> native tooling, glued by a `Makefile`, with CI driven by path filters.
> See `main` for the Nx version and compare: `git diff main HEAD`.

A sample monorepo for a greenhouse climate-monitoring platform, spanning
three languages with shared contracts.

| Layer        | Tech                                  | Projects                          |
| ------------ | ------------------------------------- | --------------------------------- |
| Frontend     | Next.js (App Router) + React 19       | `apps/dashboard`                  |
| Services     | Go 1.25, gRPC + GraphQL               | `services/ingest-service`, `services/api-gateway` |
| ML           | Python 3.12, gRPC                     | `ml/anomaly-detector`             |
| Contracts    | Protobuf (Buf) + GraphQL SDL          | `libs/proto`, `libs/graphql-schema` |
| Shared code  | Generated models + common libs        | `libs/models-*`, `libs/common-*`, `libs/ui` |

## Orchestration — no Nx

| Concern                 | Tool                                              |
| ----------------------- | ------------------------------------------------- |
| TypeScript task graph   | **Turborepo** (`turbo.json`)                      |
| Go modules              | **`go.work`** workspace                           |
| Python packages         | **`uv`** workspace (`pyproject.toml`)             |
| Protobuf codegen        | **Buf** (`buf.yaml`, `buf.gen.yaml`)              |
| Cross-language entry    | **`Makefile`**                                    |
| CI affected-detection   | **`dorny/paths-filter`** + `.github/filters.yaml` |

```bash
make install      # pnpm install + go work sync + uv sync
make codegen      # buf generate -> models-ts/go/py
make build        # turbo (TS) + go build + uv build
make test
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

gRPC (`libs/proto`) is the internal contract; GraphQL (`libs/graphql-schema`)
is the public, frontend-facing contract served by the gateway (BFF).

## The affected graph — done by hand

This is the key difference from the Nx branch. There is **no single
cross-language project graph**:

- **Turborepo** computes affected projects *within TypeScript* from
  `package.json` dependencies — but it cannot see the `proto → models-ts`
  edge, because no JS dependency expresses it.
- So `.github/filters.yaml` encodes the **full dependency map by hand**.
  Each project's filter lists its own paths *plus its dependencies' paths*.
  YAML anchors make the cascade DRY — `libs/proto` is referenced (via the
  `&proto` anchor) by every downstream filter, so a proto change triggers
  every dependent CI job:

```
proto ──▶ models-ts  ──▶ dashboard
      ├─▶ models-go  ──▶ ingest-service, api-gateway
      └─▶ models-py  ──▶ anomaly-detector
```

**Trade-off:** this map must be kept in sync with real dependencies
manually. Miss an edge and CI silently skips an affected project — the
failure mode Nx's inferred graph removes. That is the cost of dropping Nx.

## CI — `.github/workflows/`

- **`ci.yml`** — a `changes` job runs `dorny/paths-filter`; one job per
  service/app runs only when `if: needs.changes.outputs.<project> == 'true'`.
  Each job sets up just the toolchain it needs and calls a `make` target.
- **`codegen-verify.yml`** — on proto changes: lint, format, breaking-change
  detection, and a stale-generated-code check.

## Shared code & generated models

`libs/proto` is the single source of truth for the domain model. `buf
generate` fans it out into `models-ts`, `models-go`, `models-py`. Generated
code is committed; `codegen-verify` fails any PR that edits a `.proto`
without regenerating.

> Module-level READMEs reference `nx <target> <project>` commands (shared
> with the `main` branch). The equivalent here is the matching `make`
> target — e.g. `nx build ingest-service` → `make build-ingest-service`.

## Note on lockfiles

`pnpm-lock.yaml` is inherited from `main` and still pins Nx rather than
Turborepo. On this illustrative branch run `pnpm install` once to re-resolve
it against this `package.json`. The Go (`go.sum`) and Python (`uv.lock`)
lockfiles are orchestrator-agnostic and need no change.

## Toolchain

Node 22 · pnpm 9 · Go 1.25 · Python 3.12 · Turborepo 2 · Buf v2 — pinned in
`mise.toml`.
