# Build context is the repo ROOT (see docker-compose.yml).
FROM golang:1.25-alpine AS build
WORKDIR /src

COPY go.mod go.sum ./
COPY libs/common-go ./libs/common-go
COPY libs/models-go ./libs/models-go
COPY services/api-gateway ./services/api-gateway

# Generated gqlgen code is committed, so the build is a plain compile.
RUN go build -o /out/api-gateway ./services/api-gateway/cmd/server

FROM gcr.io/distroless/static-debian12
COPY --from=build /out/api-gateway /api-gateway
EXPOSE 8080
ENTRYPOINT ["/api-gateway"]
