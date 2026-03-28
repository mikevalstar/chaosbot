import { createFileRoute } from "@tanstack/react-router";
import { Hello } from "../pages/Hello.tsx";

export const Route = createFileRoute("/hello")({
  component: Hello,
});
