include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  source = "${get_repo_root()}//infra/modules/deployment-manifest"
}

# The deployable units in this monorepo. Image tags are illustrative; in a real
# setup these would come from a dependency on the image-build pipeline.
inputs = {
  services = {
    "ingest-service" = {
      image_tag = "latest"
      replicas  = 2
    }
    "api-gateway" = {
      image_tag = "latest"
      replicas  = 2
    }
    "anomaly-detector" = {
      image_tag = "latest"
      replicas  = 1
    }
  }
}
