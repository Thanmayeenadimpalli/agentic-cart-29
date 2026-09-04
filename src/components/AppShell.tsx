import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { CartDrawer } from "@/components/CartDrawer";
import { AgentPanel } from "@/components/AgentPanel";
import { CheckpointModal } from "@/components/CheckpointModal";
import { RazorpaySimModal } from "@/components/RazorpaySimModal";
import { HowItWorksModal } from "@/components/HowItWorksModal";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>{children}</main>
      <footer className="mt-16 border-t border-border py-8 text-center text-xs text-muted-foreground">
        AgenticCart — a deterministic AI shopping agent demo. No LLM calls, no real payments.
      </footer>
      <CartDrawer />
      <AgentPanel />
      <CheckpointModal />
      <RazorpaySimModal />
      <HowItWorksModal />
    </div>
  );
}
