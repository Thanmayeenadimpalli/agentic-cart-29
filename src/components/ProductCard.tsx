import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Star, Plus } from "lucide-react";
import { formatINR } from "@/data/taxRules";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const { addProduct, setDrawerOpen } = useCart();

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -4 }}
      className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
    >
      <Link to="/product/$id" params={{ id: product.id }} className="block">
        <div className="aspect-4/5 overflow-hidden bg-muted">
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to="/product/$id" params={{ id: product.id }} className="text-sm font-medium text-foreground hover:text-primary">
            {product.name}
          </Link>
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {product.category}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
          {product.rating.toFixed(1)}
          <span className="ml-2">{product.stock} in stock</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-base font-semibold text-foreground">{formatINR(product.price)}</span>
          <button
            onClick={() => {
              addProduct(product);
              setDrawerOpen(true);
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>
    </motion.article>
  );
}
