import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import { mockDb } from "@/data/mockDb";
import { calculateAmounts } from "@/data/taxRules";
import type { Amounts, CartItem, Product } from "@/types";

type Action =
  | { type: "hydrate"; items: CartItem[] }
  | { type: "add"; item: CartItem }
  | { type: "addMany"; items: CartItem[] }
  | { type: "remove"; productId: string }
  | { type: "setQty"; productId: string; quantity: number }
  | { type: "clear" };

function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case "hydrate":
      return action.items;
    case "add": {
      const idx = state.findIndex(
        (i) =>
          i.product.id === action.item.product.id &&
          i.selectedSize === action.item.selectedSize &&
          i.selectedColor === action.item.selectedColor,
      );
      if (idx >= 0) {
        const next = [...state];
        const existing = next[idx]!;
        next[idx] = { ...existing, quantity: existing.quantity + action.item.quantity };
        return next;
      }
      return [...state, action.item];
    }
    case "addMany":
      return action.items.reduce((acc, item) => reducer(acc, { type: "add", item }), state);
    case "remove":
      return state.filter((i) => i.product.id !== action.productId);
    case "setQty":
      return state
        .map((i) => (i.product.id === action.productId ? { ...i, quantity: action.quantity } : i))
        .filter((i) => i.quantity > 0);
    case "clear":
      return [];
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  amounts: Amounts;
  hydrated: boolean;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  addProduct: (product: Product, opts?: { size?: string; color?: string; quantity?: number }) => void;
  addAgentItems: (items: CartItem[]) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, [] as CartItem[]);
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      dispatch({ type: "hydrate", items: mockDb.loadCart() });
    } catch {
      dispatch({ type: "hydrate", items: [] });
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) mockDb.saveCart(items);
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.quantity, 0),
      amounts: calculateAmounts(items),
      hydrated,
      drawerOpen,
      setDrawerOpen,
      addProduct: (product, opts) =>
        dispatch({
          type: "add",
          item: {
            product,
            quantity: opts?.quantity ?? 1,
            selectedSize: opts?.size ?? product.sizes[0] ?? "One Size",
            selectedColor: opts?.color ?? product.colors[0] ?? "Default",
          },
        }),
      addAgentItems: (newItems) => dispatch({ type: "addMany", items: newItems }),
      removeItem: (productId) => dispatch({ type: "remove", productId }),
      setQuantity: (productId, quantity) => dispatch({ type: "setQty", productId, quantity }),
      clear: () => dispatch({ type: "clear" }),
    }),
    [items, hydrated, drawerOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
