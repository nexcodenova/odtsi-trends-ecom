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
}

const CART_KEY = "odtsi_cart";
const CART_UPDATED_EVENT = "odtsi-cart-updated";

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
  const existing = cart.find((i) => i.productId === item.productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...item, quantity });
  }
  saveCart(cart);
}

export function updateQuantity(productId: string, quantity: number) {
  const cart = getCart();
  const item = cart.find((i) => i.productId === productId);
  if (!item) return;
  if (quantity <= 0) {
    saveCart(cart.filter((i) => i.productId !== productId));
  } else {
    item.quantity = quantity;
    saveCart(cart);
  }
}

export function removeFromCart(productId: string) {
  saveCart(getCart().filter((i) => i.productId !== productId));
}

export function clearCart() {
  saveCart([]);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export { CART_UPDATED_EVENT };
