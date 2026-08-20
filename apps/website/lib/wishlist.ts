// Client-side wishlist storage — same pattern as cart.ts. No fraud risk in
// living only in the browser (worst case it resets), so no backend needed.

export interface WishlistItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  imageUrl: string;
}

const WISHLIST_KEY = "odtsi_wishlist";
const WISHLIST_UPDATED_EVENT = "odtsi-wishlist-updated";

export function getWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? (JSON.parse(raw) as WishlistItem[]) : [];
  } catch {
    return [];
  }
}

function saveWishlist(items: WishlistItem[]) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(WISHLIST_UPDATED_EVENT));
}

export function isInWishlist(productId: string): boolean {
  return getWishlist().some((i) => i.productId === productId);
}

export function addToWishlist(item: WishlistItem) {
  const list = getWishlist();
  if (list.some((i) => i.productId === item.productId)) return;
  saveWishlist([...list, item]);
}

export function removeFromWishlist(productId: string) {
  saveWishlist(getWishlist().filter((i) => i.productId !== productId));
}

export function toggleWishlist(item: WishlistItem): boolean {
  const inList = isInWishlist(item.productId);
  if (inList) {
    removeFromWishlist(item.productId);
    return false;
  }
  addToWishlist(item);
  return true;
}

export { WISHLIST_UPDATED_EVENT };
