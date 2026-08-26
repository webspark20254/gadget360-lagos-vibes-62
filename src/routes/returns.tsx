import { createFileRoute } from "@tanstack/react-router";
import Returns from "@/pages/legal/Returns";

export const Route = createFileRoute("/returns")({
  component: Returns,
});
