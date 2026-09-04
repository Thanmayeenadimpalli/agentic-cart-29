import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, ChevronDown, Circle, Loader2 } from "lucide-react";
import type { AgentStep } from "@/types";

function StatusIcon({ status }: { status: AgentStep["status"] }) {
  if (status === "complete")
    return (
      <span className="grid h-7 w-7 place-items-center rounded-full bg-success text-success-foreground">
        <Check className="h-4 w-4" />
      </span>
    );
  if (status === "in-progress")
    return (
      <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
      </span>
    );
  if (status === "error")
    return (
      <span className="grid h-7 w-7 place-items-center rounded-full bg-destructive text-destructive-foreground">
        <AlertTriangle className="h-4 w-4" />
      </span>
    );
  return (
    <span className="grid h-7 w-7 place-items-center rounded-full border border-border bg-muted text-muted-foreground">
      <Circle className="h-3 w-3" />
    </span>
  );
}

export function AgentWorkflowTimeline({ steps }: { steps: AgentStep[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <ol className="relative space-y-1">
      {steps.map((step, idx) => {
        const open = expanded === step.id;
        return (
          <li key={step.id} className="relative pl-10">
            {idx < steps.length - 1 && (
              <span
                className={`absolute left-[13px] top-8 h-[calc(100%-1rem)] w-px ${
                  step.status === "complete" ? "bg-success/50" : "bg-border"
                }`}
              />
            )}
            <span className="absolute left-0 top-1">
              <StatusIcon status={step.status} />
            </span>
            <button
              onClick={() => setExpanded(open ? null : step.id)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-muted"
            >
              <span
                className={`text-sm font-medium ${
                  step.status === "error"
                    ? "text-destructive"
                    : step.status === "pending"
                      ? "text-muted-foreground"
                      : "text-foreground"
                }`}
              >
                {step.label}
              </span>
              {step.durationMs > 0 && (
                <span className="text-[11px] text-muted-foreground">{step.durationMs}ms</span>
              )}
              <ChevronDown
                className={`ml-auto h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <ul className="mb-2 ml-2 space-y-1 rounded-lg bg-muted/60 p-3 text-[12px] leading-relaxed text-muted-foreground">
                    {step.detailLog.length ? (
                      step.detailLog.map((line, i) => <li key={i}>• {line}</li>)
                    ) : (
                      <li>No detail recorded yet for this step.</li>
                    )}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ol>
  );
}
