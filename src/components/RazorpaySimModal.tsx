import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, CreditCard, Landmark, Loader2, Smartphone, Wallet, X } from "lucide-react";
import { useAgent } from "@/context/AgentContext";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/data/taxRules";
import type { PaymentMethod } from "@/types";

const TABS: { id: Exclude<PaymentMethod, null>; label: string; icon: typeof Smartphone }[] = [
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Cards", icon: CreditCard },
  { id: "netbanking", label: "Netbanking", icon: Landmark },
  { id: "wallet", label: "Wallet", icon: Wallet },
];

const BANKS = ["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra"];
const WALLETS = ["PayLater Wallet", "DemoPay Balance"];

function luhnValid(num: string) {
  const digits = num.replace(/\D/g, "");
  if (digits.length < 12) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function RazorpaySimModal() {
  const {
    paymentOpen,
    closePayment,
    activeOrder,
    paymentStatus,
    paymentError,
    payNow,
    forceFailure,
    setForceFailure,
    forceTimeout,
    setForceTimeout,
    resetSession,
  } = useAgent();
  const { clear } = useCart();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Exclude<PaymentMethod, null>>("upi");
  const [vpa, setVpa] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "" });
  const [bank, setBank] = useState(BANKS[0]);
  const [wallet, setWallet] = useState(WALLETS[0]);
  const [devOpen, setDevOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (paymentStatus === "paid" && activeOrder) {
      const id = activeOrder.id;
      const t = setTimeout(() => {
        clear();
        closePayment();
        resetSession();
        void navigate({ to: "/order-confirmation/$id", params: { id } });
      }, 1600);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [paymentStatus, activeOrder, navigate, clear, closePayment, resetSession]);

  if (!activeOrder) return null;
  const processing = paymentStatus === "processing";

  const validate = () => {
    if (tab === "upi") {
      if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(vpa.trim())) return "Enter a valid demo VPA, e.g. yourname@upi";
    }
    if (tab === "card") {
      if (!luhnValid(card.number)) return "Card number fails the Luhn format check (demo data only — try 4111 1111 1111 1111).";
      if (!/^\d{2}\/\d{2}$/.test(card.expiry)) return "Expiry must be MM/YY.";
      if (!/^\d{3,4}$/.test(card.cvv)) return "CVV must be 3–4 digits.";
    }
    return null;
  };

  return (
    <AnimatePresence>
      {paymentOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/70 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-2xl"
          >
            <header className="flex items-start justify-between bg-[#0b3c86] px-5 py-4 text-white">
              <div>
                <p className="text-sm font-semibold">AgenticCart</p>
                <p className="text-xs opacity-80">Simulated Checkout</p>
                <p className="mt-2 text-2xl font-bold">{formatINR(activeOrder.amounts.total)}</p>
              </div>
              <button
                onClick={closePayment}
                disabled={processing}
                aria-label="Close checkout"
                className="rounded-md p-1 hover:bg-white/10 disabled:opacity-40"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="bg-warning/20 px-5 py-1.5 text-center text-[11px] font-medium text-warning-foreground">
              Test Mode — Simulated Payment, No Real Transaction
            </div>

            {paymentStatus === "paid" ? (
              <div className="flex flex-col items-center gap-3 px-6 py-12">
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="grid h-16 w-16 place-items-center rounded-full bg-success/15"
                >
                  <CheckCircle2 className="h-10 w-10 text-success" />
                </motion.span>
                <p className="text-base font-semibold">Payment Successful ✅</p>
                <p className="text-xs text-muted-foreground">Taking you to your order confirmation…</p>
              </div>
            ) : processing ? (
              <div className="flex flex-col items-center gap-3 px-6 py-12">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-medium">Processing Payment…</p>
                <p className="text-xs text-muted-foreground">Waiting for the simulated webhook (times out after 15s).</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 border-b border-border">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTab(t.id);
                        setFormError(null);
                      }}
                      className={`flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${
                        tab === t.id ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <t.icon className="h-4 w-4" />
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3 px-5 py-5 text-sm">
                  {(paymentError || formError) && (
                    <p className="flex items-start gap-2 rounded-lg bg-destructive/10 p-2 text-xs text-destructive">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {formError ?? paymentError}
                    </p>
                  )}

                  {tab === "upi" && (
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">UPI ID (demo)</label>
                      <input
                        value={vpa}
                        onChange={(e) => setVpa(e.target.value)}
                        placeholder="yourname@upi"
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  )}

                  {tab === "card" && (
                    <div className="space-y-2">
                      <input
                        value={card.number}
                        onChange={(e) => setCard({ ...card, number: e.target.value })}
                        placeholder="4111 1111 1111 1111 (test card)"
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                      <div className="flex gap-2">
                        <input
                          value={card.expiry}
                          onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                          placeholder="MM/YY"
                          className="w-1/2 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                        <input
                          value={card.cvv}
                          onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                          placeholder="CVV"
                          className="w-1/2 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Cosmetic validation only — no processor is contacted. Never enter real card details.
                      </p>
                    </div>
                  )}

                  {tab === "netbanking" && (
                    <select
                      value={bank}
                      onChange={(e) => setBank(e.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                    >
                      {BANKS.map((b) => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                  )}

                  {tab === "wallet" && (
                    <div className="space-y-2">
                      {WALLETS.map((w) => (
                        <label key={w} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                          <input type="radio" checked={wallet === w} onChange={() => setWallet(w)} />
                          {w}
                        </label>
                      ))}
                    </div>
                  )}

                  <button
                    disabled={processing}
                    onClick={() => {
                      const err = validate();
                      setFormError(err);
                      if (err) return;
                      void payNow(tab);
                    }}
                    className="w-full rounded-xl bg-success px-4 py-3 text-sm font-semibold text-success-foreground hover:opacity-90 disabled:opacity-40"
                  >
                    {paymentStatus === "failed" || paymentStatus === "timeout"
                      ? `Retry Payment ${formatINR(activeOrder.amounts.total)}`
                      : `Pay ${formatINR(activeOrder.amounts.total)}`}
                  </button>

                  <div className="pt-1 text-center">
                    <button
                      onClick={() => setDevOpen(!devOpen)}
                      className="text-[10px] text-muted-foreground/70 underline-offset-2 hover:underline"
                    >
                      demo controls
                    </button>
                    {devOpen && (
                      <div className="mt-2 space-y-1 rounded-lg bg-muted/60 p-2 text-left text-[11px]">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={forceFailure} onChange={(e) => setForceFailure(e.target.checked)} />
                          Simulate failure
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={forceTimeout} onChange={(e) => setForceTimeout(e.target.checked)} />
                          Simulate timeout (&gt;15s)
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
