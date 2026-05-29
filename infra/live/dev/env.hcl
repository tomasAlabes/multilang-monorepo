# Environment-scoped variables, read by root.hcl via find_in_parent_folders.
# Mirrors source-infra's account.hcl/domain.hcl split, collapsed to one file
# for this single-environment sample.
locals {
  environment = "dev"
}
