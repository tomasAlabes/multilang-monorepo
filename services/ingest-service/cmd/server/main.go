// Command ingest-service runs the gRPC TelemetryService that field gateways
// stream greenhouse sensor readings into.
package main

import (
	"net"
	"os"

	"github.com/greenhouse-monorepo/libs/common-go/config"
	"github.com/greenhouse-monorepo/libs/common-go/log"
	greenhousev1 "github.com/greenhouse-monorepo/libs/models-go/gen/greenhouse/v1"
	"github.com/greenhouse-monorepo/services/ingest-service/internal/server"
	"google.golang.org/grpc"
)

func main() {
	logger := log.New("ingest-service")
	port := config.GetOr("GRPC_PORT", "50051")

	lis, err := net.Listen("tcp", ":"+port)
	if err != nil {
		logger.Error("failed to listen", "error", err)
		os.Exit(1)
	}

	grpcServer := grpc.NewServer()
	greenhousev1.RegisterTelemetryServiceServer(grpcServer, server.NewTelemetryServer(logger))

	logger.Info("ingest-service listening", "port", port)
	if err := grpcServer.Serve(lis); err != nil {
		logger.Error("server stopped", "error", err)
		os.Exit(1)
	}
}
