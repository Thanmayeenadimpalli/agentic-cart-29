import type { CartItem, Order } from "@/types";
import { products } from "./mockProducts";

const ORDERS_KEY = "agenticcart.orders.v1";
const CART_KEY = "agenticcart.cart.v1";

function delay<T>(value: T, min = 300, max = 900): Promise<T> {
  const ms = Math.round(min + Math.random() * (max - min));
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    // Malformed storage — drop it rather than crash on rehydrate.
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    return fallback;
  }
}

function safeWrite(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — non-fatal for the demo */
  }
}

export const mockDb = {
  async listProducts() {
    return delay(products);
  },

  async getProduct(id: string) {
    return delay(products.find((p) => p.id === id) ?? null);
  },

  async listOrders(): Promise<Order[]> {
    const orders = safeRead<Order[]>(ORDERS_KEY, []);
    const clean = Array.isArray(orders) ? orders.filter((o) => o && typeof o.id === "string") : [];
    return delay(clean, 200, 600);
  },

  listOrdersSync(): Order[] {
    const orders = safeRead<Order[]>(ORDERS_KEY, []);
    return Array.isArray(orders) ? orders.filter((o) => o && typeof o.id === "string") : [];
  },

  async saveOrder(order: Order): Promise<Order> {
    const orders = mockDb.listOrdersSync();
    const existingIdx = orders.findIndex(
      (o) => o.id === order.id || o.idempotencyKey === order.idempotencyKey,
    );
    if (existingIdx >= 0) {
      orders[existingIdx] = { ...orders[existingIdx], ...order };
    } else {
      orders.unshift(order);
    }
    safeWrite(ORDERS_KEY, orders);
    return delay(order, 200, 500);
  },

  async getOrder(id: string): Promise<Order | null> {
    return delay(mockDb.listOrdersSync().find((o) => o.id === id) ?? null, 200, 500);
  },

  loadCart(): CartItem[] {
    const cart = safeRead<CartItem[]>(CART_KEY, []);
    if (!Array.isArray(cart)) return [];
    return cart.filter((i) => i && i.product && typeof i.product.id === "string" && i.quantity > 0);
  },

  saveCart(items: CartItem[]) {
    safeWrite(CART_KEY, items);
  },
};

export { delay };
