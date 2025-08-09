import { Conversation } from "@/components/Conversation";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Conversation messages={[]} />;
}
