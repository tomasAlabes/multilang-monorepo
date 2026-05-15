import Link from "next/link";
import { gqlClient } from "../lib/graphql-client";

interface GreenhousesData {
  greenhouses: {
    id: string;
    name: string;
    location: string;
    zones: { id: string }[];
  }[];
}

const GREENHOUSES_QUERY = /* GraphQL */ `
  query Greenhouses {
    greenhouses {
      id
      name
      location
      zones {
        id
      }
    }
  }
`;

// Server Component: fetched on the server against the api-gateway.
export default async function HomePage() {
  let data: GreenhousesData = { greenhouses: [] };
  try {
    data = await gqlClient.request<GreenhousesData>(GREENHOUSES_QUERY);
  } catch {
    // Scaffold: the gateway may not be running yet — render an empty state.
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
      <h1>Greenhouses</h1>
      {data.greenhouses.length === 0 && (
        <p style={{ color: "#868e96" }}>
          No data. Start the stack with <code>docker compose up</code>.
        </p>
      )}
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.75rem" }}>
        {data.greenhouses.map((g) => (
          <li key={g.id}>
            <Link href={`/greenhouses/${g.id}`}>
              <strong>{g.name}</strong> — {g.location} ({g.zones.length} zones)
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
