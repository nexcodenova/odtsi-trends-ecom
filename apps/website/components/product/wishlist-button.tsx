"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import type { Product } from "@odtsi/exiuscart-client";
import { isInWishlist, toggleWishlist } from "@/lib/wishlist";
import { notifyAdded } from "@/lib/notify";

interface Props {
  product: Product;
  // "inline" sits beside Add to Cart (58px square, the original spot).
  // "corner" is the small circular version meant to overlay the gallery
  // image's top-right corner, same treatment ProductCard already uses in
  // every grid — used for digital pages so Add to Cart can go full width.
  variant?: "inline" | "corner";
}

export function WishlistButton({ product, variant = "inline" }: Props) {
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
      currency: product.currency,
      imageUrl: product.imageUrl,
    });
    setSaved(nowSaved);
    if (nowSaved) {
      notifyAdded({ type: "wishlist", name: product.name, imageUrl: product.imageUrl, price: product.price, currency: product.currency });
    }
  }

  if (variant === "corner") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={saved}
        className={`flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition ${
          saved ? "bg-white text-action" : "bg-white/90 text-[#716D67] hover:text-action"
        }`}
      >
        <Heart size={17} className={saved ? "fill-action" : ""} />
      </button>
    );
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
