import { EXIUSCART_BASE_URL, SHOP_ID, storeUrl } from "./config";

// ExiusCart's own on-site analytics endpoint — confirmed real and live
// this session (POST /public/store/{slug}/track, {"ok":true}). Separate
// from the Meta/Google retargeting pixels (apps/website/lib/tracking.ts):
// this feeds ExiusCart's OWN seller dashboard (Website Traffic chart,
// product funnel, search terms, "Orders per 100 Views"), not an ad
// platform. It was real but undocumented on ExiusCart's side — the
// dashboard's traffic chart was empty simply because nothing had ever
// called it, not because tracking itself was broken or unbuilt.
// "page" (added 2026-10-15) counts every non-product page toward Website
// Traffic. A product page sends "view" instead — never both on one load.
type TrackEvent =
  | { event: "page"; path: string }
  | { event: "view"; productId: string }
  | { event: "add_to_cart"; productId: string }
  | { event: "search"; query: string };

// Personalised emails ("you viewed this but didn't buy", birthday
// discounts) need every /track call tied to one browser, and that browser
// tied to an email once the shopper gives one. ExiusCart accepts 8–64
// letters, digits, "-" or "_"; a UUID fits.
const VISITOR_KEY = "odtsi_visitor_id";
const EMAIL_KEY = "odtsi_shopper_email";
let memoryVisitorId: string | null = null;

function newVisitorId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

// Private windows can throw on localStorage — fall back to one ID for the
// life of the tab rather than a new one per call.
function getVisitorId(): string {
  try {
    const stored = localStorage.getItem(VISITOR_KEY);
    if (stored && /^[A-Za-z0-9_-]{8,64}$/.test(stored)) return stored;
    const id = newVisitorId();
    localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    memoryVisitorId ??= newVisitorId();
    return memoryVisitorId;
  }
}

function getKnownEmail(): string | undefined {
  try {
    return localStorage.getItem(EMAIL_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

// Called on sign-out so the next person on a shared computer isn't tied
// to the previous shopper's email. ExiusCart asked for a fresh visitor_id
// here too, so the next person's browsing starts unlinked.
export function forgetShopper(): void {
  memoryVisitorId = null;
  try {
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(VISITOR_KEY);
  } catch {
    // Nothing stored to forget.
  }
}

// Fire-and-forget — a real analytics call failing (network hiccup, ad
// blocker) should never break the page it's describing. keepalive lets it
// survive a call fired right before the browser navigates away.
export async function trackStorefrontEvent(event: TrackEvent): Promise<void> {
  try {
    const body =
      event.event === "page"
        ? { event: "page", path: event.path }
        : event.event === "search"
          ? { event: "search", query: event.query }
          : { event: event.event, product_id: Number(event.productId) };
    await fetch(storeUrl("/track"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, visitor_id: getVisitorId(), email: getKnownEmail() }),
      keepalive: true,
    });
  } catch {
    // Real analytics, not a required feature — swallow silently.
  }
}

// Links this browser's product views to an email. Called wherever a
// shopper gives one: sign-in, sign-up, checkout. Repeat calls for an
// already-linked email are skipped unless they add a name, birthday
// ("MM-DD") or consent. Identifying alone never allows marketing emails —
// marketingConsent is true only when the shopper ticked an unticked
// "email me offers" box. Leaving it out never removes an earlier yes.
export async function identifyShopper(shopper: {
  email: string;
  name?: string;
  birthday?: string;
  marketingConsent?: boolean;
}): Promise<void> {
  const email = shopper.email.trim().toLowerCase();
  if (!email.includes("@")) return;
  if (getKnownEmail() === email && !shopper.name && !shopper.birthday && !shopper.marketingConsent) return;
  try {
    localStorage.setItem(EMAIL_KEY, email);
  } catch {
    // Still identify this once even if it can't be remembered.
  }
  try {
    await fetch(storeUrl("/identify"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitor_id: getVisitorId(),
        email,
        name: shopper.name?.trim() || undefined,
        birthday: shopper.birthday || undefined,
        marketing_consent: shopper.marketingConsent || undefined,
      }),
      keepalive: true,
    });
  } catch {
    // Same as /track — never blocks the form that triggered it.
  }
}

export interface SubscribeResult {
  // Only when a popupId of a popup with a discount code was passed.
  discountCode: string | null;
  // The store uses double opt-in — show "check your inbox", not a code.
  needsConfirmation: boolean;
}

// Newsletter sign-up. Subscribing is itself the marketing yes, and it links
// this browser's views the same way identify does. The 10% welcome code is
// emailed by the Welcome series flow (turned on in ExiusCart's dashboard),
// not returned here unless popupId is passed. Unlike track/identify this
// one throws, so the form can show a real error.
export async function subscribeShopper(shopper: {
  email: string;
  name?: string;
  birthday?: string;
  popupId?: string;
}): Promise<SubscribeResult> {
  const email = shopper.email.trim().toLowerCase();
  const body = JSON.stringify({
    email,
    name: shopper.name?.trim() || undefined,
    birthday: shopper.birthday || undefined,
    visitor_id: getVisitorId(),
    source: "website_form",
    popup_id: shopper.popupId ? Number(shopper.popupId) : undefined,
    page_url: typeof window !== "undefined" ? window.location.href : undefined,
  });
  const post = (url: string) => fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
  let res = await post(storeUrl("/subscribe"));
  // The slug route wasn't deployed yet on 2026-10-19 (plain 404 "Not
  // Found"); the numeric-ID route takes the same body.
  if (res.status === 404 && SHOP_ID) res = await post(`${EXIUSCART_BASE_URL}/public/email-list/${SHOP_ID}/subscribe`);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 429) throw new Error("Too many tries — wait a minute and try again.");
    throw new Error(typeof data?.detail === "string" ? data.detail : "Couldn't subscribe — try again.");
  }
  try {
    localStorage.setItem(EMAIL_KEY, email);
  } catch {
    // Linked server-side already; remembering it only adds the email to /track.
  }
  return { discountCode: data?.discount_code ?? null, needsConfirmation: data?.needs_confirmation === true };
}
