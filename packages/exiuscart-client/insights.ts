import { storeUrl } from "./config";

// ExiusCart's own on-site analytics endpoint — confirmed real and live
// this session (POST /public/store/{slug}/track, {"ok":true}). Separate
// from the Meta/Google retargeting pixels (apps/website/lib/tracking.ts):
// this feeds ExiusCart's OWN seller dashboard (Website Traffic chart,
// product funnel, search terms, "Orders per 100 Views"), not an ad
// platform. It was real but undocumented on ExiusCart's side — the
// dashboard's traffic chart was empty simply because nothing had ever
// called it, not because tracking itself was broken or unbuilt.
type TrackEvent =
  | { event: "view"; productId: string }
  | { event: "add_to_cart"; productId: string }
  | { event: "search"; query: string };

// Fire-and-forget — a real analytics call failing (network hiccup, ad
// blocker) should never break the page it's describing. keepalive lets it
// survive a call fired right before the browser navigates away.
export async function trackStorefrontEvent(event: TrackEvent): Promise<void> {
  try {
    const body =
      event.event === "search"
        ? { event: "search", query: event.query }
        : { event: event.event, product_id: Number(event.productId) };
    await fetch(storeUrl("/track"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch {
    // Real analytics, not a required feature — swallow silently.
  }
}
