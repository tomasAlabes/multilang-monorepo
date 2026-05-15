// Command api-gateway serves the public GraphQL API and fans out to the
// internal gRPC services (Backend-for-Frontend).
package main

import (
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/greenhouse-monorepo/libs/common-go/config"
	"github.com/greenhouse-monorepo/libs/common-go/log"
	greenhousev1 "github.com/greenhouse-monorepo/libs/models-go/gen/greenhouse/v1"
	"github.com/greenhouse-monorepo/services/api-gateway/internal/graph"
	"github.com/greenhouse-monorepo/services/api-gateway/internal/resolvers"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	logger := log.New("api-gateway")
	port := config.GetOr("HTTP_PORT", "8080")

	resolver := &resolvers.Resolver{
		Telemetry: greenhousev1.NewTelemetryServiceClient(
			dial(config.GetOr("INGEST_ADDR", "localhost:50051")),
		),
		Anomaly: greenhousev1.NewAnomalyDetectionServiceClient(
			dial(config.GetOr("ANOMALY_ADDR", "localhost:50052")),
		),
	}

	srv := handler.NewDefaultServer(
		graph.NewExecutableSchema(graph.Config{Resolvers: resolver}),
	)
	http.Handle("/", playground.Handler("greenhouse", "/query"))
	http.Handle("/query", srv)

	logger.Info("api-gateway listening", "port", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		logger.Error("server stopped", "error", err)
		os.Exit(1)
	}
}

func dial(addr string) *grpc.ClientConn {
	conn, err := grpc.NewClient(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		panic(err)
	}
	return conn
}
