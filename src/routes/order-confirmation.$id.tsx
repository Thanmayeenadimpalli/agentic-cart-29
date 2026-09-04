import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { mockDb } from "@/data/mockDb";
import { formatINR } from "@/data/taxRules";
import type { Order } from "@/types";

export const Route = createFileRoute("/order-confirmation/$id")({
  head: () => ({
    meta: [
      { title: "Order confirmed — AgenticCart" },
      { name: "description", content: "Your simulated AgenticCart order was captured by the mock payment gateway." },
      { property: "og:title", content: "Order confirmed — AgenticCart" },
      { property: "og:description", content: "Simulated payment captured — view the full audit trail." },
    ],
  }),
  component: Confirmation,
});

function Confirmation() {
  const { id } = Route.useParams();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    mockDb
      .getOrder(id)
      .then((o) => alive && setOrder(o))
      .catch(() => alive && setOrder(null));
    return () => {
      alive = false;
    };
  }, [id]);

  if (order === undefined) {
    return <div className="mx-auto max-w-2xl px-4 py-16"><div className="h-56 animate-pulse rounded-2xl bg-muted" /></div>;
  }
  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Order not found</h1>
        <Link to="/orders" className="mt-6 inline-block rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
        <h1 className="mt-4 text-2xl font-semibold">Order confirmed</h1>
        <p className="mt-1 text-xs text-muted-foreground">Simulated payment — no real transaction took place.</p>
        <p className="mt-4 text-sm text-muted-foreground">Order ID</p>
        <p className="font-mono text-sm">{order.id}</p>

        <ul className="mt-6 space-y-2 text-left text-xs">
          {order.cartSnapshot.map((i) => (
            <li key={i.product.id} className="flex justify-between border-b border-border pb-2">
              <span>{i.product.name} × {i.quantity}</span>
              <span>{formatINR(i.product.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-lg font-semibold">Total paid {formatINR(order.amounts.total)}</p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            to="/orders/$id"
            params={{ id: order.id }}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            View full audit trail
          </Link>
          <Link to="/" className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
