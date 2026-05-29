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
