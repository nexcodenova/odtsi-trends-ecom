// Client-side cart storage. Unlike wallet balance, a cart is fine to live
// only in the browser — there's no fraud risk (worst case it resets), and
// this is how guest carts work on most real e-commerce sites.

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  // When this line came from a pack/bundle (e.g. "buy 4"), the quantity
  // should step by this amount, not 1 at a time — otherwise +/- on the
  // cart page drifts into partial packs that don't match any real tier.
  // Defaults to 1 for a plain single-unit add.
  step?: number;
  // Distinguishes different price variants of the *same* product — the
  // single-unit price vs. each pack tier's price. Without this, adding a
  // pack after a single unit (or a different pack) would merge into one
  // line and silently keep whichever price was recorded first, mispricing
  // the rest of the quantity. Undefined = the plain single-unit variant.
  variantId?: string;
}

const CART_KEY = "odtsi_cart";
const CART_UPDATED_EVENT = "odtsi-cart-updated";

function sameLine(a: Pick<CartItem, "productId" | "variantId">, b: Pick<CartItem, "productId" | "variantId">) {
  return a.productId === b.productId && a.variantId === b.variantId;
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity = 1) {
  const cart = getCart();
  const existing = cart.find((i) => sameLine(i, item));
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...item, quantity });
  }
  saveCart(cart);
}

export function updateQuantity(productId: string, quantity: number, variantId?: string) {
  const cart = getCart();
  const item = cart.find((i) => sameLine(i, { productId, variantId }));
  if (!item) return;
  if (quantity <= 0) {
    saveCart(cart.filter((i) => !sameLine(i, { productId, variantId })));
  } else {
    item.quantity = quantity;
    saveCart(cart);
  }
}

export function removeFromCart(productId: string, variantId?: string) {
  saveCart(getCart().filter((i) => !sameLine(i, { productId, variantId })));
}

export function clearCart() {
  saveCart([]);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export { CART_UPDATED_EVENT };
