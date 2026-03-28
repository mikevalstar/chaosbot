import { createRootRoute, Outlet, Link } from "@tanstack/react-router";

export const rootRoute = createRootRoute({
  component: () => (
    <div>
      <nav style={{ padding: "1rem", borderBottom: "1px solid #333" }}>
        <Link to="/" style={{ marginRight: "1rem" }}>
          Home
        </Link>
        <Link to="/hello" style={{ marginRight: "1rem" }}>
          Hello
        </Link>
        <Link to="/health">Health</Link>
      </nav>
      <Outlet />
    </div>
  ),
});
