import { AnimatePresence, motion } from "framer-motion";
import { Bot, X } from "lucide-react";
import { useAgent } from "@/context/AgentContext";
import { AgentConsole } from "@/components/AgentConsole";

export function AgentPanel() {
  const { panelOpen, setPanelOpen } = useAgent();

  return (
    <AnimatePresence>
      {panelOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPanelOpen(false)}
            className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-[2px] lg:hidden"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed bottom-0 right-0 z-50 flex h-[90vh] w-full flex-col rounded-t-2xl border border-border bg-card shadow-2xl sm:h-full sm:max-w-md sm:rounded-none sm:border-l"
          >
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </span>
                AI Shopping Agent
              </h2>
              <button onClick={() => setPanelOpen(false)} aria-label="Close agent panel" className="rounded-md p-1 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </header>
            <AgentConsole />
            <p className="border-t border-border px-5 py-2 text-[10px] text-muted-foreground">
              Deterministic simulation — no LLM calls, no real payments.
            </p>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
