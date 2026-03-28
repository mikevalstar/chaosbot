import { Link } from "@tanstack/react-router";

export function Home() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Chaosbot</h1>
      <ul>
        <li>
          <Link to="/hello">Hello</Link>
        </li>
        <li>
          <Link to="/health">Health</Link>
        </li>
      </ul>
    </div>
  );
}
