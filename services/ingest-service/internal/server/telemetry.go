// Package server implements the gRPC TelemetryService.
package server

import (
	"context"
	"io"
	"log/slog"

	greenhousev1 "github.com/greenhouse-monorepo/libs/models-go/gen/greenhouse/v1"
)

// TelemetryServer implements greenhousev1.TelemetryServiceServer.
//
// Embedding UnimplementedTelemetryServiceServer keeps the type forward
// compatible when new RPCs are added to the proto contract.
type TelemetryServer struct {
	greenhousev1.UnimplementedTelemetryServiceServer
	log *slog.Logger
}

func NewTelemetryServer(log *slog.Logger) *TelemetryServer {
	return &TelemetryServer{log: log}
}

// IngestReadings persists a batch of readings. Scaffold: the persistence
// layer (TimescaleDB insert) is left as a TODO.
func (s *TelemetryServer) IngestReadings(
	_ context.Context,
	req *greenhousev1.IngestReadingsRequest,
) (*greenhousev1.IngestReadingsResponse, error) {
	s.log.Info("ingest batch", "count", len(req.GetReadings()))
	// TODO: validate readings and insert into TimescaleDB.
	return &greenhousev1.IngestReadingsResponse{
		Accepted: uint32(len(req.GetReadings())),
	}, nil
}

// StreamReadings consumes a client-side stream from an always-connected
// edge device until the client closes it.
func (s *TelemetryServer) StreamReadings(
	stream greenhousev1.TelemetryService_StreamReadingsServer,
) error {
	var accepted uint32
	for {
		reading, err := stream.Recv()
		if err == io.EOF {
			return stream.SendAndClose(&greenhousev1.IngestReadingsResponse{Accepted: accepted})
		}
		if err != nil {
			return err
		}
		// TODO: persist reading.
		_ = reading
		accepted++
	}
}
