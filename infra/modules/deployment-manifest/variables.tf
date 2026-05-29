variable "environment" {
  description = "Target environment name (e.g. dev, production)."
  type        = string
}

variable "services" {
  description = <<-EOT
    Map of greenhouse services to deploy, keyed by service name. Each entry
    declares the container image tag and desired replica count. Mirrors the
    set of deployable units in this monorepo (Go services + Python ML).
  EOT
  type = map(object({
    image_tag = string
    replicas  = number
  }))
}

variable "output_dir" {
  description = "Directory the rendered deployment manifest is written to."
  type        = string
  default     = "out"
}
