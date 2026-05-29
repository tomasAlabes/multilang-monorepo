# Third-party deps are declared as explicit python_requirement targets rather
# than a python_requirements(source="pyproject.toml"): grpcio and the
# greenhouse-* libs are already provided by other targets in the resolve
# (libs/models-py:reqs, libs/common-py), so generating a full set from
# pyproject here would make those modules ambiguous. tailor is told not to
# re-add a `reqs` target (see [tailor].ignore_adding_targets in pants.toml).
python_requirement(name="numpy", requirements=["numpy>=2.0"])
python_requirement(name="scikit-learn", requirements=["scikit-learn>=1.5"])
python_requirement(name="types-protobuf", requirements=["types-protobuf"])

# Mirrors the docker_image targets on the Go services.
docker_image(
    name="image",
    source="Dockerfile",
)
