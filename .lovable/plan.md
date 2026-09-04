# AgenticCart — Autonomous AI Shopping Agent Demo

A fully client-side demo store where a simulated "AI agent" reads a shopping request in plain English, builds a cart, explains every choice, asks for your approval, then runs a fake Razorpay-style checkout. No real money, no AI API calls — all reasoning is deterministic TypeScript.

## Stack note (one deviation from the brief)

The project is built on TanStack Start + TanStack Router, not React Router. Routing stays TanStack (`/`, `/product/$id`, `/agent`, `/orders`, `/orders/$id`, `/order-confirmation/$id`); everything else in the brief is unchanged. All data stays local (in-memory + localStorage), no backend.

## What gets built

### Catalog & storefront (`/`)
- 44 mock products across Outerwear, Tops, Bottoms, Footwear, Accessories; INR 299–8,000; tags (winter, formal, casual, budget, premium, sport); picsum seeded images.
- Sticky navbar: AgenticCart logo, Shop / Orders links, cart icon with badge, "AI Shopping Agent" toggle, "How this demo works" info modal.
- Hero banner, responsive product grid, filters (category, price range) and sort (price, rating), product cards with hover elevation, ₹ Indian comma formatting.
- Slide-in cart drawer (manual shopping works independently of the agent), loading skeletons, empty states, 404 page.

### Product detail (`/product/$id`)
Gallery, size/color selectors, description, add to cart.

### AI agent sidebar (and `/agent` full page)
- Chat-style input + 4 example prompt chips.
- Deterministic parser: regex budget extraction, keyword→tag dictionary, outfit-completeness detection, clarifying-question fallback for empty/gibberish input.
- Live "Agent Thought Log" stream.

### Animated workflow timeline
Five stages with spinner→check status, expandable detail panels, simulated 400–1200ms delays:
1. Understanding Intent — parsed constraints as pills
2. Browsing Catalog — animated scan counter shrinking to shortlist
3. Selecting Items — greedy value-per-rupee + category-coverage selection, items animate into cart preview
4. Calculating Pricing — per-item GST slab (12% under ₹1,000/unit, 18% at ₹1,000+), shipping free ≥ ₹2,000 else ₹99, line-item breakdown
5. Ready for Review — opens the checkpoint

Any stage can enter a red error state with a human-readable explanation.

### Guardrail checkpoint modal
- Cart summary table with thumbnails.
- Per-item "Why did the AI choose this?" panel built from real decision variables: score, candidates considered, remaining budget at selection time, rejected alternatives with reasons.
- Full pricing breakdown with the rule behind every number.
- Constraint compliance checklist (budget, category coverage) with pass/fail; Approve disabled on any fail.
- Approve requires an explicit "I have reviewed the AI's reasoning" acknowledgement; Reject logs the rejection to the audit trail.

### Mock Razorpay checkout
Original simulated overlay clearly badged "Test Mode — Simulated Payment, No Real Transaction". Tabs for UPI / Cards / Netbanking / Wallet with cosmetic validation (Luhn check on card number). Pay → 1.5–3s processing → simulated webhook: 90% success (green success animation, status `paid`, `webhookReceivedAt`), 10% failure/timeout with Retry. Hidden dev toggle forces failure and timeout for demo control. Success auto-navigates to Order Confirmation.

### Orders & audit (`/orders`, `/orders/$id`)
Status badges (Paid / Failed / Timeout / Rejected / Pending); detail view replays the complete audit trail — agent reasoning plus payment lifecycle — exactly as shown at checkpoint time.

### Error handling & safety
Global ErrorBoundary fallback; try/catch around every simulated async call; no-match path offering "Show partial match" / "Adjust budget"; 15s payment timeout guard; idempotency key per session with optimistic button disable; localStorage rehydration that tolerates malformed data.

### Design system
Deep indigo/violet primary, emerald approve, amber warning, red error, slate neutrals, white rounded-xl cards with soft shadows; Inter via a link tag in the root route; 8px spacing scale; Framer Motion transitions; mobile-first with the agent panel becoming a bottom sheet.

## Technical layout

```text
src/data/        mockProducts.ts, mockDb.ts (localStorage + latency sim), taxRules.ts
src/engine/      agentEngine.ts (parser, candidate filter, selection, justifications)
src/types/       index.ts (Product, CartItem, AgentStep, AgentSession, Order, AuditLogEntry)
src/context/     AppContext, CartContext, AgentContext (useReducer)
src/components/  navbar, product grid/card, cart drawer, agent panel,
                 AgentWorkflowTimeline, CheckpointModal, RazorpaySimModal, audit views
src/routes/      index, product.$id, agent, orders, orders.$id, order-confirmation.$id
```

Mock DB reads/writes are `setTimeout`-wrapped promises with 300–900ms randomized delay. Every route gets its own `head()` metadata. README documents that all AI reasoning and payments are deterministic simulations.

## Build order

1. Types, mock catalog, mock DB, tax rules, design tokens
2. Storefront, product detail, cart drawer, navbar
3. Agent engine + parser + selection algorithm with decision traces
4. Agent sidebar + workflow timeline
5. Checkpoint modal with audit and compliance checklist
6. Razorpay simulation + confirmation page
7. Orders + audit trail views
8. Error states, timeouts, idempotency, ErrorBoundary, polish
