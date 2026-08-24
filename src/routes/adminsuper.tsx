import { createFileRoute } from "@tanstack/react-router";
import AdminSuper from "@/pages/AdminSuper";

export const Route = createFileRoute("/adminsuper")({
  component: AdminSuper,
});
