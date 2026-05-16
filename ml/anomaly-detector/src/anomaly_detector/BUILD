python_sources()

# Runnable artifact. `pants package ml/anomaly-detector/src/anomaly_detector:server`
# builds a self-contained PEX; Pants infers its dependencies (numpy,
# scikit-learn, the generated greenhouse.v1 gRPC stubs) from imports.
pex_binary(
    name="server",
    entry_point="server.py",
)
