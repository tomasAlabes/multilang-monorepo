# The Go module is the single root go.mod; `pants tailor ::` adds the
# go_package / go_binary targets under cmd/ and internal/, and Pants infers
# the dependency on the generated protobuf package in libs/models-go.
docker_image(
    name="image",
    source="Dockerfile",
)
