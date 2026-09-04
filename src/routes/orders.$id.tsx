import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { mockDb } from "@/data/mockDb";
import { formatINR } from "@/data/taxRules";
import { AuditTrail } from "@/components/AuditTrail";
import { STATUS_STYLES } from "./orders.index";
import type { Order } from "@/types";

export const Route = createFileRoute("/orders/$id")({
  head: () => ({
    meta: [
      { title: "Order audit trail — AgenticCart" },
      { name: "description", content: "The complete agent reasoning and simulated payment log for this order." },
      { property: "og:title", content: "Order audit trail — AgenticCart" },
      { property: "og:description", content: "Every agent decision and payment event recorded for this order." },
    ],
  }),
  component: OrderDetail,
});

function OrderDetail() {
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
    return <div className="mx-auto max-w-3xl px-4 py-10"><div className="h-64 animate-pulse rounded-2xl bg-muted" /></div>;
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Order not found</h1>
        <Link to="/orders" className="mt-6 inline-block rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <Link to="/orders" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> All orders
      </Link>

      <header className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-xl font-semibold">{order.userIntent}</h1>
          <p className="text-xs text-muted-foreground">
            {order.id} · {new Date(order.createdAt).toLocaleString("en-IN")}
            {order.webhookReceivedAt
              ? ` · webhook ${new Date(order.webhookReceivedAt).toLocaleTimeString("en-IN")}`
              : ""}
          </p>
        </div>
        <span className={`ml-auto rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${STATUS_STYLES[order.paymentStatus]}`}>
          {order.paymentStatus}
        </span>
      </header>

      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Items</h2>
        <ul className="space-y-3">
          {order.cartSnapshot.map((item) => (
            <li key={item.product.id} className="flex gap-3 text-xs">
              <img src={item.product.imageUrl} alt={item.product.name} className="h-16 w-12 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{item.product.name}</p>
                <p className="text-muted-foreground">
                  {item.selectedSize} · {item.selectedColor} · qty {item.quantity}
                </p>
                {item.reasonAddedByAgent && <p className="mt-1 text-primary">{item.reasonAddedByAgent}</p>}
              </div>
              <span className="font-semibold">{formatINR(item.product.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-border pt-3 text-xs">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(order.amounts.subtotal)}</span></div>
          {order.amounts.taxLines.map((l) => (
            <div key={l.productId} className="flex justify-between text-muted-foreground">
              <span>{l.name} — {l.rule}</span>
              <span>{formatINR(l.taxAmount)}</span>
            </div>
          ))}
          <div className="flex justify-between"><span>Total GST</span><span>{formatINR(order.amounts.tax)}</span></div>
          <div className="flex justify-between text-muted-foreground">
            <span>{order.amounts.shippingRule}</span>
            <span>{order.amounts.shipping === 0 ? "Free" : formatINR(order.amounts.shipping)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold">
            <span>Total</span><span>{formatINR(order.amounts.total)}</span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Full audit trail</h2>
        <AuditTrail entries={order.auditLog} />
      </section>
    </div>
  );
}
