package_json()

# Pants has no protobuf->TypeScript backend, so buf is wrapped as a
# shell_command. Declaring the proto target as a dependency keeps models-ts
# on the same affected-graph as the natively generated Go/Python code: edit
# a .proto and Pants reruns this command and everything downstream of it.
shell_command(
    name="protobuf-ts",
    command="buf generate",
    tools=["buf"],
    execution_dependencies=["//libs/proto/greenhouse/v1:v1"],
    output_directories=["src/gen"],
    workdir=".",
)
