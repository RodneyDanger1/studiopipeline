import { createFileRoute } from "@tanstack/react-router";
import { StudioDesk } from "@/components/studio/desk";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <StudioDesk />;
}
