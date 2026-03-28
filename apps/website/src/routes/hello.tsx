import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./__root.tsx";
import { Hello } from "../pages/Hello.tsx";

export const helloRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hello",
  component: Hello,
});
