import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./__root.tsx";
import { Health } from "../pages/Health.tsx";

export const healthRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/health",
  component: Health,
});
