import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { useAgent } from "@/context/AgentContext";
import { useCart } from "@/context/CartContext";
import { calculateAmounts, formatINR } from "@/data/taxRules";
import { requiredCategoriesFor } from "@/engine/agentEngine";

export function CheckpointModal() {
  const { checkpointOpen, session, approve, reject } = useAgent();
  const { addAgentItems } = useCart();
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const amounts = useMemo(
    () => calculateAmounts(session?.selectedCart ?? []),
    [session?.selectedCart],
  );

  const checks = useMemo(() => {
    if (!session) return [];
    const c = session.parsedConstraints;
    const required = requiredCategoriesFor(c);
    const covered = Array.from(new Set(session.selectedCart.map((i) => i.product.category)));
    const list: { label: string; pass: boolean }[] = [];
    if (c.budget !== null) {
      list.push({
        label: `Budget ≤ ${formatINR(c.budget)}: ${formatINR(amounts.subtotal)} (items subtotal)`,
        pass: amounts.subtotal <= c.budget,
      });
    }
    list.push({
      label: `Category coverage: ${covered.join(", ") || "none"} (required: ${required.join(", ")})`,
      pass: required.every((r) => covered.includes(r)) || session.partialMatch,
    });
    list.push({
      label: `All items in stock at time of selection`,
      pass: session.selectedCart.every((i) => i.product.stock > 0),
    });
    list.push({
      label: `Human approval required before payment — enforced`,
      pass: true,
    });
    return list;
  }, [session, amounts]);

  const allPass = checks.every((c) => c.pass);

  if (!session) return null;

  return (
    <AnimatePresence>
      {checkpointOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-foreground/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            className="my-8 w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <header className="border-b border-border bg-brand-soft px-6 py-5">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-accent-foreground">
                <ShieldCheck className="h-5 w-5" /> AI Purchase Checkpoint — Review Required
              </h2>
              <p className="mt-1 text-xs text-accent-foreground/80">
                The agent cannot pay without your approval. Every number below traces back to a rule.
              </p>
            </header>

            <div className="max-h-[65vh] space-y-6 overflow-y-auto px-6 py-5">
              {/* Cart summary */}
              <section>
                <h3 className="mb-2 text-sm font-semibold">Cart summary</h3>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/60 text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 font-medium">Item</th>
                        <th className="px-3 py-2 font-medium">Variant</th>
                        <th className="px-3 py-2 font-medium">Unit</th>
                        <th className="px-3 py-2 font-medium">Qty</th>
                        <th className="px-3 py-2 text-right font-medium">Line total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {session.selectedCart.map((item) => (
                        <tr key={item.product.id} className="border-t border-border">
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <img src={item.product.imageUrl} alt={item.product.name} className="h-10 w-8 rounded object-cover" />
                              <span className="font-medium">{item.product.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {item.selectedSize} · {item.selectedColor}
                          </td>
                          <td className="px-3 py-2">{formatINR(item.product.price)}</td>
                          <td className="px-3 py-2">{item.quantity}</td>
                          <td className="px-3 py-2 text-right font-medium">
                            {formatINR(item.product.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Why the AI chose this */}
              <section>
                <h3 className="mb-2 text-sm font-semibold">Why did the AI choose this?</h3>
                <div className="space-y-3">
                  {session.selectedCart.map((item) => (
                    <div key={item.product.id} className="rounded-xl border border-border p-3 text-xs">
                      <p className="font-medium text-foreground">{item.product.name}</p>
                      <p className="mt-1 text-muted-foreground">{item.decision?.justification ?? item.reasonAddedByAgent}</p>
                      {item.decision && (
                        <dl className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground sm:grid-cols-4">
                          <div>
                            <dt className="font-medium text-foreground">Score</dt>
                            <dd>{item.decision.score}</dd>
                          </div>
                          <div>
                            <dt className="font-medium text-foreground">Candidates</dt>
                            <dd>{item.decision.candidatesConsidered}</dd>
                          </div>
                          <div>
                            <dt className="font-medium text-foreground">Budget left</dt>
                            <dd>
                              {item.decision.remainingBudgetAtSelection < 0
                                ? "unbounded"
                                : formatINR(item.decision.remainingBudgetAtSelection)}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-medium text-foreground">Matched tags</dt>
                            <dd>{item.decision.matchedTags.join(", ") || "—"}</dd>
                          </div>
                        </dl>
                      )}
                      {!!item.decision?.rejectedAlternatives.length && (
                        <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                          {item.decision.rejectedAlternatives.map((r) => (
                            <li key={r.productId}>
                              ✕ {r.name} ({formatINR(r.price)}) — {r.reason}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Pricing */}
              <section>
                <h3 className="mb-2 text-sm font-semibold">Pricing breakdown</h3>
                <div className="space-y-1 rounded-xl border border-border p-3 text-xs">
                  <Row label="Subtotal" value={formatINR(amounts.subtotal)} />
                  {amounts.taxLines.map((l) => (
                    <Row
                      key={l.productId}
                      label={`GST — ${l.name} (${l.rule})`}
                      value={formatINR(l.taxAmount)}
                      muted
                    />
                  ))}
                  <Row label="Total GST" value={formatINR(amounts.tax)} />
                  <Row label={`Shipping — ${amounts.shippingRule}`} value={amounts.shipping === 0 ? "Free" : formatINR(amounts.shipping)} />
                  <div className="mt-2 flex justify-between border-t border-border pt-2 text-sm font-semibold">
                    <span>Grand total</span>
                    <span>{formatINR(amounts.total)}</span>
                  </div>
                </div>
              </section>

              {/* Compliance */}
              <section>
                <h3 className="mb-2 text-sm font-semibold">Constraint compliance</h3>
                <ul className="space-y-2 text-xs">
                  {checks.map((c) => (
                    <li key={c.label} className="flex items-start gap-2">
                      {c.pass ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      ) : (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      )}
                      <span className={c.pass ? "text-muted-foreground" : "font-medium text-destructive"}>
                        {c.label} — {c.pass ? "PASS" : "FAIL"}
                      </span>
                    </li>
                  ))}
                </ul>
                {!allPass && (
                  <p className="mt-2 rounded-lg bg-destructive/10 p-2 text-[11px] text-destructive">
                    One or more constraints failed. Approval is blocked — reject and try a different request.
                  </p>
                )}
              </section>
            </div>

            <footer className="space-y-3 border-t border-border px-6 py-4">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-[oklch(0.51_0.23_277.1)]"
                />
                I have reviewed the AI's reasoning
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  disabled={!acknowledged || !allPass || submitting}
                  onClick={async () => {
                    setSubmitting(true);
                    try {
                      addAgentItems(session.selectedCart);
                      await approve();
                    } finally {
                      setSubmitting(false);
                      setAcknowledged(false);
                    }
                  }}
                  className="inline-flex flex-1 items-center justify-center rounded-xl bg-success px-4 py-2.5 text-sm font-semibold text-success-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting ? "Preparing checkout…" : "Approve Payment"}
                </button>
                <button
                  onClick={() => {
                    setAcknowledged(false);
                    void reject();
                  }}
                  className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  Reject &amp; Cancel
                </button>
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${muted ? "text-muted-foreground" : ""}`}>
      <span>{label}</span>
      <span className="shrink-0">{value}</span>
    </div>
  );
}
