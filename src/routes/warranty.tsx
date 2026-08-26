import { createFileRoute } from "@tanstack/react-router";
import Warranty from "@/pages/legal/Warranty";

export const Route = createFileRoute("/warranty")({
  component: Warranty,
});
