import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Star } from "lucide-react";
import { getProductById } from "@/data/mockProducts";
import { formatINR } from "@/data/taxRules";
import { useCart } from "@/context/CartContext";

export const Route = createFileRoute("/product/$id")({
  head: ({ params }) => {
    const product = getProductById(params.id);
    if (!product) {
      return { meta: [{ title: "Product not found — AgenticCart" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${product.name} — AgenticCart` },
        { name: "description", content: product.description },
        { property: "og:title", content: `${product.name} — AgenticCart` },
        { property: "og:description", content: product.description },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const product = getProductById(id);
  const { addProduct, setDrawerOpen } = useCart();
  const [size, setSize] = useState(product?.sizes[0] ?? "");
  const [color, setColor] = useState(product?.colors[0] ?? "");

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This item isn't in the demo catalog.</p>
        <Link to="/" className="mt-6 inline-block rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link to="/" className="mb-6 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to catalog
      </Link>
      <div className="grid gap-8 md:grid-cols-2">
        <img src={product.imageUrl} alt={product.name} className="w-full rounded-2xl object-cover shadow-sm" />
        <div>
          <span className="text-xs uppercase tracking-wide text-muted-foreground">{product.category}</span>
          <h1 className="mt-1 text-2xl font-semibold">{product.name}</h1>
          <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-warning text-warning" /> {product.rating.toFixed(1)} · {product.stock} in stock
          </div>
          <p className="mt-4 text-2xl font-bold">{formatINR(product.price)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            GST slab applied at checkout: {product.price < 1000 ? "12% (unit price under ₹1,000)" : "18% (unit price ₹1,000+)"}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">{product.description}</p>

          <div className="mt-6 space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`rounded-lg border px-3 py-1.5 text-xs ${
                      size === s ? "border-primary bg-brand-soft text-accent-foreground" : "border-border hover:bg-muted"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium">Colour</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`rounded-lg border px-3 py-1.5 text-xs ${
                      color === c ? "border-primary bg-brand-soft text-accent-foreground" : "border-border hover:bg-muted"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((t) => (
                <span key={t} className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
                  #{t}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              addProduct(product, { size, color });
              setDrawerOpen(true);
            }}
            className="mt-8 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
