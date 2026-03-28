import { rootRoute } from "./__root.tsx";
import { indexRoute } from "./index.tsx";
import { helloRoute } from "./hello.tsx";
import { healthRoute } from "./health.tsx";

export const routeTree = rootRoute.addChildren([indexRoute, helloRoute, healthRoute]);
