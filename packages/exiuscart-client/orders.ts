import { storeUrl } from "./config";
import type { CartItem, CartPreview, CheckoutPayload, CheckoutResult, Order } from "./types";

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
// token is the logged-in shopper's — only needed to spend wallet balance.
// Same item shape for /checkout and /discounts/preview. A bundle line
// carries the option picked for each part (bundle_selections).
function toRawItems(items: CartItem[]) {
  return items.map((item) => ({
    product_id: Number(item.productId),
    quantity: item.quantity,
    variant_id: item.variantId ? Number(item.variantId) : undefined,
    bundle_selections:
      item.bundleSelections && item.bundleSelections.length > 0
        ? item.bundleSelections.map((s) => ({
            component_product_id: Number(s.componentProductId),
            variant_id: Number(s.variantId),
          }))
        : undefined,
  }));
}

export async function createCheckout(payload: CheckoutPayload, token?: string): Promise<CheckoutResult> {
  const body = {
    items: toRawItems(payload.items),
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
    discount_code: payload.discountCode || undefined,
    use_wallet_amount: payload.useWalletAmount && payload.useWalletAmount > 0 ? payload.useWalletAmount : undefined,
  };

  const res = await fetch(storeUrl("/checkout"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, `Checkout failed: ${res.status}`));

  // payment can be absent when nothing is left to pay (e.g. wallet
  // balance covered the whole order) — there's no gateway session then.
  const raw: { order_number: string; total: number; payment?: RawPayment | null } = await res.json();
  return {
    orderNumber: raw.order_number,
    total: raw.total,
    payment: {
      gateway: raw.payment?.gateway ?? "none",
      orderId: raw.payment?.order_id ?? raw.order_number,
      redirectUrl: raw.payment?.redirect_url ?? undefined,
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

interface RawHint {
  type?: string;
  message?: string;
  qty?: number;
  reward?: { kind?: string; get?: number; percent?: number };
  discount_id?: number;
}

// ExiusCart sends hints as data; this words them for the cart.
// `applied` = offer ids already in use, so a repeat reads "1 more free".
function hintText(h: RawHint, applied: Set<string>): string | null {
  if (typeof h.message === "string" && h.message.trim()) return h.message.trim();
  if (h.type !== "add_items" || !h.qty || h.qty <= 0 || !h.reward) return null;
  const { kind, get, percent } = h.reward;
  if (kind === "bxgy" && get) {
    const more = h.discount_id !== undefined && applied.has(String(h.discount_id)) ? " more" : "";
    return percent === undefined || percent >= 100
      ? `Add ${h.qty} more to get ${get}${more} free`
      : `Add ${h.qty} more to get ${get}${more} at ${percent}% off`;
  }
  if (percent) return `Add ${h.qty} more to save ${percent}%`;
  return null;
}

// Prices the cart with the same engine as /checkout (offers, gifts, an
// optional code) without creating an order. A bad code throws with
// ExiusCart's own message, so the caller can retry without it.
export async function previewCart(items: CartItem[], options: { code?: string; email?: string } = {}): Promise<CartPreview> {
  const res = await fetch(storeUrl("/discounts/preview"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: toRawItems(items),
      code: options.code || undefined,
      email: options.email || undefined,
    }),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, "That code couldn't be applied."));
  const raw = await res.json();
  const code: string | null = typeof raw.code === "string" && raw.code ? raw.code : null;
  const codeDiscount = Number(raw.discount_amount ?? 0);
  const offers = (Array.isArray(raw.offers) ? raw.offers : [])
    .map((o: { id: number; title?: string; amount?: number; free_shipping?: boolean }) => ({
      id: String(o.id),
      title: o.title ?? "Offer",
      amount: Number(o.amount ?? 0),
      freeShipping: !!o.free_shipping,
    }))
    .filter((o: { amount: number; freeShipping: boolean }) => o.amount > 0 || o.freeShipping);
  const explicitNote = [raw.code_note, raw.code_message, raw.code_reason].find((v) => typeof v === "string" && v.trim());
  const codeNote =
    explicitNote ??
    (options.code && (!code || codeDiscount <= 0) && offers.length > 0
      ? `${options.code.toUpperCase()} doesn't combine with your offer, so the bigger saving was used.`
      : null);
  return {
    code,
    codeDiscount,
    codeNote,
    offers,
    totalDiscount: Number(raw.total_discount ?? codeDiscount + offers.reduce((s: number, o: { amount: number }) => s + o.amount, 0)),
    freeShipping: !!raw.free_shipping,
    gifts: (Array.isArray(raw.gifts) ? raw.gifts : []).map(
      (g: { title?: string; name?: string; product_name?: string; image?: string | null; image_url?: string | null; quantity?: number; qty?: number }) => ({
        title: g.title ?? g.name ?? g.product_name ?? "Free gift",
        imageUrl: g.image ?? g.image_url ?? null,
        quantity: Number(g.quantity ?? g.qty ?? 1),
      }),
    ),
    hints: (Array.isArray(raw.hints) ? raw.hints : [])
      .map((h: RawHint) => hintText(h, new Set(offers.map((o: { id: string }) => o.id))))
      .filter((t: string | null): t is string => !!t),
    total: raw.total === undefined || raw.total === null ? null : Number(raw.total),
  };
}
