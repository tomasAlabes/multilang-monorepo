# Build context is the repo ROOT (see docker-compose.yml) so the build can
# see go.work and the intra-repo modules this service depends on.
FROM golang:1.24-alpine AS build
WORKDIR /src

# Copy the workspace file and only the modules this service needs.
COPY go.work ./
COPY libs/common-go ./libs/common-go
COPY libs/models-go ./libs/models-go
COPY services/ingest-service ./services/ingest-service

RUN go build -o /out/ingest-service ./services/ingest-service/cmd/server

# Minimal runtime image.
FROM gcr.io/distroless/static-debian12
COPY --from=build /out/ingest-service /ingest-service
EXPOSE 50051
ENTRYPOINT ["/ingest-service"]
