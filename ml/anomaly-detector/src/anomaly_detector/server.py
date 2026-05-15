"""gRPC server exposing the AnomalyDetectionService from libs/proto."""

import os
from concurrent import futures

import grpc

# Generated from libs/proto by `buf generate` (the greenhouse-models package).
from greenhouse.v1 import anomaly_pb2, anomaly_pb2_grpc
from greenhouse_common import get_logger

from anomaly_detector.model import ZScoreDetector

log = get_logger("anomaly-detector")


class AnomalyService(anomaly_pb2_grpc.AnomalyDetectionServiceServicer):
    def __init__(self) -> None:
        self._detector = ZScoreDetector()

    def DetectAnomalies(self, request, context):  # noqa: N802 (gRPC naming)
        anomalies = []
        for reading in request.readings:
            # TODO: load this sensor's rolling baseline from the feature store.
            verdict = self._detector.evaluate(reading.value, baseline=[])
            if verdict.anomalous:
                anomalies.append(
                    anomaly_pb2.Anomaly(
                        sensor_id=reading.sensor_id,
                        severity=anomaly_pb2.ANOMALY_SEVERITY_WARNING,
                        description="reading outside expected range",
                        observed_value=reading.value,
                        expected_value=verdict.expected,
                        score=verdict.score,
                    )
                )
        return anomaly_pb2.DetectAnomaliesResponse(anomalies=anomalies)


def serve() -> None:
    port = os.environ.get("GRPC_PORT", "50052")
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=8))
    anomaly_pb2_grpc.add_AnomalyDetectionServiceServicer_to_server(AnomalyService(), server)
    server.add_insecure_port(f"[::]:{port}")
    log.info("anomaly-detector listening", port=port)
    server.start()
    server.wait_for_termination()


if __name__ == "__main__":
    serve()
