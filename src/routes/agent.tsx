import { createFileRoute } from "@tanstack/react-router";
import { Bot } from "lucide-react";
import { AgentConsole } from "@/components/AgentConsole";

export const Route = createFileRoute("/agent")({
  head: () => ({
    meta: [
      { title: "Agent Console — AgenticCart" },
      {
        name: "description",
        content:
          "Run the AgenticCart shopping agent full screen: parsed constraints, live workflow timeline, thought log and cart preview.",
      },
      { property: "og:title", content: "Agent Console — AgenticCart" },
      {
        property: "og:description",
        content: "Watch the deterministic shopping agent reason step by step before it asks for your approval.",
      },
    ],
  }),
  component: AgentPage,
});

function AgentPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </span>
          Agent Console
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Every step below is a deterministic TypeScript function — the same prompt always produces the same cart.
        </p>
      </header>
      <div className="rounded-2xl border border-border bg-card">
        <AgentConsole />
      </div>
    </div>
  );
}
