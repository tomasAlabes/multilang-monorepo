import { SensorCard } from "@greenhouse/ui";

// Per-greenhouse detail page. In a structured scaffold the sensor readings
// are illustrative; wire them to the `greenhouse(id)` GraphQL query and the
// `readings` subscription to make them live.
export default async function GreenhouseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const readings = [
    { label: "Air temperature", value: 23.4, unit: "celsius", anomalous: false },
    { label: "Humidity", value: 61.2, unit: "%RH", anomalous: false },
    { label: "CO₂", value: 1480, unit: "ppm", anomalous: true },
    { label: "Soil moisture", value: 38.0, unit: "%", anomalous: false },
  ];

  return (
    <main style={{ padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
      <h1>Greenhouse {id}</h1>
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "1rem",
        }}
      >
        {readings.map((r) => (
          <SensorCard key={r.label} {...r} />
        ))}
      </section>
    </main>
  );
}
