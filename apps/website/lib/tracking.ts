// Retargeting event helpers — Meta Pixel + Google Ads, one real call site per
// event instead of every add-to-cart button rolling its own fbq/gtag calls.
// Both are genuine no-ops until a real ID is configured (see
// tracking-scripts.tsx): calling these before then just does nothing, never
// throws, never fakes a pixel that isn't actually there.

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

function fbq(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(...args);
  }
}

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

interface TrackProduct {
  id: string;
  name: string;
  price: number;
  currency: string;
}

// Fired once per real product-page view (product/[slug]) — the top of the
// retargeting funnel: "people who looked at this product."
export function trackViewContent(product: TrackProduct) {
  fbq("track", "ViewContent", {
    content_ids: [product.id],
    content_name: product.name,
    content_type: "product",
    value: product.price,
    currency: product.currency,
  });
  gtag("event", "view_item", {
    currency: product.currency,
    value: product.price,
    items: [{ item_id: product.id, item_name: product.name, price: product.price }],
  });
}

// Fired from the one real addToCart() chokepoint (lib/cart.ts) — catches
// every real add-to-cart across the site (product cards, product page,
// pack tiers) from a single call site rather than each button re-firing it.
export function trackAddToCart(item: TrackProduct & { quantity: number }) {
  fbq("track", "AddToCart", {
    content_ids: [item.id],
    content_name: item.name,
    content_type: "product",
    value: item.price * item.quantity,
    currency: item.currency,
  });
  gtag("event", "add_to_cart", {
    currency: item.currency,
    value: item.price * item.quantity,
    items: [{ item_id: item.id, item_name: item.name, price: item.price, quantity: item.quantity }],
  });
}

// Fired when the checkout page actually loads with real items in it — the
// real "started paying" signal, not just "opened the cart drawer."
export function trackInitiateCheckout(items: { id: string; name: string; price: number; quantity: number }[], value: number, currency: string) {
  fbq("track", "InitiateCheckout", {
    content_ids: items.map((i) => i.id),
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    value,
    currency,
  });
  gtag("event", "begin_checkout", {
    currency,
    value,
    items: items.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity })),
  });
}

// Fired once a real order is actually created — the highest-value signal
// for both platforms' lookalike/optimization audiences. Uses the real
// order number as Meta's event_id-adjacent identity via order_number so a
// retry/duplicate submit doesn't double-count (both platforms de-dupe on
// transaction_id/content_ids + value in practice, order_number is the real
// unique handle ExiusCart hands back).
export function trackPurchase(orderNumber: string, value: number, currency: string) {
  fbq("track", "Purchase", { value, currency, content_ids: [orderNumber] });
  gtag("event", "purchase", { transaction_id: orderNumber, value, currency });
}

// Fired from the real search results page — useful audience signal
// ("people who searched for X") even before Search's dedicated ad formats.
export function trackSearch(query: string) {
  fbq("track", "Search", { search_string: query });
  gtag("event", "search", { search_term: query });
}
