# Side-effecting Terragrunt operations for the dev/deployment-manifest unit.
# Each is a root target invoked with `pants run`, e.g.
#   pants run infra/live/dev/deployment-manifest:plan
#
# workdir defaults to this BUILD's directory, which is the Terragrunt unit
# (where terragrunt.hcl lives), so no cd is needed. terragrunt/terraform come
# from the mise-provisioned PATH. We depend on //infra:sources so a change to
# the module or root config is tracked against these targets.

run_shell_command(
    name="validate",
    command="terragrunt run --non-interactive validate",
    execution_dependencies=["//infra:sources"],
)

run_shell_command(
    name="plan",
    command="terragrunt run --non-interactive plan",
    execution_dependencies=["//infra:sources"],
)

run_shell_command(
    name="apply",
    command="terragrunt run --non-interactive -- apply -auto-approve",
    execution_dependencies=["//infra:sources"],
)

run_shell_command(
    name="destroy",
    command="terragrunt run --non-interactive -- destroy -auto-approve",
    execution_dependencies=["//infra:sources"],
)
