import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApp } from "@/context/AppContext";

export function HowItWorksModal() {
  const { infoOpen, setInfoOpen } = useApp();
  return (
    <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>How this demo works</DialogTitle>
          <DialogDescription>
            Built for the Razorpay AI Buildathon 2026 — everything here is a deterministic simulation.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">No LLM calls.</span> The "AI agent" is a rule-based
            TypeScript pipeline: a regex/keyword intent parser plus a greedy value-per-rupee selection algorithm.
            The same prompt always produces the same cart.
          </li>
          <li>
            <span className="font-medium text-foreground">No real payments.</span> The Razorpay-style checkout is an
            original simulation. Nothing is charged, no gateway is contacted, and card fields are cosmetic only.
          </li>
          <li>
            <span className="font-medium text-foreground">Human in the loop.</span> The agent can never pay on its
            own — every purchase stops at a review checkpoint where you inspect the reasoning behind every item and
            every rupee.
          </li>
          <li>
            <span className="font-medium text-foreground">Fully auditable.</span> Agent decisions, constraint checks
            and payment webhooks are written to an audit trail you can re-read from Order History.
          </li>
          <li>
            <span className="font-medium text-foreground">Local only.</span> Catalog, cart and orders live in your
            browser via localStorage. No backend, no keys.
          </li>
        </ul>
      </DialogContent>
    </Dialog>
  );
}
