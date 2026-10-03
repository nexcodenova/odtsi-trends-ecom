import { storeUrl } from "./config";

export interface CheckoutStartedItem {
  productId: string;
  quantity: number;
}

// ExiusCart's real Abandoned Cart recovery endpoint — fires once, the
// moment a real email is captured at checkout, BEFORE order submission.
// Fire-and-forget, same as trackStorefrontEvent: a failure here (network
// hiccup, ad blocker) must never block real checkout, so it never throws.
export async function notifyCheckoutStarted(email: string, items: CheckoutStartedItem[]): Promise<void> {
  try {
    await fetch(storeUrl("/checkout-started"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        items: items.map((i) => ({ product_id: Number(i.productId), quantity: i.quantity })),
      }),
      keepalive: true,
    });
  } catch {
    // Real abandoned-cart signal, not a required feature — swallow silently.
  }
}
