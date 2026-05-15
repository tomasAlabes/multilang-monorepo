import { formatReading } from "@greenhouse/common";

export interface SensorCardProps {
  label: string;
  value: number;
  unit: string;
  /** Whether the ML module flagged the latest reading as anomalous. */
  anomalous?: boolean;
}

/**
 * Compact tile showing a single sensor's latest reading. Shared between the
 * dashboard's overview grid and the per-greenhouse detail page.
 */
export function SensorCard({ label, value, unit, anomalous = false }: SensorCardProps) {
  return (
    <article
      style={{
        padding: "1rem",
        borderRadius: 8,
        border: `1px solid ${anomalous ? "#d9480f" : "#dee2e6"}`,
        background: anomalous ? "#fff4e6" : "#fff",
      }}
    >
      <h3 style={{ margin: 0, fontSize: "0.85rem", color: "#868e96" }}>{label}</h3>
      <p style={{ margin: "0.25rem 0 0", fontSize: "1.5rem", fontWeight: 600 }}>
        {formatReading(value, unit)}
      </p>
      {anomalous && (
        <span style={{ fontSize: "0.75rem", color: "#d9480f" }}>⚠ anomaly detected</span>
      )}
    </article>
  );
}
