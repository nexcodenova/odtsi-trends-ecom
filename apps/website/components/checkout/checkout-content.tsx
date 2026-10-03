"use client";

import { useEffect, useRef, useState, type FocusEvent, type FormEvent } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@odtsi/utils";
import { createCheckout, notifyCheckoutStarted } from "@odtsi/exiuscart-client";
import { saveOrderRecord } from "@/lib/order-history";
import { getBuyNowItem, clearBuyNowItem } from "@/lib/buy-now";
import { cartSubtotal, clearCart, type CartItem } from "@/lib/cart";
import { trackInitiateCheckout, trackPurchase } from "@/lib/tracking";

export function CheckoutContent() {
  const { items: cartItems, subtotal: cartSubtotalAmount } = useCart();
  // A Buy Now click stashes exactly one item here instead of touching the
  // real cart — when present, checkout is scoped to just that item so a
  // shopper who clicked Buy Now doesn't silently also pay for whatever
  // else was already sitting in their cart.
  const [buyNowItem, setLocalBuyNowItem] = useState<CartItem | null | undefined>(undefined);
  useEffect(() => {
    setLocalBuyNowItem(getBuyNowItem());
  }, []);

  const items = buyNowItem ? [buyNowItem] : cartItems;
  const subtotal = buyNowItem ? cartSubtotal([buyNowItem]) : cartSubtotalAmount;
  const subtotalCurrency = items[0]?.currency ?? "USD";
  const price = (amount: number) => formatCurrency(amount, subtotalCurrency);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Fires once, the first real moment checkout actually has real items to
  // show (not on the buyNowItem===undefined loading frame, not again on
  // every re-render while typing into the form).
  const hasFiredInitiateCheckout = useRef(false);
  useEffect(() => {
    if (buyNowItem === undefined || items.length === 0 || hasFiredInitiateCheckout.current) return;
    hasFiredInitiateCheckout.current = true;
    trackInitiateCheckout(
      items.map((i) => ({ id: i.productId, name: i.name, price: i.price, quantity: i.quantity })),
      subtotal,
      subtotalCurrency,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyNowItem, items.length]);

  // Abandoned Cart recovery needs this fired once a real email is captured,
  // before order submission — not on every keystroke/blur of the same
  // email, so a ref (not state) tracks the last email this already fired
  // for.
  const lastCheckoutStartedEmail = useRef<string | null>(null);
  function handleEmailBlur(e: FocusEvent<HTMLInputElement>) {
    const email = e.currentTarget.value.trim().toLowerCase();
    if (!email || !email.includes("@") || email === lastCheckoutStartedEmail.current) return;
    lastCheckoutStartedEmail.current = email;
    notifyCheckoutStarted(
      email,
      items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = new FormData(e.currentTarget);

    const email = String(form.get("email"));

    try {
      const origin = window.location.origin;
      const result = await createCheckout({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        customer: {
          name: String(form.get("name")),
          email,
          phone: String(form.get("phone")),
        },
        shippingAddress: {
          address: String(form.get("address1")),
          address2: String(form.get("address2") ?? "") || undefined,
          city: String(form.get("city")),
          zip: String(form.get("postcode")),
          country: String(form.get("country")),
        },
        // Full absolute URLs — every real gateway (Stripe/Whop/PayPal)
        // redirects the browser straight here after payment. We don't
        // know the real order number yet (ExiusCart generates it as part
        // of this same call), so it isn't in the URL — the return page
        // reads the most recently saved order record instead.
        returnUrl: `${origin}/checkout/return`,
        cancelUrl: `${origin}/checkout/cancel`,
      });

      // Remembered locally so Order History / the return page can look
      // this up for real — ExiusCart has no account-wide order list yet.
      saveOrderRecord({ orderNumber: result.orderNumber, email });
      // The real order total ExiusCart just confirmed, not the pre-submit
      // client-side subtotal — matches what actually got recorded even if
      // a wallet discount or similar adjusted it server-side. Currency
      // isn't in ExiusCart's response (see types.ts) — subtotalCurrency
      // is the real currency this cart was already priced in.
      trackPurchase(result.orderNumber, result.total, subtotalCurrency);
      clearBuyNowItem();
      // A real order now exists in ExiusCart for this cart's contents,
      // regardless of whether payment completes — same as any real
      // e-commerce checkout, the cart clears on submission, not on
      // confirmed payment.
      if (!buyNowItem) clearCart();

      if (result.payment.redirectUrl) {
        // Full navigation, not client-side routing — this is a real
        // external domain (Whop/Stripe/PayPal's own hosted payment page).
        window.location.href = result.payment.redirectUrl;
        return;
      }
      // Shouldn't happen for a configured gateway — defensive only.
      setErrorMessage("Order placed, but no payment page was returned. Contact support with your order number: " + result.orderNumber);
      setStatus("error");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong — try again.");
      setStatus("error");
    }
  }

  // Wait for the sessionStorage check before deciding "empty" — otherwise
  // a Buy Now redirect can flash the empty-cart state for a frame while
  // buyNowItem is still unchecked.
  if (buyNowItem === undefined) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-16 text-center sm:py-24">
        <h1 className="text-2xl font-extrabold text-[#16161A]">Your cart is empty</h1>
        <p className="mt-2 text-sm text-[#716D67]">Add something to your cart before checking out.</p>
        <Link href="/" className="mt-6 rounded-xl bg-action px-6 py-3 text-sm font-bold text-action-ink hover:brightness-95">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-5">
      <h1 className="text-2xl font-extrabold text-[#16161A] sm:text-3xl">Checkout</h1>

      {/* Buy Now scopes checkout to just that one item — an explicit way
          back to the real cart in case that wasn't what the shopper meant. */}
      {buyNowItem && cartItems.length > 0 && (
        <button
          type="button"
          onClick={() => {
            clearBuyNowItem();
            setLocalBuyNowItem(null);
          }}
          className="mt-2 text-sm font-bold text-primary underline-offset-2 hover:underline"
        >
          Checking out 1 item — view full cart ({cartItems.length} item{cartItems.length === 1 ? "" : "s"}) instead
        </button>
      )}

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#8B8880]">Contact</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input name="name" required placeholder="Full name" className="h-12 rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-primary" />
              <input name="email" type="email" required placeholder="Email" onBlur={handleEmailBlur} className="h-12 rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-primary" />
              <input name="phone" required placeholder="Phone" className="h-12 rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-primary sm:col-span-2" />
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#8B8880]">Shipping Address</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input name="address1" required placeholder="Address line 1" className="h-12 rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-primary sm:col-span-2" />
              <input name="address2" placeholder="Address line 2 (optional)" className="h-12 rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-primary sm:col-span-2" />
              <input name="city" required placeholder="City" className="h-12 rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-primary" />
              <input name="postcode" required placeholder="Postcode" className="h-12 rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-primary" />
              <input name="country" required placeholder="Country" className="h-12 rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-primary sm:col-span-2" />
            </div>
          </div>

          {status === "error" && <p className="text-sm font-bold text-red-600">{errorMessage}</p>}

          <button
            type="submit"
            disabled={status === "loading"}
            className="h-12 rounded-xl bg-action text-sm font-bold text-action-ink transition hover:brightness-95 disabled:opacity-60"
          >
            {status === "loading" ? "Placing order..." : `Place Order — ${price(subtotal)}`}
          </button>
        </form>

        <div className="h-fit rounded-2xl border border-black/10 p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#8B8880]">Order Summary</h2>
          <div className="mt-3 flex flex-col gap-2">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-[#4A4844]">
                  {item.name} <span className="text-[#8B8880]">×{item.quantity}</span>
                </span>
                <span className="font-bold text-[#16161A]">{formatCurrency(item.price * item.quantity, item.currency)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-black/10 pt-4">
            <span className="text-sm font-bold text-[#16161A]">Subtotal</span>
            <span className="text-base font-extrabold text-primary">{price(subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
