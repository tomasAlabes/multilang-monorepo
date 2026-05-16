go_mod(name="mod")

# gqlgen has no native Pants backend; it is wrapped as a shell_command so it
# still participates in the graph and cache. It depends on the GraphQL
# contract, so a schema change reruns it.
shell_command(
    name="gqlgen",
    command="go tool gqlgen generate",
    tools=["go"],
    execution_dependencies=["//libs/graphql-schema:schema"],
    output_directories=["internal/graph", "internal/resolvers"],
    workdir=".",
)

docker_image(
    name="image",
    source="Dockerfile",
)
