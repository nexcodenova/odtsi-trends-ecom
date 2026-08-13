"use client";

import { useState } from "react";
import { Minus, Plus, Check } from "lucide-react";
import type { Product } from "@odtsi/exiuscart-client";
import { addToCart } from "@/lib/cart";
import { notifyAdded } from "@/lib/notify";
import { WishlistButton } from "@/components/product/wishlist-button";

// Plain quantity + Add to Cart — the "quick buy" path. Pack/bundle deals
// live in their own PackSelector section further down the page now.
export function AddToCartSection({ product }: { product: Product }) {
  const maxQuantity = product.stockCount;
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    addToCart(
      { productId: product.id, slug: product.slug, name: product.name, price: product.price, imageUrl: product.imageUrl },
      quantity,
    );
    notifyAdded({ type: "cart", name: product.name, imageUrl: product.imageUrl, price: product.price });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  return (
    <div className="mt-5">
      <div className="flex w-fit items-center rounded-xl border border-black/10">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          aria-label="Decrease quantity"
          className="flex h-12 w-11 items-center justify-center text-[#716D67] hover:text-primary"
        >
          <Minus size={16} />
        </button>
        <span className="w-8 text-center text-sm font-bold text-[#16161A]">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((q) => (maxQuantity != null ? Math.min(maxQuantity, q + 1) : q + 1))}
          disabled={maxQuantity != null && quantity >= maxQuantity}
          aria-label="Increase quantity"
          className="flex h-12 w-11 items-center justify-center text-[#716D67] hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!product.inStock}
          className="h-[58px] flex-1 rounded-2xl bg-gradient-to-br from-[#F6C935] to-[#C99200] text-[16px] font-extrabold text-[#16161A] shadow-[0_10px_24px_-8px_rgba(201,146,0,0.55)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {!product.inStock ? "Out of Stock" : justAdded ? "Added to Cart" : "Add to Cart"}
        </button>
        <WishlistButton product={product} />
      </div>

      <p className="mt-3 text-center text-[11px] text-[#8B8880]">3.5% back in your ODTSI Wallet on this order</p>
    </div>
  );
}
