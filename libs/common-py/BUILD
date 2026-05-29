# Third-party requirements declared in pyproject.toml become python_requirement
# targets; Pants infers which ones each module actually imports.
python_requirements(
    name="reqs",
    source="pyproject.toml",
)

# Declares this directory as a first-party distribution so that any
# python_requirement for "greenhouse-common" resolves locally rather than
# hitting PyPI.
python_distribution(
    name="dist",
    dependencies=["libs/common-py/src/greenhouse_common"],
    provides=python_artifact(
        name="greenhouse-common",
        version="0.0.0",
    ),
    generate_setup=False,
)
