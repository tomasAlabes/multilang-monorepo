go_mod(name="mod")

# `pants tailor ::` adds the go_package / go_binary targets under cmd/ and
# internal/. Pants infers the dependency on the generated protobuf package.
docker_image(
    name="image",
    source="Dockerfile",
)
