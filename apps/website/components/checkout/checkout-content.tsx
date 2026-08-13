"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@odtsi/utils";
import { createCheckout } from "@odtsi/exiuscart-client";
import { useCurrency } from "@/hooks/use-currency";

export function CheckoutContent() {
  const { items, subtotal } = useCart();
  const { currency, rates } = useCurrency();
  const rate = rates?.[currency] ?? 1;
  const price = (amount: number) => formatCurrency(amount * rate, currency);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = new FormData(e.currentTarget);

    try {
      await createCheckout({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        customer: {
          name: String(form.get("name")),
          email: String(form.get("email")),
          phone: String(form.get("phone")),
        },
        shippingAddress: {
          line1: String(form.get("address1")),
          line2: String(form.get("address2") ?? ""),
          city: String(form.get("city")),
          postcode: String(form.get("postcode")),
          country: String(form.get("country")),
        },
      });
      // TODO: once this succeeds for real, clear the cart and redirect to
      // /order/{orderNumber} using the returned order + take clientSecret
      // to Stripe Elements to actually collect payment.
    } catch {
      // ExiusCart's /checkout endpoint isn't live yet — honest state.
      setErrorMessage("Checkout isn't connected yet — orders can't be placed until that's live.");
      setStatus("error");
    }
  }

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

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#8B8880]">Contact</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input name="name" required placeholder="Full name" className="h-12 rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-primary" />
              <input name="email" type="email" required placeholder="Email" className="h-12 rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-primary" />
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
                <span className="font-bold text-[#16161A]">{price(item.price * item.quantity)}</span>
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
