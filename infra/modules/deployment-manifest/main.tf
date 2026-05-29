# Renders a deployment manifest for the greenhouse services to a local file.
# Credential-free stand-in for "real" infra: it exercises the full Terragrunt
# init/plan/apply lifecycle (providers, generated backend, outputs) without
# touching a cloud account, so the sample stays verifiable like `main`.

locals {
  manifest = {
    environment = var.environment
    services = {
      for name, svc in var.services : name => {
        image    = "greenhouse/${name}:${svc.image_tag}"
        replicas = svc.replicas
      }
    }
  }
}

resource "local_file" "manifest" {
  filename = "${var.output_dir}/deployment.${var.environment}.json"
  content  = jsonencode(local.manifest)
}

# Stands in for a post-apply rollout hook; re-runs whenever the manifest changes.
resource "null_resource" "rollout" {
  triggers = {
    manifest = local_file.manifest.content
  }
}
