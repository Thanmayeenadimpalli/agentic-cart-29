# AgenticCart

An autonomous AI shopping agent demo built for the Razorpay AI Buildathon 2026.

**Everything here is a deterministic simulation.**

- **No LLM calls.** Intent parsing is regex + a keyword dictionary; item selection is a greedy
  value-per-rupee algorithm with category coverage (`src/engine/agentEngine.ts`). The same prompt
  always produces the same cart.
- **No real payments.** The Razorpay-style checkout is an original simulated overlay. No gateway is
  contacted, no money moves, and card inputs are cosmetic (Luhn format check only).
- **No backend, no API keys.** Catalog, cart and orders live in the browser via localStorage
  (`src/data/mockDb.ts`), with simulated 300–900ms latency.
- **Human in the loop.** The agent can never pay on its own — every purchase stops at a review
  checkpoint with per-item reasoning, GST/shipping rule traces and a constraint compliance checklist.
- **Auditable.** Agent decisions and payment webhooks are stored with each order and re-readable
  from Order History.

Run with `npm install && npm run dev`.
