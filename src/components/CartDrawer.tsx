import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/data/taxRules";

export function CartDrawer() {
  const { items, drawerOpen, setDrawerOpen, removeItem, setQuantity, amounts } = useCart();

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <ShoppingBag className="h-4 w-4" /> Your Cart
              </h2>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close cart" className="rounded-md p-1 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
                  <p className="mt-3 text-sm font-medium text-foreground">Your cart is empty</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add something manually, or let the AI agent assemble a cart for you.
                  </p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <motion.li
                      key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-3 rounded-xl border border-border p-3"
                    >
                      <img src={item.product.imageUrl} alt={item.product.name} className="h-20 w-16 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.selectedSize} · {item.selectedColor}
                        </p>
                        {item.reasonAddedByAgent && (
                          <p className="mt-1 line-clamp-2 text-[11px] text-primary">AI: {item.reasonAddedByAgent}</p>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => setQuantity(item.product.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="rounded-md border border-border p-1 hover:bg-muted"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => setQuantity(item.product.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                            className="rounded-md border border-border p-1 hover:bg-muted"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            aria-label="Remove item"
                            className="ml-auto rounded-md p-1 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <span className="text-sm font-semibold">{formatINR(item.product.price * item.quantity)}</span>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <footer className="space-y-2 border-t border-border px-5 py-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatINR(amounts.subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>GST (12% / 18% slabs)</span>
                  <span>{formatINR(amounts.tax)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{amounts.shipping === 0 ? "Free" : formatINR(amounts.shipping)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-foreground">
                  <span>Total</span>
                  <span>{formatINR(amounts.total)}</span>
                </div>
                <p className="pt-1 text-[11px] text-muted-foreground">
                  Manual checkout is intentionally out of scope — use the AI Shopping Agent to run the full approval
                  and simulated payment flow.
                </p>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
