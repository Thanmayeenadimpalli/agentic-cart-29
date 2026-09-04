import { products } from "@/data/mockProducts";
import { calculateAmounts } from "@/data/taxRules";
import type {
  Amounts,
  CartItem,
  Category,
  ParsedConstraints,
  Product,
  ProductTag,
  RejectedAlternative,
  SelectionDecision,
} from "@/types";

/* ────────────────────────────  INTENT PARSING  ──────────────────────────── */

const KEYWORD_MAP: { keywords: string[]; tags: ProductTag[]; occasion?: string }[] = [
  { keywords: ["winter", "cold", "snow", "warm", "thermal"], tags: ["winter"], occasion: "Winter" },
  { keywords: ["summer", "hot", "light"], tags: ["summer"], occasion: "Summer" },
  { keywords: ["formal", "office", "interview", "wedding", "meeting", "business"], tags: ["formal"], occasion: "Formal" },
  { keywords: ["casual", "weekend", "everyday", "street"], tags: ["casual"], occasion: "Casual" },
  { keywords: ["gym", "workout", "training", "run", "running", "sport", "fitness"], tags: ["sport"], occasion: "Athletic" },
  { keywords: ["budget", "cheap", "affordable", "value"], tags: ["budget"] },
  { keywords: ["premium", "luxury", "high-end", "designer"], tags: ["premium"] },
  { keywords: ["rain", "monsoon", "waterproof"], tags: ["rain"] },
];

const CATEGORY_KEYWORDS: { keywords: string[]; category: Category }[] = [
  { keywords: ["jacket", "coat", "hoodie", "sweater", "outerwear", "parka", "blazer"], category: "Outerwear" },
  { keywords: ["shirt", "tee", "t-shirt", "top", "sweatshirt"], category: "Tops" },
  { keywords: ["jeans", "trousers", "pants", "joggers", "shorts", "bottoms"], category: "Bottoms" },
  { keywords: ["shoes", "boots", "sneakers", "trainers", "footwear"], category: "Footwear" },
  { keywords: ["scarf", "gloves", "beanie", "belt", "socks", "accessory", "accessories"], category: "Accessories" },
];

const OUTFIT_PHRASES = ["outfit", "complete look", "full look", "wardrobe", "head to toe", "look"];

export function parseIntent(rawInput: string): ParsedConstraints {
  const input = rawInput.toLowerCase().trim();

  // Budget: ₹6,000 / under 6000 / less than 6k / below rs 6000
  let budget: number | null = null;
  const budgetPatterns = [
    /(?:under|below|less than|within|max|upto|up to|budget of)\s*(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*(k)?/i,
    /(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)\s*(k)?/i,
  ];
  for (const re of budgetPatterns) {
    const m = input.match(re);
    if (m) {
      const n = parseFloat((m[1] ?? "").replace(/,/g, ""));
      if (!Number.isNaN(n)) {
        budget = m[2] ? n * 1000 : n;
        break;
      }
    }
  }

  const tags: ProductTag[] = [];
  let occasion: string | null = null;
  for (const entry of KEYWORD_MAP) {
    if (entry.keywords.some((k) => input.includes(k))) {
      entry.tags.forEach((t) => !tags.includes(t) && tags.push(t));
      if (entry.occasion && !occasion) occasion = entry.occasion;
    }
  }

  const categories: Category[] = [];
  const mustInclude: string[] = [];
  for (const entry of CATEGORY_KEYWORDS) {
    const hit = entry.keywords.find((k) => input.includes(k));
    if (hit) {
      if (!categories.includes(entry.category)) categories.push(entry.category);
      mustInclude.push(hit);
    }
  }

  const requiresCompleteOutfit = OUTFIT_PHRASES.some((p) => input.includes(p));

  return {
    budget,
    tags,
    categories,
    occasion,
    requiresCompleteOutfit,
    mustInclude,
    rawTokens: input.split(/\s+/).filter(Boolean),
  };
}

export function needsClarification(input: string, c: ParsedConstraints): string | null {
  if (!input.trim()) return "Tell me what you're shopping for — try “winter outfit under ₹6,000”.";
  if (input.trim().length < 4)
    return "That's a bit short for me to work with. Add an occasion and a budget, e.g. “formal look under ₹4,000”.";
  if (c.budget === null && c.tags.length === 0 && c.categories.length === 0 && !c.requiresCompleteOutfit) {
    return "I couldn't recognise an occasion, category or budget in that. Try something like “budget gym gear under ₹2,500” or “winter outfit under ₹6,000”.";
  }
  return null;
}

/* ────────────────────────────  CANDIDATES  ──────────────────────────── */

export function scoreProduct(p: Product, c: ParsedConstraints): number {
  const matched = p.tags.filter((t) => c.tags.includes(t)).length;
  const tagScore = c.tags.length ? matched / c.tags.length : 0.5;
  const ratingScore = p.rating / 5;
  const valueScore = Math.min(1, 3000 / Math.max(p.price, 1));
  return Number((tagScore * 0.55 + ratingScore * 0.3 + valueScore * 0.15).toFixed(3));
}

export function findCandidates(c: ParsedConstraints): Product[] {
  const inStock = products.filter((p) => p.stock > 0);
  let list = inStock;

  if (c.tags.length) {
    const tagged = inStock.filter((p) => p.tags.some((t) => c.tags.includes(t)));
    if (tagged.length) list = tagged;
  }
  if (c.categories.length && !c.requiresCompleteOutfit) {
    const inCat = list.filter((p) => c.categories.includes(p.category));
    if (inCat.length) list = inCat;
  }
  if (c.budget !== null) {
    const affordable = list.filter((p) => p.price <= c.budget!);
    list = affordable;
  }
  return list.sort((a, b) => scoreProduct(b, c) - scoreProduct(a, c));
}

/* ────────────────────────────  SELECTION  ──────────────────────────── */

export interface SelectionResult {
  items: CartItem[];
  decisions: SelectionDecision[];
  amounts: Amounts;
  requiredCategories: Category[];
  coveredCategories: Category[];
  partial: boolean;
  logs: string[];
}

function defaultSize(p: Product) {
  return p.sizes[2] ?? p.sizes[0] ?? "One Size";
}

export function requiredCategoriesFor(c: ParsedConstraints): Category[] {
  if (c.requiresCompleteOutfit) return ["Outerwear", "Tops", "Bottoms", "Footwear"];
  if (c.categories.length) return [...c.categories];
  if (c.tags.includes("sport")) return ["Tops", "Bottoms", "Footwear"];
  return ["Tops"];
}

/**
 * Greedy value-per-rupee selection with category coverage.
 * Deterministic: candidates are sorted, ties resolved by id.
 */
export function selectItems(c: ParsedConstraints, candidates: Product[]): SelectionResult {
  const logs: string[] = [];
  const budget = c.budget ?? Number.POSITIVE_INFINITY;
  const required = requiredCategoriesFor(c);
  const items: CartItem[] = [];
  const decisions: SelectionDecision[] = [];
  const covered: Category[] = [];
  let remaining = budget;

  // Reserve budget so later categories are still reachable.
  for (let i = 0; i < required.length; i++) {
    const cat = required[i]!;
    const slotsLeft = required.length - i;
    const pool = candidates
      .filter((p) => p.category === cat && !items.some((it) => it.product.id === p.id))
      .sort((a, b) => {
        const d = scoreProduct(b, c) / Math.max(b.price, 1) - scoreProduct(a, c) / Math.max(a.price, 1);
        return d !== 0 ? d : a.id.localeCompare(b.id);
      });

    if (!pool.length) {
      logs.push(`No candidates available for category ${cat}.`);
      continue;
    }

    const cheapestPerRemainingCat = required
      .slice(i + 1)
      .map((rc) => {
        const cheapest = candidates.filter((p) => p.category === rc).sort((a, b) => a.price - b.price)[0];
        return cheapest ? cheapest.price : 0;
      })
      .reduce((s, v) => s + v, 0);

    const spendCap = Number.isFinite(remaining)
      ? Math.max(0, remaining - cheapestPerRemainingCat)
      : Number.POSITIVE_INFINITY;

    const affordable = pool.filter((p) => p.price <= spendCap);
    const rejected: RejectedAlternative[] = pool
      .filter((p) => p.price > spendCap)
      .slice(0, 4)
      .map((p) => ({
        productId: p.id,
        name: p.name,
        price: p.price,
        reason: `Rejected — ₹${p.price.toLocaleString("en-IN")} exceeds the ₹${Math.round(spendCap).toLocaleString("en-IN")} available for this slot (${slotsLeft - 1} category slot(s) still to fill).`,
      }));

    if (!affordable.length) {
      logs.push(`Skipped ${cat}: nothing fits the ₹${Math.round(spendCap).toLocaleString("en-IN")} available for this slot.`);
      continue;
    }

    const chosen = affordable[0]!;
    const runnersUp: RejectedAlternative[] = affordable
      .slice(1, 4)
      .map((p) => ({
        productId: p.id,
        name: p.name,
        price: p.price,
        reason: `Rejected — lower value-per-rupee (${(scoreProduct(p, c) / p.price).toFixed(4)}) than the selected item (${(scoreProduct(chosen, c) / chosen.price).toFixed(4)}).`,
      }));

    const matchedTags = chosen.tags.filter((t) => c.tags.includes(t));
    const decision: SelectionDecision = {
      productId: chosen.id,
      score: scoreProduct(chosen, c),
      candidatesConsidered: pool.length,
      remainingBudgetAtSelection: Number.isFinite(remaining) ? remaining : -1,
      categorySlot: cat,
      matchedTags,
      rejectedAlternatives: [...runnersUp, ...rejected].slice(0, 5),
      justification: `Selected “${chosen.name}” (₹${chosen.price.toLocaleString("en-IN")}) — fills the required ${cat} slot${matchedTags.length ? ` and matches tag${matchedTags.length > 1 ? "s" : ""} ${matchedTags.map((t) => `'${t}'`).join(", ")}` : ""}; best value-per-rupee (${(scoreProduct(chosen, c) / chosen.price).toFixed(4)}) among ${pool.length} candidate(s)${Number.isFinite(remaining) ? ` within the remaining budget of ₹${Math.round(remaining).toLocaleString("en-IN")}` : ""}.`,
    };

    items.push({
      product: chosen,
      quantity: 1,
      selectedSize: defaultSize(chosen),
      selectedColor: chosen.colors[0] ?? "Default",
      reasonAddedByAgent: decision.justification,
      decision,
    });
    decisions.push(decision);
    covered.push(cat);
    remaining -= chosen.price;
    logs.push(
      `Selected ${chosen.name} (₹${chosen.price.toLocaleString("en-IN")}) for ${cat}. Remaining budget: ${Number.isFinite(remaining) ? `₹${Math.round(remaining).toLocaleString("en-IN")}` : "unbounded"}.`,
    );
  }

  const amounts = calculateAmounts(items);
  return {
    items,
    decisions,
    amounts,
    requiredCategories: required,
    coveredCategories: covered,
    partial: covered.length < required.length,
    logs,
  };
}

export function closestAchievable(c: ParsedConstraints, candidates: Product[]): Product | null {
  const budget = c.budget ?? Number.POSITIVE_INFINITY;
  const affordable = candidates.filter((p) => p.price <= budget);
  if (!affordable.length) {
    return [...products].sort((a, b) => a.price - b.price)[0] ?? null;
  }
  return affordable.sort((a, b) => scoreProduct(b, c) - scoreProduct(a, c))[0] ?? null;
}

export function makeId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
