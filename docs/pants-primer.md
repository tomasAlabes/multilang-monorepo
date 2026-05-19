# Pants primer for this repo

A practical introduction to the Pants concepts you'll encounter day-to-day.
Everything below is grounded in the actual files in this repo; check the
linked paths when in doubt.

---

## 1. What Pants is (the mental model)

Pants is a build system that treats the entire monorepo as a single,
fine-grained dependency graph. Every source file belongs to a **target**;
targets declare (or Pants infers) what they depend on. When you run any Pants
command, it walks only the portion of the graph relevant to what you asked for.

The key difference from Nx or Make: **Pants understands the source code**.
It parses `import` statements in Python, Go, and TypeScript and builds the
dependency graph itself. You don't hand-maintain a dependency map.

---

## 2. BUILD files and targets

Every directory that contains source files Pants needs to know about has a
`BUILD` file next to it. A BUILD file is a Python-like DSL that declares
**targets** — named units of buildable/testable/runnable stuff.

```python
# libs/proto/greenhouse/v1/BUILD
protobuf_sources(
    name="v1",
    grpc=True,
)
```

Common target types you'll see in this repo:

| Target type         | What it represents                                  |
| ------------------- | --------------------------------------------------- |
| `python_sources`    | a Python module (`.py` files)                       |
| `python_tests`      | pytest test files                                   |
| `pex_binary`        | a runnable Python artifact (self-contained zip)     |
| `python_requirements` | third-party deps from a `pyproject.toml`          |
| `go_mod`            | a `go.mod` root; Pants discovers packages under it  |
| `go_package`        | a single Go package (usually auto-generated)        |
| `go_binary`         | a runnable Go binary                                |
| `protobuf_sources`  | `.proto` files; triggers native codegen             |
| `package_json`      | a Node/TS workspace package                         |
| `shell_command`     | an arbitrary command wrapped as a cacheable target  |
| `docker_image`      | a `Dockerfile` build                                |

**`pants tailor ::`** scans the repo and generates BUILD entries for
everything routine. Run it after adding new source files or packages.
`pants tailor --check ::` (what CI does) fails if the BUILD files are stale.

---

## 3. Target addresses

Every target has a unique **address** you use on the command line:

```
//libs/proto/greenhouse/v1:v1
^^ directory              ^^ target name (defaults to directory basename)
```

Shorthand rules:
- `//libs/proto/greenhouse/v1` → same as `:v1` when name matches basename
- `::` → every target in the repo (recursive glob)
- `libs/proto::` → every target under `libs/proto/`
- `ml/anomaly-detector/src/anomaly_detector:server` → a specific named target

You can pass addresses or globs to any goal:

```bash
pants test ml/anomaly-detector::
pants lint libs/common-py::
pants run ml/anomaly-detector/src/anomaly_detector:server
```

---

## 4. Dependency inference (the big deal)

This is the feature that makes Pants worth the setup cost.

When a Python file contains `from greenhouse.v1 import sensor_pb2_grpc`,
Pants sees that import, maps it to `//libs/proto/greenhouse/v1:v1`, and adds
the edge automatically. Same for Go: `import "github.com/source-ag/greenhouse/v1"`
is resolved to the generated package. **No `implicitDependencies` to maintain.**

What inference covers in this repo:

| Language   | Inferred from                                | Example edge                              |
| ---------- | -------------------------------------------- | ----------------------------------------- |
| Python     | `import` / `from … import`                   | `anomaly_detector` → `greenhouse.v1` stubs |
| Go         | `import "…"` paths                           | `ingest-service` → `models-go`            |
| TypeScript | `import`/`require` (experimental backend)    | `dashboard` → `models-ts`                 |

Consequence: **edit a `.proto` and every dependent service is automatically
marked affected** — the cascade is real and free.

You can inspect what Pants inferred for a target:

```bash
pants dependencies ml/anomaly-detector/src/anomaly_detector:server
pants dependencies --transitive ml/anomaly-detector/src/anomaly_detector:server
pants dependents libs/proto/greenhouse/v1:v1   # what depends ON proto
```

---

## 5. Source roots

Pants needs to know which directories are "import roots" — the directories
from which Python `import` statements resolve. They're declared in
[`pants.toml`](../pants.toml):

```toml
[source]
root_patterns = [
  "/",
  "/libs/proto",
  "/libs/common-py/src",
  "/libs/models-py/src",
  "/ml/anomaly-detector/src",
]
```

This is why `from greenhouse.v1 import …` works even though the `.proto`
files live under `libs/proto/greenhouse/v1/` — that directory is a root, so
the `greenhouse` package is importable directly.

Go modules are discovered separately via `go_mod` targets, not source roots.

---

## 6. Goals (the commands)

Pants commands are structured as `pants <goal> [targets]`. The main goals:

| Goal              | What it does                                                  |
| ----------------- | ------------------------------------------------------------- |
| `lint`            | Ruff (Python), `gofmt`/`golint` (Go)                         |
| `fmt`             | auto-fix formatting in place                                  |
| `check`           | mypy (Python), `go vet` (Go), TypeScript type-check           |
| `test`            | pytest (Python), `go test` (Go)                               |
| `package`         | build artifacts: PEX binaries, Docker images, Go binaries     |
| `run`             | run a `pex_binary` or `go_binary` directly                    |
| `export-codegen`  | materialise generated files into the source tree (for IDEs)   |
| `tailor`          | generate/refresh BUILD files                                  |
| `dependencies`    | print resolved deps of a target                               |
| `dependents`      | print targets that depend on a target                         |
| `peek`            | print target metadata as JSON                                 |

Run multiple goals at once:

```bash
pants lint check test package ::
```

---

## 7. `--changed-since` — affected-only builds

This is how CI avoids rebuilding everything on every PR.

```bash
pants --changed-since=origin/main \
      --changed-dependents=transitive \
      lint check test package
```

- `--changed-since=origin/main` — diff the current branch against main, find
  all source files that changed, map them to targets.
- `--changed-dependents=transitive` — also include every target that
  **transitively depends** on a changed target.

So changing `libs/proto/greenhouse/v1/sensor.proto` marks as affected:
`models-go`, `models-py`, `ingest-service`, `api-gateway`, `anomaly-detector`
— automatically, because the dependency edges are inferred.

See [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) for the exact
CI invocation.

---

## 8. Codegen: native vs `shell_command`

Pants handles code generation in two ways in this repo:

### Native codegen (proto → Go and Python)

The `pants.backend.codegen.protobuf.python` and
`pants.backend.experimental.codegen.protobuf.go` backends generate stubs
directly from `protobuf_sources` targets. No shell scripts involved; Pants
runs `protoc` internally and wires the output into the dependency graph.

```python
# libs/proto/greenhouse/v1/BUILD
protobuf_sources(name="v1", grpc=True)
```

Any Python or Go file that imports the generated package gets an automatic
dep on this target. To materialise the files into the tree for your IDE:

```bash
pants export-codegen ::
```

### `shell_command` for tools without a Pants backend

For tools Pants doesn't natively support, `shell_command` wraps an arbitrary
command and makes it a first-class cacheable target:

```python
# libs/models-ts/BUILD  (buf for TypeScript)
shell_command(
    name="protobuf-ts",
    command="buf generate",
    tools=["buf"],
    execution_dependencies=["//libs/proto/greenhouse/v1:v1"],
    output_directories=["src/gen"],
)

# services/api-gateway/BUILD  (gqlgen for GraphQL resolvers)
shell_command(
    name="gqlgen",
    command="go tool gqlgen generate",
    tools=["go"],
    execution_dependencies=["//libs/graphql-schema:schema"],
    output_directories=["internal/graph", "internal/resolvers"],
)
```

Key fields:
- `execution_dependencies` — what the command reads; declaring the proto
  target here keeps `models-ts` on the affected graph just like the native
  backends.
- `output_directories` — what the command writes; Pants captures these and
  makes them available to downstream targets.

---

## 9. Python resolves and lockfiles

Pants manages Python third-party deps through **resolves** — named, locked
dependency sets. This repo has one resolve called `default`, backed by
`3rdparty/python/default.lock`.

```toml
# pants.toml
[python.resolves]
default = "3rdparty/python/default.lock"
```

To add a Python dependency:
1. Add it to the relevant `pyproject.toml`.
2. Regenerate the lockfile: `pants generate-lockfiles --resolve=default`.
3. Commit the updated lockfile.

Pants then infers which resolve each `python_sources` target uses and
ensures it gets exactly the pinned versions from that lockfile — no
virtualenv juggling.

---

## 10. Caching

Pants caches at the **target level** in `~/.cache/pants/` (local) and
optionally a remote cache. A target is re-executed only if its inputs
(sources + deps + tool versions) change. The cache key is a content hash,
not a timestamp.

In CI, `pantsbuild/actions/init-pants` wires the GitHub Actions cache into
Pants's named caches (pip downloads, Go SDK, pnpm store). The cache key
includes lockfile hashes so a `go.sum` or lockfile change automatically
invalidates the relevant cached outputs.

---

## Quick-reference cheatsheet

```bash
# Setup
pants tailor ::                              # refresh BUILD files after adding code
pants export-codegen ::                      # write generated files for IDE

# Day-to-day
pants lint check test ::                     # everything
pants test ml/anomaly-detector::             # one project
pants run ml/anomaly-detector/src/anomaly_detector:server

# Understand the graph
pants dependencies --transitive services/ingest-service::
pants dependents libs/proto/greenhouse/v1:v1

# Affected only (mirrors CI)
pants --changed-since=origin/main \
      --changed-dependents=transitive \
      lint check test package

# Python deps
pants generate-lockfiles --resolve=default   # after editing a pyproject.toml

# Build artifacts
pants package services/ingest-service::      # Go binary + Docker image
pants package ml/anomaly-detector/src/anomaly_detector:server  # PEX
```
