// Buy Now needs to check out exactly one item, isolated from whatever else
// is already sitting in the persistent cart — sessionStorage instead of the
// cart's localStorage key, so it never merges with real cart lines and
// clears itself when the tab closes if never used.
import type { CartItem } from "./cart";

const BUY_NOW_KEY = "odtsi_buy_now";

export function setBuyNowItem(item: CartItem) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(BUY_NOW_KEY, JSON.stringify(item));
}

export function getBuyNowItem(): CartItem | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(BUY_NOW_KEY);
    return raw ? (JSON.parse(raw) as CartItem) : null;
  } catch {
    return null;
  }
}

export function clearBuyNowItem() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(BUY_NOW_KEY);
}
