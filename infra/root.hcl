# Terragrunt root configuration shared by every unit under live/.
#
# This is a credential-free, self-contained sample: state is kept in a local
# backend and the only providers used are `null` and `local`, so `terragrunt
# run plan|apply` works with no cloud account. The real Source.ag infra repo
# (source-infra) follows the same root.hcl + modules/ + live/ layout but with
# an S3 backend and AWS providers.

locals {
  env_vars    = read_terragrunt_config(find_in_parent_folders("env.hcl"))
  environment = local.env_vars.locals.environment
}

# Local backend instead of S3 — no credentials required. Terragrunt writes one
# state file per unit, namespaced by the unit's path relative to the repo root.
remote_state {
  backend = "local"

  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }

  config = {
    path = "${get_terragrunt_dir()}/terraform.tfstate"
  }
}

# Inputs every unit receives; individual units merge their own on top.
inputs = {
  environment = local.environment
}
