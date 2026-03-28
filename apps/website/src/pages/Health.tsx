import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "../fetchJson.ts";

export function Health() {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: () => fetchJson<{ status: string; timestamp: string }>("/api/health"),
  });

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Health</h1>
      {health.isLoading && <p>Loading...</p>}
      {health.isError && <p>Error: {health.error.message}</p>}
      {health.data && (
        <p>
          Status: <strong>{health.data.status}</strong> &mdash; {health.data.timestamp}
        </p>
      )}
    </div>
  );
}
