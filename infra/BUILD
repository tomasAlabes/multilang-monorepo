# Terragrunt has no native Pants backend — like gqlgen and buf elsewhere in
# this repo, it is wrapped as a shell target. But unlike those codegen steps,
# infra commands are side-effecting (they touch local state and would hit a
# cloud backend in a real setup), so they use `run_shell_command`, which
# executes in the workspace rather than a sandbox. This is the Pants analogue
# of the native branch's Makefile target or main's nx:run-commands.

# The Terragrunt + Terraform source. Declared so the run targets formalize a
# dependency on it (a .tf/.hcl edit is tracked), mirroring how the codegen
# shell_commands depend on their proto/schema inputs.
files(
    name="sources",
    sources=["root.hcl", "modules/**/*.tf", "modules/**/*.lock.hcl", "live/**/*.hcl"],
)

# Format every .hcl file under infra/. workdir defaults to this BUILD's
# directory (infra/), so `terragrunt hcl format` walks the whole tree.
run_shell_command(
    name="fmt",
    command="terragrunt hcl format",
    execution_dependencies=[":sources"],
)
