"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, X, ShoppingCart } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { removeFromWishlist } from "@/lib/wishlist";
import { addToCart } from "@/lib/cart";
import { notifyAdded } from "@/lib/notify";
import { formatCurrency } from "@odtsi/utils";

export function WishlistContent() {
  const { items } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-16 text-center sm:py-24">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
          <Heart size={28} />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-[#16161A] sm:text-3xl">Your wishlist is empty</h1>
        <p className="mt-2 text-sm text-[#716D67]">Tap the heart on any product to save it here.</p>
        <Link
          href="/"
          className="mt-6 rounded-xl bg-action px-6 py-3 text-sm font-bold text-action-ink transition hover:brightness-95"
        >
          Start Browsing
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-5">
      <h1 className="text-2xl font-extrabold text-[#16161A] sm:text-3xl">Your Wishlist</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {items.map((item) => (
          <div key={item.productId} className="relative rounded-2xl border border-black/10 p-3">
            <button
              type="button"
              onClick={() => removeFromWishlist(item.productId)}
              aria-label="Remove from wishlist"
              className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#8B8880] shadow-sm hover:text-red-600"
            >
              <X size={14} />
            </button>

            <Link href={`/product/${item.slug}`} className="block">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-primary-light">
                {item.imageUrl ? <Image src={item.imageUrl} alt={item.name} fill className="object-cover" /> : null}
              </div>
              <p className="mt-3 line-clamp-2 text-sm font-semibold text-[#16161A]">{item.name}</p>
              <p className="mt-1 text-sm font-extrabold text-primary">{formatCurrency(item.price, item.currency)}</p>
            </Link>

            <button
              type="button"
              onClick={() => {
                addToCart({ productId: item.productId, slug: item.slug, name: item.name, price: item.price, currency: item.currency, imageUrl: item.imageUrl });
                notifyAdded({ type: "cart", name: item.name, imageUrl: item.imageUrl, price: item.price, currency: item.currency });
              }}
              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#F6C935] to-[#C99200] text-xs font-extrabold text-[#16161A] transition hover:brightness-105"
            >
              <ShoppingCart size={14} />
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
