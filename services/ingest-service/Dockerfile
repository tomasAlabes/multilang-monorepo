# Build context is the repo ROOT (see docker-compose.yml) so the build can see
# the single root go.mod and the first-party packages this service imports.
FROM golang:1.25-alpine AS build
WORKDIR /src

# Copy the root module manifest and only the packages this service needs.
COPY go.mod go.sum ./
COPY libs/common-go ./libs/common-go
COPY libs/models-go ./libs/models-go
COPY services/ingest-service ./services/ingest-service

RUN go build -o /out/ingest-service ./services/ingest-service/cmd/server

# Minimal runtime image.
FROM gcr.io/distroless/static-debian12
COPY --from=build /out/ingest-service /ingest-service
EXPOSE 50051
ENTRYPOINT ["/ingest-service"]
