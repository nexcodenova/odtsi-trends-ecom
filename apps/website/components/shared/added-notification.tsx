"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Price } from "@/components/shared/price";
import { NOTIFY_EVENT, type AddedDetail } from "@/lib/notify";

// Mounted once, globally (in the root layout) — listens for real add
// events from anywhere (product cards, product page, wishlist page) and
// shows the actual item, actual cart count, and actual subtotal.
export function AddedNotification() {
  const [detail, setDetail] = useState<AddedDetail | null>(null);
  const { items, subtotal } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    function handle(e: Event) {
      setDetail((e as CustomEvent<AddedDetail>).detail);
    }
    window.addEventListener(NOTIFY_EVENT, handle);
    return () => window.removeEventListener(NOTIFY_EVENT, handle);
  }, []);

  useEffect(() => {
    if (!detail) return;
    const timer = setTimeout(() => setDetail(null), 5000);
    return () => clearTimeout(timer);
  }, [detail]);

  if (!detail) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4"
      onClick={() => setDetail(null)}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <p className="text-base font-extrabold text-[#16161A]">
            {detail.type === "cart" ? "Added to your cart" : "Added to your wishlist"}
          </p>
          <button
            type="button"
            onClick={() => setDetail(null)}
            aria-label="Close"
            className="text-[#8B8880] hover:text-[#16161A]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-primary-light">
            {detail.imageUrl && <Image src={detail.imageUrl} alt={detail.name} fill className="object-cover" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-semibold text-[#16161A]">{detail.name}</p>
            <Price amount={detail.price} currency={detail.currency} className="mt-1 block text-sm font-extrabold text-primary" />
          </div>
        </div>

        {detail.type === "cart" && (
          <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4 text-sm">
            <span className="text-[#716D67]">
              You have {cartCount} item{cartCount === 1 ? "" : "s"} in your cart
            </span>
            <Price amount={subtotal} currency={items[0]?.currency ?? detail.currency} className="font-extrabold text-[#16161A]" />
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => setDetail(null)}
            className="flex-1 rounded-xl border border-black/10 py-3 text-sm font-bold text-[#4A4844] transition hover:border-black/20"
          >
            Continue Shopping
          </button>
          <Link
            href={detail.type === "cart" ? "/cart" : "/wishlist"}
            onClick={() => setDetail(null)}
            className="flex-1 rounded-xl bg-primary py-3 text-center text-sm font-bold text-white transition hover:bg-primary-hover"
          >
            {detail.type === "cart" ? "View Cart" : "View Wishlist"}
          </Link>
        </div>
      </div>
    </div>
  );
}
