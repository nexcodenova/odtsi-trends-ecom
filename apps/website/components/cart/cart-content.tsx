"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, X, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { updateQuantity, removeFromCart } from "@/lib/cart";
import { formatCurrency } from "@odtsi/utils";

export function CartContent() {
  const { items, subtotal } = useCart();
  const price = (amount: number) => formatCurrency(amount, "USD");

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-16 text-center sm:py-24">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
          <ShoppingCart size={28} />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-[#16161A] sm:text-3xl">Your cart is empty</h1>
        <p className="mt-2 text-sm text-[#716D67]">Find something trending and it'll show up here.</p>
        <Link
          href="/"
          className="mt-6 rounded-xl bg-action px-6 py-3 text-sm font-bold text-action-ink transition hover:brightness-95"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-5">
      <h1 className="text-2xl font-extrabold text-[#16161A] sm:text-3xl">Your Cart</h1>

      <div className="mt-6 flex flex-col gap-4">
        {items.map((item) => (
          <div
            key={`${item.productId}-${item.variantId ?? "base"}`}
            className="flex items-center gap-4 rounded-2xl border border-black/10 p-4"
          >
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-primary-light">
              {item.imageUrl ? <Image src={item.imageUrl} alt={item.name} fill className="object-cover" /> : null}
            </div>

            <div className="min-w-0 flex-1">
              <Link href={`/product/${item.slug}`} className="line-clamp-2 text-sm font-semibold text-[#16161A] hover:text-primary">
                {item.name}
              </Link>
              <p className="mt-1 text-sm font-extrabold text-primary">{price(item.price)}</p>
              {item.step && item.step > 1 && <p className="mt-0.5 text-xs text-[#8B8880]">Pack of {item.step}</p>}
            </div>

            <div className="flex items-center rounded-xl border border-black/10">
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.quantity - (item.step ?? 1), item.variantId)}
                aria-label={item.step && item.step > 1 ? `Remove one pack of ${item.step}` : "Decrease quantity"}
                className="flex h-10 w-9 items-center justify-center text-[#716D67] hover:text-primary"
              >
                <Minus size={14} />
              </button>
              <span className="w-7 text-center text-sm font-bold text-[#16161A]">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.quantity + (item.step ?? 1), item.variantId)}
                aria-label={item.step && item.step > 1 ? `Add one more pack of ${item.step}` : "Increase quantity"}
                className="flex h-10 w-9 items-center justify-center text-[#716D67] hover:text-primary"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => removeFromCart(item.productId, item.variantId)}
              aria-label="Remove item"
              className="text-[#8B8880] hover:text-red-600"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-6">
        <span className="text-base font-bold text-[#16161A]">Subtotal</span>
        <span className="text-xl font-extrabold text-primary">{price(subtotal)}</span>
      </div>

      <Link
        href="/checkout"
        className="mt-4 block w-full rounded-xl bg-action py-3.5 text-center text-sm font-bold text-action-ink transition hover:brightness-95"
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}
