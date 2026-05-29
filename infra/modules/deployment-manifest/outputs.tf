output "manifest_path" {
  description = "Path to the rendered deployment manifest."
  value       = local_file.manifest.filename
}

output "service_count" {
  description = "Number of services included in the manifest."
  value       = length(var.services)
}
