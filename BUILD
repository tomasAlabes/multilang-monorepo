package_json()

# buf config files must be explicit dependencies so they land in the
# shell_command sandbox when `buf generate` runs.
files(
    name="buf-config",
    sources=["buf.gen.yaml", "buf.yaml"],
)
