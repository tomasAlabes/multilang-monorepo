# proto — gRPC API contracts & shared domain model

The single source of truth for the system. Every shared type and every
service-to-service RPC contract is defined here.

| File              | Purpose                                                     |
| ----------------- | ----------------------------------------------------------- |
| `greenhouse.proto`| Domain model: `Greenhouse`, `Zone`, `Sensor`, `SensorType`. |
| `telemetry.proto` | `TelemetryService` — implemented by the Go ingest-service.  |
| `anomaly.proto`   | `AnomalyDetectionService` — implemented by the Python ML module. |

## Codegen

`buf generate` (or `nx codegen proto`) fans these protos out into:

- `libs/models-go`  — Go structs + gRPC stubs
- `libs/models-ts`  — TypeScript types (protobuf-es)
- `libs/models-py`  — Python classes + gRPC stubs

## Why this is the root of the affected-graph

`models-ts`, `models-go` and `models-py` declare an **implicit dependency**
on this project. Any change here marks all three as affected, which cascades
to every service and app downstream. See the root `README.md`.
