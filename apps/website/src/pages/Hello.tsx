import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "../fetchJson.ts";

export function Hello() {
  const hello = useQuery({
    queryKey: ["hello"],
    queryFn: () => fetchJson<{ message: string }>("/api/hello"),
  });

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Hello</h1>
      {hello.isLoading && <p>Loading...</p>}
      {hello.isError && <p>Error: {hello.error.message}</p>}
      {hello.data && <p>{hello.data.message}</p>}
    </div>
  );
}
