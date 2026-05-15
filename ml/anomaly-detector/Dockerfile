# Build context is the repo ROOT (see docker-compose.yml).
FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv
WORKDIR /app

# Copy the workspace root manifest and the members this service needs.
COPY pyproject.toml ./
COPY libs/models-py ./libs/models-py
COPY libs/common-py ./libs/common-py
COPY ml/anomaly-detector ./ml/anomaly-detector

RUN uv sync --package anomaly-detector --no-dev

EXPOSE 50052
ENV GRPC_PORT=50052
CMD ["uv", "run", "--package", "anomaly-detector", "python", "-m", "anomaly_detector.server"]
