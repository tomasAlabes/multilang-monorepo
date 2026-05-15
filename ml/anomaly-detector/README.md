# anomaly-detector (Python ML)

gRPC service implementing `AnomalyDetectionService` from `libs/proto`. The
Go `api-gateway` calls it to score incoming telemetry.

- **Model:** `model.py` — a z-score detector (scaffold). Swap in a trained
  model without changing `server.py`.
- **Depends on:** `models-py`, `common-py` (`[tool.uv.sources]` workspace
  deps + Nx `implicitDependencies`).
- **Affected cascade:** editing `anomaly.proto` → `models-py` regenerates →
  this service is rebuilt and re-tested.

```bash
nx test anomaly-detector     # pytest — runs without codegen
nx serve anomaly-detector    # gRPC server on :50052 (needs codegen first)
```
