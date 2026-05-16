# Greenhouse Monitoring — polyglot monorepo (Pants variant)

> This is the **`experiment/pants`** branch. Same modules as `main`, but
> orchestrated by [Pants](https://www.pantsbuild.org/) instead of Nx.
> Compare: `git diff main HEAD`. See also `experiment/native-paths-filter`.

A sample monorepo for a greenhouse climate-monitoring platform, spanning
three languages with shared contracts.

| Layer        | Tech                                  | Projects                          |
| ------------ | ------------------------------------- | --------------------------------- |
| Frontend     | Next.js (App Router) + React 19       | `apps/dashboard`                  |
| Services     | Go 1.25, gRPC + GraphQL               | `services/ingest-service`, `services/api-gateway` |
| ML           | Python 3.12, gRPC                     | `ml/anomaly-detector`             |
| Contracts    | Protobuf (Buf) + GraphQL SDL          | `libs/proto`, `libs/graphql-schema` |
| Shared code  | Generated models + common libs        | `libs/models-*`, `libs/common-*`, `libs/ui` |

## Why Pants here

Pants's headline feature is **fine-grained dependency inference**. It parses
imports — Python `import`, Go `import`, JS/TS `import`/`require` — and builds
the dependency graph itself. Compared with the other branches:

| | how the affected-graph is built |
| --- | --- |
| `main` (Nx) | TS inferred; **Go/Python edges hand-declared** in `implicitDependencies` |
| `experiment/native-paths-filter` | **fully hand-maintained** `.github/filters.yaml` |
| `experiment/pants` (here) | **inferred for Python and Go** — no dependency config to maintain |

Add the protobuf backends and Pants even infers that a Go/Python file
importing the generated `greenhouse.v1` package depends on `libs/proto`.
Edit a `.proto` and every dependent service is affected automatically.

## Orchestration

| Concern                | Mechanism                                              |
| ---------------------- | ------------------------------------------------------ |
| Config                 | `pants.toml` (one file, all languages)                 |
| Targets                | `BUILD` files — `pants tailor ::` generates most       |
| Protobuf → Go/Python   | native Pants backends (`protobuf_sources(grpc=True)`)  |
| Protobuf → TypeScript  | **no native backend** — `buf` wrapped as `shell_command` |
| gRPC/GraphQL codegen   | `gqlgen` wrapped as `shell_command`                    |
| Affected detection     | `pants --changed-since --changed-dependents=transitive`|
| Caching                | per-target local cache + optional remote cache         |

```bash
pants tailor ::                       # generate/refresh BUILD files
pants lint check test ::              # everything
pants --changed-since=origin/main \
      --changed-dependents=transitive \
      lint check test package         # affected only (what CI runs)
pants run ml/anomaly-detector/src/anomaly_detector:server
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

## BUILD files

Pants targets live in `BUILD` files next to the code. `pants tailor ::`
generates the routine ones (`python_sources`, `python_tests`, `go_package`,
`go_binary`); this scaffold hand-writes only the targets that need
configuration:

- `libs/proto/greenhouse/v1/BUILD` — `protobuf_sources(grpc=True)`
- `libs/{common,models}-go/BUILD`, `services/*/BUILD` — `go_mod`
- `ml/anomaly-detector/.../BUILD` — `python_sources`, `python_tests`, `pex_binary`
- `apps/dashboard`, `libs/{ui,common-ts,models-ts}/BUILD` — `package_json`
- `shell_command` targets wrap `buf` (TS codegen) and `gqlgen`
- `docker_image` targets for each service

CI runs `pants tailor --check` so a PR that adds code without a target fails.

## Honest trade-offs

Pants is not a free win for this stack:

- **Python**: first-class — inference, lockfiles, PEX packaging, the works.
- **Go**: solid, including native protobuf codegen.
- **JavaScript/TypeScript**: the backends are **experimental**. Next.js
  builds and `graphql-codegen` are driven through `package.json` scripts /
  `shell_command`s, so the TS side gets coarser caching than the Go/Python
  side. Nx (`main`) remains stronger for the frontend.
- **Protobuf → TypeScript**: no Pants backend exists; `buf` is wrapped as a
  `shell_command`.
- **Learning curve**: `BUILD` files, resolves, and the daemon are a real
  ramp-up cost versus per-language native tools.

## Generated code

Idiomatically, Pants treats codegen as a build action: you would **not**
commit `libs/models-*/**` generated output — Pants regenerates it from the
`protobuf_source` targets and `pants export-codegen ::` materialises it for
IDEs. For parity with the other branches in this sample, the generated code
is left committed here; in a real Pants repo, `.gitignore` it.

## Toolchain

Pants 2.27 · Go 1.25 · Python 3.12 · Node 22 · Buf v2. Pants provisions the
Python interpreter and Go SDK itself; Node/pnpm are pinned in `mise.toml`.

> Like `experiment/native-paths-filter`, this branch is a **structured
> scaffold** — the `pants.toml`, `BUILD` files and CI show the shape of a
> Pants setup but have not been run end-to-end here. `main` is the verified,
> buildable branch.
