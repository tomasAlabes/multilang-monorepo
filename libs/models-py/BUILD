python_requirements(
    name="reqs",
    source="pyproject.toml",
)

# Declares this directory as a first-party distribution so that any
# python_requirement for "greenhouse-models" resolves locally (via the
# protobuf_sources codegen) rather than hitting PyPI.
python_distribution(
    name="dist",
    dependencies=["libs/proto/greenhouse/v1:v1"],
    provides=python_artifact(
        name="greenhouse-models",
        version="0.0.0",
    ),
    generate_setup=False,
)
