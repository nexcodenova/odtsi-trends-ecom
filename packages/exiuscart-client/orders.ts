import { storeUrl } from "./config";
import type { CheckoutPayload, Order } from "./types";

// Creates a pending order and a payment intent in one call.
// clientSecret is safe to expose to the browser — it's designed for that.
export async function createCheckout(payload: CheckoutPayload): Promise<{ order: Order; clientSecret: string }> {
  const res = await fetch(storeUrl("/checkout"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Checkout failed: ${res.status}`);
  return res.json();
}

// Guest order lookup — order number + email, no account needed.
export async function lookupOrder(orderNumber: string, email: string): Promise<Order> {
  const query = new URLSearchParams({ email });
  const res = await fetch(storeUrl(`/orders/${orderNumber}?${query.toString()}`));
  if (!res.ok) throw new Error(`Order not found: ${res.status}`);
  return res.json();
}
