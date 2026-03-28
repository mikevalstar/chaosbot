import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./__root.tsx";
import { Home } from "../pages/Home.tsx";

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});
