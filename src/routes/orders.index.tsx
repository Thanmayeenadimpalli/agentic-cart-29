import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { mockDb } from "@/data/mockDb";
import { formatINR } from "@/data/taxRules";
import type { Order } from "@/types";

export const Route = createFileRoute("/orders/")({
  head: () => ({
    meta: [
      { title: "Order History & Audit Trails — AgenticCart" },
      {
        name: "description",
        content: "Every AgenticCart order with its payment status and the complete AI reasoning audit trail.",
      },
      { property: "og:title", content: "Order History & Audit Trails — AgenticCart" },
      { property: "og:description", content: "Paid, failed, timed out or rejected — nothing in the audit trail is lost." },
    ],
  }),
  component: OrdersPage,
});

export const STATUS_STYLES: Record<Order["paymentStatus"], string> = {
  paid: "bg-success/15 text-success",
  failed: "bg-destructive/10 text-destructive",
  timeout: "bg-warning/20 text-warning-foreground",
  rejected: "bg-muted text-muted-foreground",
  pending: "bg-muted text-muted-foreground",
  processing: "bg-brand-soft text-accent-foreground",
};

function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    let alive = true;
    mockDb
      .listOrders()
      .then((o) => alive && setOrders(o))
      .catch(() => alive && setOrders([]));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold">Order history</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Simulated orders stored locally, each with its full agent + payment audit trail.
      </p>

      <div className="mt-6 space-y-3">
        {orders === null &&
          [0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />)}

        {orders?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <p className="text-sm font-medium">No orders yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Run the AI agent to create your first simulated order.</p>
            <Link to="/agent" className="mt-4 inline-block rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground">
              Open the agent console
            </Link>
          </div>
        )}

        {orders?.map((o) => (
          <Link
            key={o.id}
            to="/orders/$id"
            params={{ id: o.id }}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{o.userIntent}</p>
              <p className="text-xs text-muted-foreground">
                {o.id} · {new Date(o.createdAt).toLocaleString("en-IN")} · {o.cartSnapshot.length} items
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${STATUS_STYLES[o.paymentStatus]}`}>
              {o.paymentStatus}
            </span>
            <span className="text-sm font-semibold">{formatINR(o.amounts.total)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
