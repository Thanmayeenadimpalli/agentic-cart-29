export type Category = "Outerwear" | "Tops" | "Bottoms" | "Footwear" | "Accessories";

export type ProductTag =
  | "winter"
  | "summer"
  | "formal"
  | "casual"
  | "budget"
  | "premium"
  | "sport"
  | "outerwear"
  | "rain";

export interface Product {
  id: string;
  name: string;
  category: Category;
  /** Price in whole rupees (INR) */
  price: number;
  imageUrl: string;
  sizes: string[];
  colors: string[];
  stock: number;
  rating: number;
  tags: ProductTag[];
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  reasonAddedByAgent?: string;
  decision?: SelectionDecision;
}

export interface RejectedAlternative {
  productId: string;
  name: string;
  price: number;
  reason: string;
}

export interface SelectionDecision {
  productId: string;
  score: number;
  candidatesConsidered: number;
  remainingBudgetAtSelection: number;
  categorySlot: Category;
  matchedTags: string[];
  rejectedAlternatives: RejectedAlternative[];
  justification: string;
}

export type AgentStepStatus = "pending" | "in-progress" | "complete" | "error";

export interface AgentStep {
  id: string;
  label: string;
  status: AgentStepStatus;
  timestamp: number | null;
  detailLog: string[];
  durationMs: number;
}

export interface ParsedConstraints {
  budget: number | null;
  tags: ProductTag[];
  categories: Category[];
  occasion: string | null;
  requiresCompleteOutfit: boolean;
  mustInclude: string[];
  rawTokens: string[];
}

export type AgentSessionStatus =
  | "idle"
  | "clarifying"
  | "running"
  | "awaiting-approval"
  | "approved"
  | "rejected"
  | "error"
  | "completed";

export interface AgentSession {
  id: string;
  idempotencyKey: string;
  userIntent: string;
  parsedConstraints: ParsedConstraints;
  steps: AgentStep[];
  thoughtLog: string[];
  candidateProducts: Product[];
  selectedCart: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: AgentSessionStatus;
  errorMessage: string | null;
  partialMatch: boolean;
  auditLog: AuditLogEntry[];
  createdAt: number;
}

export type PaymentStatus = "pending" | "processing" | "paid" | "failed" | "timeout" | "rejected";

export type PaymentMethod = "upi" | "card" | "netbanking" | "wallet" | null;

export interface TaxLine {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  slab: number;
  taxAmount: number;
  rule: string;
}

export interface Amounts {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  taxLines: TaxLine[];
  shippingRule: string;
}

export interface Order {
  id: string;
  sessionId: string;
  idempotencyKey: string;
  userIntent: string;
  cartSnapshot: CartItem[];
  amounts: Amounts;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  auditLog: AuditLogEntry[];
  createdAt: number;
  webhookReceivedAt: number | null;
}

export interface AuditLogEntry {
  timestamp: number;
  actor: "agent" | "system" | "user";
  action: string;
  reasoning: string;
  dataSnapshot?: unknown;
}
