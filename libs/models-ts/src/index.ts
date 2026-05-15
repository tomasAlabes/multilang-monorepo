// Barrel for the generated protobuf-es types.
//
// `buf generate` writes the protobuf-es output into ./gen. After the first
// codegen run, re-export the generated modules here, e.g.:
//
//   export * from "./gen/greenhouse/v1/greenhouse_pb.js";
//   export * from "./gen/greenhouse/v1/telemetry_pb.js";
//   export * from "./gen/greenhouse/v1/anomaly_pb.js";
//
// Consumers then import from the stable package path:
//
//   import { Greenhouse, SensorReading } from "@greenhouse/models";
//
// Until codegen runs, this barrel is intentionally empty so a fresh
// checkout type-checks cleanly.
export {};
