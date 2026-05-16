# The single source of truth. Pants generates Go and Python code from these
# protos natively (the protobuf.go / protobuf.python backends). Any Go or
# Python file that imports the generated package gets an inferred dependency
# on this target — so a proto change transitively marks every dependent
# service affected, with zero hand-written dependency config.
protobuf_sources(
    name="v1",
    grpc=True,
)
