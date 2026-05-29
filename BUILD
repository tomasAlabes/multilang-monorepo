# The single Go module for the whole repo lives at the root go.mod. Pants
# resolves first-party Go imports within one module (it does not follow
# go.work / replace across modules), so every Go package is addressed under
# this one go_mod. `pants tailor ::` fills in the go_package / go_binary
# targets throughout libs/ and services/.
go_mod(name="mod")

# The repo-root package.json is only the pnpm workspace anchor (private, no
# build output of its own). Pants cannot form a valid address for a
# package_json target at the build root — `//#package.json` has no name part —
# so the workspace members under apps/* and libs/* carry their own
# package_json() targets instead, and pnpm-workspace.yaml anchors the workspace.

# buf config files must be explicit dependencies so they land in the
# shell_command sandbox when `buf generate` runs.
files(
    name="buf-config",
    sources=["buf.gen.yaml", "buf.yaml"],
)

# The Go source + module manifest as plain files, so the service `docker_image`
# builds can COPY them into their build context. The images compile the binary
# inside a `golang` build stage (a normal multi-stage Dockerfile), so the Go
# toolchain in that stage resolves everything for the target Linux platform —
# Pants only has to stage the source. (Pants will not stage `go_package`
# *source* into a Docker context, and cross-building the binary itself fails on
# a non-Linux host because GOOS-specific deps like golang.org/x/sys/unix aren't
# in the host-resolved package set — so build-from-source is the robust path.)
files(
    name="go-src",
    sources=[
        "go.mod",
        "go.sum",
        "libs/common-go/**/*.go",
        "libs/models-go/**/*.go",
        "services/**/*.go",
    ],
)

# Likewise for the anomaly-detector image: it `uv sync`s from source, so its
# Docker build context needs the uv workspace manifest/lock and the Python
# workspace members it COPYs.
files(
    name="py-src",
    sources=[
        "pyproject.toml",
        "uv.lock",
        "libs/common-py/**",
        "libs/models-py/**",
        "ml/anomaly-detector/**",
    ],
)

# And for the dashboard image: the pnpm workspace manifests/lockfile plus the
# dashboard and the TS libs it depends on. Build artifacts are excluded so the
# in-container `pnpm install` / `next build` start clean (the .dockerignore
# does the same for `docker compose`).
files(
    name="js-src",
    sources=[
        "package.json",
        "pnpm-lock.yaml",
        "pnpm-workspace.yaml",
        "tsconfig.base.json",
        "libs/common-ts/**",
        "libs/models-ts/**",
        "libs/ui/**",
        "apps/dashboard/**",
        "!**/node_modules/**",
        "!**/.next/**",
        "!**/dist/**",
    ],
)

# `buf generate` is the single command that fans the proto sources out into
# all three committed model libraries (models-go, models-ts, models-py). Like
# the infra targets it is side-effecting — it writes generated files back into
# the workspace — so it is a `run_shell_command` (workspace) rather than a
# sandboxed `shell_command`. Run it with `pants run :codegen`.
run_shell_command(
    name="codegen",
    command="buf generate",
    execution_dependencies=[
        "//libs/proto/greenhouse/v1:v1",
        "//:buf-config",
    ],
)
