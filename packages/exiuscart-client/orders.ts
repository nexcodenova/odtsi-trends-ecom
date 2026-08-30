import { storeUrl } from "./config";
import type { CheckoutPayload, Order } from "./types";

// ExiusCart's real /checkout and /orders responses — snake_case, and the
// order fields are flattened differently than what ODTSI's UI expects.
// mapOrder() below is the one place that translates between the two.
interface RawOrder {
  order_number: string;
  status: Order["status"];
  total: number;
  currency: string;
  tracking_number: string | null;
  carrier: string | null;
  shipped_at: string | null;
  estimated_delivery: string | null;
}

function mapOrder(raw: RawOrder): Order {
  return {
    orderNumber: raw.order_number,
    status: raw.status,
    total: raw.total,
    currency: raw.currency,
    trackingNumber: raw.tracking_number ?? null,
    carrier: raw.carrier ?? null,
    shippedAt: raw.shipped_at ?? null,
    estimatedDelivery: raw.estimated_delivery ?? null,
  };
}

// Creates a pending order and a payment intent in one call.
// clientSecret is safe to expose to the browser — it's designed for that.
export async function createCheckout(payload: CheckoutPayload): Promise<{ order: Order; clientSecret: string }> {
  // ExiusCart's real /checkout body isn't shaped like CheckoutPayload —
  // confirmed via direct live testing 2026-08-31: items need product_id
  // (snake_case, not productId), and name/email/phone are top-level fields,
  // not nested under a `customer` object. shippingAddress is unchanged —
  // that nested shape is what the API actually accepts.
  const body = {
    items: payload.items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
    name: payload.customer.name,
    email: payload.customer.email,
    phone: payload.customer.phone,
    shippingAddress: payload.shippingAddress,
  };

  const res = await fetch(storeUrl("/checkout"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Checkout failed: ${res.status}`);
  const raw: { order: RawOrder; clientSecret: string } = await res.json();
  return { order: mapOrder(raw.order), clientSecret: raw.clientSecret };
}

// Guest order lookup — order number + email, no account needed.
export async function lookupOrder(orderNumber: string, email: string): Promise<Order> {
  const query = new URLSearchParams({ email });
  const res = await fetch(storeUrl(`/orders/${orderNumber}?${query.toString()}`));
  if (!res.ok) throw new Error(`Order not found: ${res.status}`);
  const raw: RawOrder = await res.json();
  return mapOrder(raw);
}
