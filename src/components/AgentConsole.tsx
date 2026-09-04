import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Bot, RotateCcw, Send, ShieldCheck } from "lucide-react";
import { useAgent } from "@/context/AgentContext";
import { AgentWorkflowTimeline } from "@/components/AgentWorkflowTimeline";
import { formatINR } from "@/data/taxRules";

const EXAMPLES = [
  "Find and buy a complete winter outfit under ₹6,000",
  "Formal look under ₹4,000",
  "Budget gym gear under ₹2,500",
  "Complete rainy day outfit under ₹100",
];

export function AgentConsole() {
  const {
    session,
    clarification,
    running,
    runAgent,
    resetSession,
    acceptPartialMatch,
    openCheckpoint,
  } = useAgent();
  const [input, setInput] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (running) return;
    await runAgent(input);
  };

  const submitExample = async (text: string) => {
    setInput(text);
    if (!running) await runAgent(text);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
              maxLength={280}
              placeholder="e.g. Find and buy a complete winter outfit under ₹6,000"
              className="w-full resize-none rounded-xl border border-border bg-background p-3 pr-12 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              disabled={running}
              aria-label="Run agent"
              className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => submitExample(ex)}
                disabled={running}
                className="rounded-full border border-border bg-muted/50 px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
              >
                {ex}
              </button>
            ))}
          </div>
        </form>

        {clarification && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs text-foreground"
          >
            <Bot className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p>{clarification}</p>
          </motion.div>
        )}

        {session && (
          <div className="space-y-5">
            {session.parsedConstraints && (
              <div className="flex flex-wrap gap-1.5">
                {session.parsedConstraints.budget !== null && (
                  <Pill label={`Budget ≤ ${formatINR(session.parsedConstraints.budget)}`} />
                )}
                {session.parsedConstraints.occasion && <Pill label={session.parsedConstraints.occasion} />}
                {session.parsedConstraints.tags.map((t) => (
                  <Pill key={t} label={`#${t}`} />
                ))}
                {session.parsedConstraints.requiresCompleteOutfit && <Pill label="Complete outfit" />}
              </div>
            )}

            <AgentWorkflowTimeline steps={session.steps} />

            {session.thoughtLog.length > 0 && (
              <div className="rounded-xl border border-border bg-muted/40 p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Agent thought log
                </p>
                <ul className="space-y-1 font-mono text-[11px] leading-relaxed text-muted-foreground">
                  <AnimatePresence initial={false}>
                    {session.thoughtLog.map((line, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
                        › {line}
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
            )}

            {session.selectedCart.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Agent cart preview
                </p>
                {session.selectedCart.map((item) => (
                  <motion.div
                    key={item.product.id}
                    initial={{ opacity: 0, x: 24, scale: 0.96 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-2"
                  >
                    <img src={item.product.imageUrl} alt={item.product.name} className="h-12 w-10 rounded-md object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{item.product.name}</p>
                      <p className="text-[11px] text-muted-foreground">{item.product.category}</p>
                    </div>
                    <span className="text-xs font-semibold">{formatINR(item.product.price)}</span>
                  </motion.div>
                ))}
                <div className="flex justify-between rounded-xl bg-brand-soft p-3 text-sm font-semibold text-accent-foreground">
                  <span>Total</span>
                  <span>{formatINR(session.total)}</span>
                </div>
              </div>
            )}

            {session.status === "error" && session.errorMessage && (
              <div className="space-y-3 rounded-xl border border-destructive/40 bg-destructive/10 p-3">
                <p className="flex gap-2 text-xs text-foreground">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  {session.errorMessage}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={acceptPartialMatch}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Show partial match
                  </button>
                  <button
                    onClick={resetSession}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted"
                  >
                    <RotateCcw className="h-3 w-3" /> Adjust budget
                  </button>
                </div>
              </div>
            )}

            {session.status === "awaiting-approval" && (
              <button
                onClick={openCheckpoint}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <ShieldCheck className="h-4 w-4" /> Open purchase checkpoint
              </button>
            )}

            {session.status === "rejected" && (
              <p className="rounded-xl border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
                You rejected this cart. The rejection is recorded in the audit trail on the Orders page.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-accent-foreground">
      {label}
    </span>
  );
}
