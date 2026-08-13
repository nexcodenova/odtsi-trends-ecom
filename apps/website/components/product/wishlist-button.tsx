"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import type { Product } from "@odtsi/exiuscart-client";
import { isInWishlist, toggleWishlist } from "@/lib/wishlist";
import { notifyAdded } from "@/lib/notify";

export function WishlistButton({ product }: { product: Product }) {
  // Starts false on the server (no localStorage there) and syncs on mount —
  // avoids a hydration mismatch between server and client render.
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isInWishlist(product.id));
  }, [product.id]);

  function handleClick() {
    const nowSaved = toggleWishlist({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    setSaved(nowSaved);
    if (nowSaved) {
      notifyAdded({ type: "wishlist", name: product.name, imageUrl: product.imageUrl, price: product.price });
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={saved}
      className={`flex h-[58px] w-[58px] flex-shrink-0 items-center justify-center rounded-2xl border-2 transition ${
        saved ? "border-action bg-[#FFFBEF] text-action" : "border-black/10 text-[#716D67] hover:border-black/20"
      }`}
    >
      <Heart size={22} className={saved ? "fill-action" : ""} />
    </button>
  );
}
