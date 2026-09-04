import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bot, ShieldCheck, Sparkles } from "lucide-react";
import { categories, products } from "@/data/mockProducts";
import { ProductCard } from "@/components/ProductCard";
import { useAgent } from "@/context/AgentContext";
import { formatINR } from "@/data/taxRules";
import type { Category } from "@/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AgenticCart — Shop with an autonomous AI agent" },
      {
        name: "description",
        content:
          "Tell AgenticCart what you need and the AI agent assembles a cart, explains every choice, and waits for your approval before a simulated checkout.",
      },
      { property: "og:title", content: "AgenticCart — Shop with an autonomous AI agent" },
      {
        property: "og:description",
        content: "Deterministic AI shopping agent with human-in-the-loop approval and a full audit trail.",
      },
    ],
  }),
  component: Index,
});

type Sort = "featured" | "price-asc" | "price-desc" | "rating";

function Index() {
  const { setPanelOpen } = useAgent();
  const [category, setCategory] = useState<Category | "All">("All");
  const [maxPrice, setMaxPrice] = useState(8000);
  const [sort, setSort] = useState<Sort>("featured");

  const visible = useMemo(() => {
    let list = products.filter((p) => p.price <= maxPrice);
    if (category !== "All") list = list.filter((p) => p.category === category);
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [category, maxPrice, sort]);

  return (
    <>
      <section className="border-b border-border bg-gradient-to-br from-brand-soft via-background to-background">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Razorpay AI Buildathon 2026 · simulation demo
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Tell our AI what you need. It shops for you.
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground">
              AgenticCart reads loose natural-language intent, builds a cart against a live catalog, prices it with
              real GST slab rules — then stops and asks you to approve before a single rupee moves.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => setPanelOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Bot className="h-4 w-4" /> Launch the AI agent
              </button>
              <a
                href="#catalog"
                className="inline-flex items-center rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium hover:bg-muted"
              >
                Browse the catalog
              </a>
            </div>
            <ul className="mt-8 grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-success" /> Human approval enforced
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-success" /> Every rupee traced to a rule
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-success" /> Full audit trail retained
              </li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden grid-cols-3 gap-3 lg:grid"
          >
            {products.slice(0, 6).map((p) => (
              <img
                key={p.id}
                src={p.imageUrl}
                alt={p.name}
                className="h-44 w-full rounded-xl object-cover shadow-sm"
                loading="lazy"
              />
            ))}
          </motion.div>
        </div>
      </section>

      <section id="catalog" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end gap-4">
          <div>
            <h2 className="text-xl font-semibold">Catalog</h2>
            <p className="text-xs text-muted-foreground">{visible.length} products available</p>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-3 text-xs">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category | "All")}
              className="rounded-lg border border-border bg-card px-3 py-2"
            >
              <option value="All">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2">
              Max {formatINR(maxPrice)}
              <input
                type="range"
                min={299}
                max={8000}
                step={100}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="accent-[oklch(0.51_0.23_277.1)]"
              />
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-lg border border-border bg-card px-3 py-2"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-20 text-center">
            <p className="text-sm font-medium">No products match these filters</p>
            <p className="mt-1 text-xs text-muted-foreground">Try raising the price ceiling or clearing the category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
