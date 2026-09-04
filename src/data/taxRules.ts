import type { Amounts, CartItem, TaxLine } from "@/types";

export const GST_THRESHOLD = 1000;
export const GST_LOW = 0.12;
export const GST_HIGH = 0.18;
export const FREE_SHIPPING_THRESHOLD = 2000;
export const FLAT_SHIPPING = 99;

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
}

/** Per-item GST slab simulation mirroring Indian apparel rules. */
export function calculateTax(items: CartItem[]): { tax: number; taxLines: TaxLine[] } {
  const taxLines: TaxLine[] = items.map((item) => {
    const unitPrice = item.product.price;
    const slab = unitPrice < GST_THRESHOLD ? GST_LOW : GST_HIGH;
    const taxAmount = Math.round(unitPrice * item.quantity * slab);
    return {
      productId: item.product.id,
      name: item.product.name,
      unitPrice,
      quantity: item.quantity,
      slab,
      taxAmount,
      rule:
        unitPrice < GST_THRESHOLD
          ? `Unit price ₹${unitPrice} < ₹${GST_THRESHOLD} → GST slab 12%`
          : `Unit price ₹${unitPrice} ≥ ₹${GST_THRESHOLD} → GST slab 18%`,
    };
  });
  return { tax: taxLines.reduce((s, l) => s + l.taxAmount, 0), taxLines };
}

export function calculateShipping(subtotal: number): { shipping: number; shippingRule: string } {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return {
      shipping: 0,
      shippingRule: `Subtotal ₹${subtotal.toLocaleString("en-IN")} ≥ ₹${FREE_SHIPPING_THRESHOLD.toLocaleString("en-IN")} → free shipping`,
    };
  }
  return {
    shipping: FLAT_SHIPPING,
    shippingRule: `Subtotal ₹${subtotal.toLocaleString("en-IN")} < ₹${FREE_SHIPPING_THRESHOLD.toLocaleString("en-IN")} → flat shipping ₹${FLAT_SHIPPING}`,
  };
}

export function calculateAmounts(items: CartItem[]): Amounts {
  const subtotal = calculateSubtotal(items);
  const { tax, taxLines } = calculateTax(items);
  const { shipping, shippingRule } = calculateShipping(subtotal);
  return { subtotal, tax, shipping, total: subtotal + tax + shipping, taxLines, shippingRule };
}

export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}
