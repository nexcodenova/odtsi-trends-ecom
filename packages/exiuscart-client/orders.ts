import { storeUrl } from "./config";
import type { CheckoutPayload, CheckoutResult, Order } from "./types";

// ExiusCart's real /orders/{order_number} response — confirmed against
// its code 2026-10-01. No currency field (see types.ts's note on Order.currency).
interface RawOrder {
  order_number: string;
  status: Order["status"];
  total: number;
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
    currency: null,
    trackingNumber: raw.tracking_number ?? null,
    carrier: raw.carrier ?? null,
    shippedAt: raw.shipped_at ?? null,
    estimatedDelivery: raw.estimated_delivery ?? null,
  };
}

interface RawPayment {
  gateway: string;
  order_id: string;
  redirect_url?: string | null;
}

// Real error message from ExiusCart when there is one — falls back to the
// status code only if the body isn't the shape we expect (FastAPI's
// HTTPException sometimes sends detail as a plain string, sometimes as a
// {error, message} object — both show up across this codebase).
async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.detail === "string") return body.detail;
    if (typeof body?.detail?.message === "string") return body.detail.message;
    return fallback;
  } catch {
    return fallback;
  }
}

// Creates a real pending order and a real payment-session in one call.
// returnUrl/cancelUrl are required — every real gateway ExiusCart's
// storefront checkout supports (Stripe/Whop/PayPal) 422s without them.
export async function createCheckout(payload: CheckoutPayload): Promise<CheckoutResult> {
  const body = {
    items: payload.items.map((item) => ({ product_id: Number(item.productId), quantity: item.quantity })),
    name: payload.customer.name,
    email: payload.customer.email,
    phone: payload.customer.phone,
    // A structured object is accepted (ExiusCart's own validator JSON-
    // encodes it), but only these specific keys render correctly on the
    // seller's side — see types.ts's note on CheckoutPayload.
    shipping_address: {
      name: payload.shippingAddress.name || payload.customer.name,
      address: payload.shippingAddress.address,
      address2: payload.shippingAddress.address2 || undefined,
      city: payload.shippingAddress.city,
      province: payload.shippingAddress.province || undefined,
      zip: payload.shippingAddress.zip,
      country: payload.shippingAddress.country,
    },
    return_url: payload.returnUrl,
    cancel_url: payload.cancelUrl,
  };

  const res = await fetch(storeUrl("/checkout"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, `Checkout failed: ${res.status}`));

  const raw: { order_number: string; total: number; payment: RawPayment } = await res.json();
  return {
    orderNumber: raw.order_number,
    total: raw.total,
    payment: {
      gateway: raw.payment.gateway,
      orderId: raw.payment.order_id,
      redirectUrl: raw.payment.redirect_url ?? undefined,
    },
  };
}

// Guest order lookup — order number + email, no account needed.
export async function lookupOrder(orderNumber: string, email: string): Promise<Order> {
  const query = new URLSearchParams({ email });
  const res = await fetch(storeUrl(`/orders/${orderNumber}?${query.toString()}`));
  if (!res.ok) throw new Error(`Order not found: ${res.status}`);
  const raw: RawOrder = await res.json();
  return mapOrder(raw);
}
