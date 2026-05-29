# gqlgen has no native Pants backend. `go tool gqlgen` resolves through the
# `tool` directive in the root go.mod, which needs the real go.mod/go.sum
# and module cache — none of which exist in a sandboxed shell_command. Like
# the infra targets (and unlike the self-contained `buf` codegen, which uses
# remote plugins), it therefore runs in the workspace as a run_shell_command.
# Regenerate the resolvers with `pants run services/api-gateway:gqlgen`.
run_shell_command(
    name="gqlgen",
    command="go tool gqlgen generate",
    execution_dependencies=["//libs/graphql-schema:schema"],
)

docker_image(
    name="image",
    source="Dockerfile",
    repository="api-gateway",
    # Compiles from source (incl. the committed gqlgen resolvers) in a golang
    # build stage; //:go-src stages the Go source into the build context.
    dependencies=["//:go-src"],
)
