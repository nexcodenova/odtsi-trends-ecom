"use client";

import { useEffect, useRef, useState, type FocusEvent, type FormEvent } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@odtsi/utils";
import { identifyShopper, notifyCheckoutStarted, previewDiscount, type CheckoutPayload, type CheckoutResult } from "@odtsi/exiuscart-client";
import { saveOrderRecord } from "@/lib/order-history";
import { getBuyNowItem, clearBuyNowItem } from "@/lib/buy-now";
import { cartSubtotal, type CartItem } from "@/lib/cart";
import { trackInitiateCheckout } from "@/lib/tracking";

// Goes through this site's own /api/checkout so a signed-in shopper's
// token (needed for wallet spending) never reaches client JS.
async function submitCheckout(payload: CheckoutPayload): Promise<CheckoutResult> {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof body?.error === "string" ? body.error : `Checkout failed: ${res.status}`);
  return body as CheckoutResult;
}

export function CheckoutContent({
  customer,
  wallet,
}: {
  customer: { name: string; email: string } | null;
  wallet: { balance: number; currency: string } | null;
}) {
  const { items: cartItems, subtotal: cartSubtotalAmount } = useCart();
  // A Buy Now click stashes exactly one item here instead of touching the
  // real cart — when present, checkout is scoped to just that item so a
  // shopper who clicked Buy Now doesn't silently also pay for whatever
  // else was already sitting in their cart.
  const [buyNowItem, setLocalBuyNowItem] = useState<CartItem | null | undefined>(undefined);
  useEffect(() => {
    setLocalBuyNowItem(getBuyNowItem());
  }, []);
  useEffect(() => {
    if (customer) identifyShopper({ email: customer.email, name: customer.name });
  }, [customer]);

  const items = buyNowItem ? [buyNowItem] : cartItems;
  const subtotal = buyNowItem ? cartSubtotal([buyNowItem]) : cartSubtotalAmount;
  const subtotalCurrency = items[0]?.currency ?? "USD";
  const price = (amount: number) => formatCurrency(amount, subtotalCurrency);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Discount preview — same validation ExiusCart runs at checkout, so
  // "applied" here means it will really apply (it's re-checked there).
  const [discountInput, setDiscountInput] = useState("");
  const [discount, setDiscount] = useState<{ code: string; amount: number } | null>(null);
  const [discountStatus, setDiscountStatus] = useState<{ kind: "idle" | "loading" } | { kind: "error"; message: string }>({
    kind: "idle",
  });
  const discountAmount = discount ? Math.min(discount.amount, subtotal) : 0;
  const afterDiscount = Math.max(subtotal - discountAmount, 0);

  // Only offered when the wallet is in the same currency as the cart —
  // ExiusCart caps the real amount at the shopper's balance either way.
  const [useWallet, setUseWallet] = useState(false);
  const walletUsable = wallet !== null && wallet.balance > 0 && wallet.currency === subtotalCurrency;
  const walletAmount = useWallet && walletUsable ? Math.min(wallet.balance, afterDiscount) : 0;
  const total = Math.max(afterDiscount - walletAmount, 0);

  async function applyDiscount() {
    const code = discountInput.trim();
    if (!code) return;
    setDiscountStatus({ kind: "loading" });
    try {
      const preview = await previewDiscount(code, subtotal);
      setDiscount({ code: preview.code, amount: preview.discount });
      setDiscountStatus({ kind: "idle" });
    } catch (err) {
      setDiscount(null);
      setDiscountStatus({ kind: "error", message: err instanceof Error ? err.message : "That code couldn't be applied." });
    }
  }

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
    const name = e.currentTarget.form?.elements.namedItem("name");
    identifyShopper({ email, name: name instanceof HTMLInputElement ? name.value : undefined });
    notifyCheckoutStarted(
      email,
      items.map((i) => ({ productId: i.productId, quantity: i.quantity, variantId: i.exiusVariantId })),
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = new FormData(e.currentTarget);

    const email = String(form.get("email"));

    try {
      const origin = window.location.origin;
      const result = await submitCheckout({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity, variantId: item.exiusVariantId })),
        customer: {
          name: String(form.get("name")),
          email,
          phone: String(form.get("phone")),
        },
        shippingAddress: {
          address: String(form.get("address1")),
          address2: String(form.get("address2") ?? "") || undefined,
          city: String(form.get("city")),
          province: String(form.get("province") ?? "") || undefined,
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
        discountCode: discount?.code,
        useWalletAmount: walletAmount > 0 ? Math.round(walletAmount * 100) / 100 : undefined,
      });

      // Remembered locally so Order History / the return page can look
      // this up for real — ExiusCart has no account-wide order list yet.
      // The order exists in ExiusCart now but is still unpaid, so the
      // Purchase pixel and the cart/Buy Now clear wait for the return
      // page to see it confirmed. The total is ExiusCart's confirmed one,
      // not the client-side subtotal; currency isn't in its response, so
      // it's the currency this cart was already priced in.
      saveOrderRecord({
        orderNumber: result.orderNumber,
        email,
        awaitingPayment: {
          total: result.total,
          currency: subtotalCurrency,
          source: buyNowItem ? "buy-now" : "cart",
        },
      });

      if (result.payment.redirectUrl) {
        // Full navigation, not client-side routing — this is a real
        // external domain (Whop/Stripe/PayPal's own hosted payment page).
        window.location.href = result.payment.redirectUrl;
        return;
      }
      // Nothing left to pay (wallet covered it) — no gateway page exists.
      if (result.total <= 0) {
        window.location.href = "/checkout/return";
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
              <input name="name" required defaultValue={customer?.name} placeholder="Full name" className="h-12 rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-primary" />
              <input name="email" type="email" required defaultValue={customer?.email} placeholder="Email" onBlur={handleEmailBlur} className="h-12 rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-primary" />
              <input name="phone" required placeholder="Phone" className="h-12 rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-primary sm:col-span-2" />
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#8B8880]">Shipping Address</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input name="address1" required placeholder="Address line 1" className="h-12 rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-primary sm:col-span-2" />
              <input name="address2" placeholder="Address line 2 (optional)" className="h-12 rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-primary sm:col-span-2" />
              <input name="city" required placeholder="City" className="h-12 rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-primary" />
              <input name="province" placeholder="State / Province (optional)" className="h-12 rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-primary" />
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
            {status === "loading" ? "Placing order..." : `Place Order — ${price(total)}`}
          </button>
        </form>

        <div className="h-fit rounded-2xl border border-black/10 p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#8B8880]">Order Summary</h2>
          <div className="mt-3 flex flex-col gap-2">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId ?? "base"}`} className="flex justify-between text-sm">
                <span className="text-[#4A4844]">
                  {item.name} <span className="text-[#8B8880]">×{item.quantity}</span>
                </span>
                <span className="font-bold text-[#16161A]">{formatCurrency(item.price * item.quantity, item.currency)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2 border-t border-black/10 pt-4">
            <div className="flex gap-2">
              <input
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyDiscount();
                  }
                }}
                placeholder="Discount code"
                className="h-10 min-w-0 flex-1 rounded-xl border border-black/10 px-3 text-sm uppercase outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={applyDiscount}
                disabled={discountStatus.kind === "loading" || !discountInput.trim()}
                className="h-10 rounded-xl border border-black/10 px-4 text-sm font-bold text-[#16161A] hover:bg-[#F6F5F3] disabled:opacity-50"
              >
                {discountStatus.kind === "loading" ? "..." : "Apply"}
              </button>
            </div>
            {discountStatus.kind === "error" && <p className="text-xs font-bold text-red-600">{discountStatus.message}</p>}

            {walletUsable && (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[#4A4844]">
                <input type="checkbox" checked={useWallet} onChange={(e) => setUseWallet(e.target.checked)} />
                Use wallet balance ({formatCurrency(wallet.balance, wallet.currency)})
              </label>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-1.5 border-t border-black/10 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-[#4A4844]">Subtotal</span>
              <span className="font-bold text-[#16161A]">{price(subtotal)}</span>
            </div>
            {discount && (
              <div className="flex justify-between">
                <span className="text-[#4A4844]">
                  Discount ({discount.code}){" "}
                  <button
                    type="button"
                    onClick={() => {
                      setDiscount(null);
                      setDiscountInput("");
                    }}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Remove
                  </button>
                </span>
                <span className="font-bold text-status">-{price(discountAmount)}</span>
              </div>
            )}
            {walletAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-[#4A4844]">Wallet</span>
                <span className="font-bold text-status">-{price(walletAmount)}</span>
              </div>
            )}
            <div className="mt-1 flex justify-between">
              <span className="font-bold text-[#16161A]">Total</span>
              <span className="text-base font-extrabold text-primary">{price(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
