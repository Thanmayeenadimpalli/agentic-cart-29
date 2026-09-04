import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { mockDb, delay } from "@/data/mockDb";
import { calculateAmounts, formatINR } from "@/data/taxRules";
import {
  closestAchievable,
  findCandidates,
  makeId,
  needsClarification,
  parseIntent,
  requiredCategoriesFor,
  selectItems,
  type SelectionResult,
} from "@/engine/agentEngine";
import type {
  AgentSession,
  AgentStep,
  AuditLogEntry,
  CartItem,
  Order,
  PaymentMethod,
  ParsedConstraints,
} from "@/types";

const STEP_TEMPLATE: { id: string; label: string }[] = [
  { id: "intent", label: "Understanding Intent" },
  { id: "browse", label: "Browsing Catalog" },
  { id: "select", label: "Selecting Items" },
  { id: "pricing", label: "Calculating Pricing" },
  { id: "review", label: "Ready for Review" },
];

function blankSteps(): AgentStep[] {
  return STEP_TEMPLATE.map((s) => ({
    ...s,
    status: "pending" as const,
    timestamp: null,
    detailLog: [],
    durationMs: 0,
  }));
}

function emptyConstraints(): ParsedConstraints {
  return {
    budget: null,
    tags: [],
    categories: [],
    occasion: null,
    requiresCompleteOutfit: false,
    mustInclude: [],
    rawTokens: [],
  };
}

function newSession(intent: string): AgentSession {
  return {
    id: makeId("ses"),
    idempotencyKey: makeId("idem"),
    userIntent: intent,
    parsedConstraints: emptyConstraints(),
    steps: blankSteps(),
    thoughtLog: [],
    candidateProducts: [],
    selectedCart: [],
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    status: "running",
    errorMessage: null,
    partialMatch: false,
    auditLog: [],
    createdAt: Date.now(),
  };
}

function audit(
  actor: AuditLogEntry["actor"],
  action: string,
  reasoning: string,
  dataSnapshot?: unknown,
): AuditLogEntry {
  return { timestamp: Date.now(), actor, action, reasoning, dataSnapshot };
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const rnd = (min: number, max: number) => Math.round(min + Math.random() * (max - min));

interface AgentContextValue {
  session: AgentSession | null;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  clarification: string | null;
  running: boolean;
  checkpointOpen: boolean;
  paymentOpen: boolean;
  activeOrder: Order | null;
  paymentStatus: Order["paymentStatus"] | "idle";
  paymentError: string | null;
  forceFailure: boolean;
  setForceFailure: (v: boolean) => void;
  forceTimeout: boolean;
  setForceTimeout: (v: boolean) => void;
  runAgent: (intent: string) => Promise<void>;
  acceptPartialMatch: () => void;
  resetSession: () => void;
  openCheckpoint: () => void;
  approve: () => Promise<Order | null>;
  reject: () => Promise<void>;
  payNow: (method: Exclude<PaymentMethod, null>) => Promise<void>;
  closePayment: () => void;
  onOrderPaid: ((order: Order) => void) | null;
  setOnOrderPaid: (cb: ((order: Order) => void) | null) => void;
}

const AgentContext = createContext<AgentContextValue | null>(null);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AgentSession | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [clarification, setClarification] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [checkpointOpen, setCheckpointOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<Order["paymentStatus"] | "idle">("idle");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [forceFailure, setForceFailure] = useState(false);
  const [forceTimeout, setForceTimeout] = useState(false);
  const partialRef = useRef<SelectionResult | null>(null);
  const paymentLock = useRef(false);
  const onPaidRef = useRef<((order: Order) => void) | null>(null);

  const patchStep = useCallback((id: string, patch: Partial<AgentStep>) => {
    setSession((prev) =>
      prev
        ? { ...prev, steps: prev.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)) }
        : prev,
    );
  }, []);

  const think = useCallback((line: string) => {
    setSession((prev) => (prev ? { ...prev, thoughtLog: [...prev.thoughtLog, line] } : prev));
  }, []);

  const addAudit = useCallback((entry: AuditLogEntry) => {
    setSession((prev) => (prev ? { ...prev, auditLog: [...prev.auditLog, entry] } : prev));
  }, []);

  const finalize = useCallback(
    (result: SelectionResult, base: AgentSession) => {
      const amounts = calculateAmounts(result.items);
      setSession((prev) => {
        const s = prev ?? base;
        return {
          ...s,
          selectedCart: result.items,
          subtotal: amounts.subtotal,
          tax: amounts.tax,
          shipping: amounts.shipping,
          total: amounts.total,
          partialMatch: result.partial,
          status: "awaiting-approval",
        };
      });
      setCheckpointOpen(true);
    },
    [],
  );

  const runAgent = useCallback(
    async (intent: string) => {
      setClarification(null);
      partialRef.current = null;
      const constraints = parseIntent(intent);
      const clarify = needsClarification(intent, constraints);
      if (clarify) {
        setClarification(clarify);
        setSession(null);
        return;
      }

      const base = newSession(intent);
      base.parsedConstraints = constraints;
      base.auditLog = [
        audit("user", "Submitted shopping intent", intent),
        audit("agent", "Parsed intent", "Deterministic regex + keyword dictionary parse", constraints),
      ];
      setSession(base);
      setRunning(true);

      try {
        /* 1. Understanding Intent */
        patchStep("intent", { status: "in-progress", timestamp: Date.now() });
        await wait(rnd(500, 800));
        think(`Parsed budget: ${constraints.budget ? formatINR(constraints.budget) : "not specified"}`);
        if (constraints.tags.length) think(`Detected intent tags: ${constraints.tags.join(", ")}`);
        think(
          constraints.requiresCompleteOutfit
            ? "Complete-outfit requirement detected — will cover Outerwear, Tops, Bottoms and Footwear."
            : `Target categories: ${requiredCategoriesFor(constraints).join(", ")}`,
        );
        patchStep("intent", {
          status: "complete",
          durationMs: 640,
          detailLog: [
            `Budget: ${constraints.budget ? formatINR(constraints.budget) : "none"}`,
            `Tags: ${constraints.tags.join(", ") || "none"}`,
            `Occasion: ${constraints.occasion ?? "unspecified"}`,
            `Complete outfit required: ${constraints.requiresCompleteOutfit ? "yes" : "no"}`,
            `Required categories: ${requiredCategoriesFor(constraints).join(", ")}`,
          ],
        });

        /* 2. Browsing Catalog */
        patchStep("browse", { status: "in-progress", timestamp: Date.now() });
        const allProducts = await mockDb.listProducts();
        think(`Scanning ${allProducts.length} products in catalog...`);
        await wait(rnd(400, 900));
        const candidates = findCandidates(constraints);
        think(`Found ${candidates.length} candidate products after filtering.`);
        setSession((prev) => (prev ? { ...prev, candidateProducts: candidates } : prev));
        patchStep("browse", {
          status: candidates.length ? "complete" : "error",
          durationMs: 780,
          detailLog: [
            `Scanned ${allProducts.length} catalog products`,
            `Filtered by tags: ${constraints.tags.join(", ") || "none"}`,
            constraints.budget ? `Dropped items priced above ${formatINR(constraints.budget)}` : "No budget ceiling applied",
            `Shortlist size: ${candidates.length}`,
          ],
        });

        if (!candidates.length) {
          const closest = closestAchievable(constraints, allProducts);
          const msg = `No products match ${constraints.budget ? `a budget of ${formatINR(constraints.budget)}` : "that request"}. ${closest ? `The closest available item is “${closest.name}” at ${formatINR(closest.price)}.` : ""}`;
          setSession((prev) => (prev ? { ...prev, status: "error", errorMessage: msg } : prev));
          addAudit(audit("agent", "Halted — no candidates", msg));
          setRunning(false);
          return;
        }

        /* 3. Selecting Items */
        patchStep("select", { status: "in-progress", timestamp: Date.now() });
        think("Optimizing combination for max value within budget...");
        await wait(rnd(600, 1200));
        const result = selectItems(constraints, candidates);
        partialRef.current = result;

        if (!result.items.length || (result.partial && constraints.requiresCompleteOutfit)) {
          const closest = closestAchievable(constraints, candidates);
          const msg = result.items.length
            ? `Unable to assemble a complete outfit within ${constraints.budget ? formatINR(constraints.budget) : "the given constraints"}. Best partial match covers ${result.coveredCategories.join(", ")} at ${formatINR(result.amounts.subtotal)}.`
            : `Unable to assemble a complete outfit within ${constraints.budget ? formatINR(constraints.budget) : "the given constraints"}.${closest ? ` Closest achievable option: “${closest.name}” at ${formatINR(closest.price)}.` : ""}`;
          patchStep("select", {
            status: "error",
            durationMs: 900,
            detailLog: [...result.logs, msg],
          });
          setSession((prev) =>
            prev ? { ...prev, status: "error", errorMessage: msg, partialMatch: true } : prev,
          );
          addAudit(audit("agent", "Selection incomplete", msg, { covered: result.coveredCategories }));
          think(msg);
          setRunning(false);
          return;
        }

        result.items.forEach((i: CartItem) =>
          think(`Added ${i.product.name} — ${formatINR(i.product.price)}`),
        );
        patchStep("select", {
          status: "complete",
          durationMs: 900,
          detailLog: [...result.logs, ...result.decisions.map((d) => d.justification)],
        });

        /* 4. Calculating Pricing */
        patchStep("pricing", { status: "in-progress", timestamp: Date.now() });
        await wait(rnd(400, 800));
        const amounts = calculateAmounts(result.items);
        think(
          `Selected ${result.items.length} items, subtotal ${formatINR(amounts.subtotal)}, total ${formatINR(amounts.total)}`,
        );
        patchStep("pricing", {
          status: "complete",
          durationMs: 620,
          detailLog: [
            `Subtotal: ${formatINR(amounts.subtotal)}`,
            ...amounts.taxLines.map((l) => `${l.name}: ${l.rule} → ${formatINR(l.taxAmount)}`),
            `Total GST: ${formatINR(amounts.tax)}`,
            amounts.shippingRule,
            `Grand total: ${formatINR(amounts.total)}`,
          ],
        });

        /* 5. Ready for Review */
        patchStep("review", { status: "in-progress", timestamp: Date.now() });
        await wait(rnd(300, 600));
        patchStep("review", {
          status: "complete",
          durationMs: 420,
          detailLog: ["Human approval required before any payment can be initiated."],
        });
        addAudit(
          audit("agent", "Cart assembled", "Awaiting human approval at the purchase checkpoint", {
            items: result.items.map((i) => ({ id: i.product.id, price: i.product.price })),
            amounts,
          }),
        );
        finalize(result, base);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unexpected agent failure";
        setSession((prev) => (prev ? { ...prev, status: "error", errorMessage: msg } : prev));
      } finally {
        setRunning(false);
      }
    },
    [addAudit, finalize, patchStep, think],
  );

  const acceptPartialMatch = useCallback(() => {
    const result = partialRef.current;
    if (!result || !result.items.length) return;
    const amounts = calculateAmounts(result.items);
    setSession((prev) =>
      prev
        ? {
            ...prev,
            selectedCart: result.items,
            subtotal: amounts.subtotal,
            tax: amounts.tax,
            shipping: amounts.shipping,
            total: amounts.total,
            partialMatch: true,
            errorMessage: null,
            status: "awaiting-approval",
            auditLog: [
              ...prev.auditLog,
              audit("user", "Accepted partial match", "User chose to proceed with an incomplete category coverage"),
            ],
            steps: prev.steps.map((s) =>
              s.id === "select" ? { ...s, status: "complete" as const } : s,
            ),
          }
        : prev,
    );
    setCheckpointOpen(true);
  }, []);

  const resetSession = useCallback(() => {
    setSession(null);
    setClarification(null);
    setCheckpointOpen(false);
    setPaymentOpen(false);
    setActiveOrder(null);
    setPaymentStatus("idle");
    setPaymentError(null);
    partialRef.current = null;
    paymentLock.current = false;
  }, []);

  const approve = useCallback(async () => {
    if (!session) return null;
    const amounts = calculateAmounts(session.selectedCart);
    const auditLog = [
      ...session.auditLog,
      audit("user", "Approved cart at checkpoint", "Human reviewed the AI reasoning and authorised payment", {
        total: amounts.total,
      }),
    ];
    const order: Order = {
      id: makeId("ord"),
      sessionId: session.id,
      idempotencyKey: session.idempotencyKey,
      userIntent: session.userIntent,
      cartSnapshot: session.selectedCart,
      amounts,
      paymentMethod: null,
      paymentStatus: "pending",
      auditLog,
      createdAt: Date.now(),
      webhookReceivedAt: null,
    };
    try {
      await mockDb.saveOrder(order);
    } catch {
      /* non-fatal */
    }
    setSession((prev) => (prev ? { ...prev, status: "approved", auditLog } : prev));
    setActiveOrder(order);
    setCheckpointOpen(false);
    setPaymentStatus("pending");
    setPaymentError(null);
    paymentLock.current = false;
    setPaymentOpen(true);
    return order;
  }, [session]);

  const reject = useCallback(async () => {
    if (!session) return;
    const amounts = calculateAmounts(session.selectedCart);
    const auditLog = [
      ...session.auditLog,
      audit("user", "Rejected cart at checkpoint", "User declined the AI's proposed purchase — no payment initiated"),
    ];
    const order: Order = {
      id: makeId("ord"),
      sessionId: session.id,
      idempotencyKey: session.idempotencyKey,
      userIntent: session.userIntent,
      cartSnapshot: session.selectedCart,
      amounts,
      paymentMethod: null,
      paymentStatus: "rejected",
      auditLog,
      createdAt: Date.now(),
      webhookReceivedAt: null,
    };
    try {
      await mockDb.saveOrder(order);
    } catch {
      /* non-fatal */
    }
    setSession((prev) => (prev ? { ...prev, status: "rejected", auditLog } : prev));
    setCheckpointOpen(false);
  }, [session]);

  const payNow = useCallback(
    async (method: Exclude<PaymentMethod, null>) => {
      if (!activeOrder || paymentLock.current) return;
      paymentLock.current = true;
      setPaymentError(null);
      setPaymentStatus("processing");

      const withLog = (order: Order, entry: AuditLogEntry): Order => ({
        ...order,
        auditLog: [...order.auditLog, entry],
      });

      let order: Order = withLog({ ...activeOrder, paymentMethod: method, paymentStatus: "processing" }, audit(
        "system",
        "Payment initiated (simulated)",
        `Method: ${method.toUpperCase()} — idempotency key ${activeOrder.idempotencyKey}`,
      ));
      setActiveOrder(order);
      try {
        await mockDb.saveOrder(order);

        const processingMs = forceTimeout ? 16000 : rnd(1500, 3000);
        const TIMEOUT_MS = 15000;
        const timedOut = await Promise.race([
          wait(processingMs).then(() => false),
          wait(TIMEOUT_MS).then(() => true),
        ]);

        if (timedOut) {
          order = withLog({ ...order, paymentStatus: "timeout" }, audit(
            "system",
            "Payment timed out",
            "No webhook received within 15s — no amount was charged (simulated).",
          ));
          setActiveOrder(order);
          setPaymentStatus("timeout");
          setPaymentError("Payment Timed Out — No amount was charged.");
          await mockDb.saveOrder(order);
          return;
        }

        const failed = forceFailure || Math.random() < 0.1;
        if (failed) {
          order = withLog({ ...order, paymentStatus: "failed" }, audit(
            "system",
            "Webhook received: payment.failed",
            "Simulated gateway declined the transaction. No amount was charged.",
          ));
          setActiveOrder(order);
          setPaymentStatus("failed");
          setPaymentError("Payment failed at the simulated gateway. You can retry safely.");
          await mockDb.saveOrder(order);
          return;
        }

        const paidAt = Date.now();
        order = withLog(
          { ...order, paymentStatus: "paid", webhookReceivedAt: paidAt },
          audit("system", "Webhook received: payment.captured", "Simulated payment captured successfully", {
            amount: order.amounts.total,
            method,
            webhookReceivedAt: paidAt,
          }),
        );
        setActiveOrder(order);
        setPaymentStatus("paid");
        await mockDb.saveOrder(order);
        setSession((prev) => (prev ? { ...prev, status: "completed" } : prev));
        onPaidRef.current?.(order);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unexpected payment error";
        setPaymentStatus("failed");
        setPaymentError(msg);
      } finally {
        paymentLock.current = false;
      }
    },
    [activeOrder, forceFailure, forceTimeout],
  );

  const value = useMemo<AgentContextValue>(
    () => ({
      session,
      panelOpen,
      setPanelOpen,
      clarification,
      running,
      checkpointOpen,
      paymentOpen,
      activeOrder,
      paymentStatus,
      paymentError,
      forceFailure,
      setForceFailure,
      forceTimeout,
      setForceTimeout,
      runAgent,
      acceptPartialMatch,
      resetSession,
      openCheckpoint: () => setCheckpointOpen(true),
      approve,
      reject,
      payNow,
      closePayment: () => setPaymentOpen(false),
      onOrderPaid: onPaidRef.current,
      setOnOrderPaid: (cb) => {
        onPaidRef.current = cb;
      },
    }),
    [
      session,
      panelOpen,
      clarification,
      running,
      checkpointOpen,
      paymentOpen,
      activeOrder,
      paymentStatus,
      paymentError,
      forceFailure,
      forceTimeout,
      runAgent,
      acceptPartialMatch,
      resetSession,
      approve,
      reject,
      payNow,
    ],
  );

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
}

export function useAgent() {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error("useAgent must be used inside AgentProvider");
  return ctx;
}

export { delay };
