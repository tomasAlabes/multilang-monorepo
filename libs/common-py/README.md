# common-py (`greenhouse-common`)

Shared Python utilities — currently a structured `structlog` logger that
matches the Go services' JSON log format. Consumed by `anomaly-detector`
via a `[tool.uv.sources]` workspace dependency and Nx `implicitDependencies`.
