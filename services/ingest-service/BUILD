# The Go module is the single root go.mod; `pants tailor ::` adds the
# go_package / go_binary targets under cmd/ and internal/, and Pants infers
# the dependency on the generated protobuf package in libs/models-go.
docker_image(
    name="image",
    source="Dockerfile",
    repository="ingest-service",
    # The Dockerfile compiles from source in a golang build stage; Pants fills
    # the build context from dependencies, so stage the Go source via //:go-src.
    dependencies=["//:go-src"],
)
