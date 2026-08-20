"use client";

import { useState, useEffect, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Check, Gift, Eye, Heart } from "lucide-react";
import type { Product, QuantityTier } from "@odtsi/exiuscart-client";
import { Price } from "@/components/shared/price";
import { addToCart } from "@/lib/cart";
import { isInWishlist, toggleWishlist } from "@/lib/wishlist";
import { notifyAdded } from "@/lib/notify";

interface ProductCardProps {
  product: Product;
}

// Best real multi-buy saving on this product, if any tier is actually
// cheaper per-unit than buying single units at the base price.
function bestTierDeal(product: Product): { tier: QuantityTier; savings: number } | null {
  let best: { tier: QuantityTier; savings: number } | null = null;
  for (const tier of product.quantityTiers) {
    const savings = product.price * tier.quantity - tier.price;
    if (savings > 0 && (!best || savings > best.savings)) {
      best = { tier, savings };
    }
  }
  return best;
}

export function ProductCard({ product }: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false);
  // Starts false on the server (no localStorage there) and syncs on mount.
  const [saved, setSaved] = useState(false);
  const hasDiscount = product.compareAtPrice !== null && product.compareAtPrice > product.price;
  const discountPct = hasDiscount ? Math.round((1 - product.price / product.compareAtPrice!) * 100) : 0;
  const deal = bestTierDeal(product);
  const secondImageUrl = product.images.find((url) => url !== product.imageUrl) ?? null;

  useEffect(() => {
    setSaved(isInWishlist(product.id));
  }, [product.id]);

  function handleAdd() {
    addToCart({ productId: product.id, slug: product.slug, name: product.name, price: product.price, currency: product.currency, imageUrl: product.imageUrl });
    notifyAdded({ type: "cart", name: product.name, imageUrl: product.imageUrl, price: product.price, currency: product.currency });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  function handleWishlist(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
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

  return (
    <div className="flex h-full flex-col rounded-2xl p-3">
      <Link href={`/product/${product.slug}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-primary-light">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className={`object-cover transition duration-300 ${
                secondImageUrl ? "group-hover:opacity-0" : "group-hover:scale-105"
              }`}
            />
          ) : null}
          {secondImageUrl && (
            <Image
              src={secondImageUrl}
              alt={product.name}
              fill
              className="object-cover opacity-0 transition duration-300 group-hover:opacity-100"
            />
          )}
          {!product.inStock && (
            <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs font-bold text-[#716D67]">
              Out of stock
            </span>
          )}

          <button
            type="button"
            onClick={handleWishlist}
            aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={saved}
            className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition ${
              saved ? "bg-white text-action" : "bg-white/90 text-[#716D67] hover:text-action"
            }`}
          >
            <Heart size={16} className={saved ? "fill-action" : ""} />
          </button>
        </div>

        <p className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-[#16161A]">{product.name}</p>

        <div className="mt-1.5 flex items-center gap-1.5 text-sm text-[#8B8880]">
          <span className="tracking-[1px] text-action">
            {"★".repeat(Math.round(product.rating ?? 0))}
            <span className="text-[#D8D5CE]">{"★".repeat(5 - Math.round(product.rating ?? 0))}</span>
          </span>
          {product.rating !== null ? `${product.rating.toFixed(1)} (${product.reviewCount ?? 0})` : "No reviews yet"}
        </div>

        {product.viewCount !== null && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-[#8B8880]">
            <Eye size={13} />
            {product.viewCount.toLocaleString()} views
          </div>
        )}

        <p className={`mt-1 text-sm font-bold ${product.inStock ? "text-status" : "text-[#B9412E]"}`}>
          {!product.inStock
            ? "Out of Stock"
            : product.stockCount !== null && product.stockCount <= 10
              ? "Limited Stock"
              : "In Stock"}
        </p>

        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          {hasDiscount && (
            <Price amount={product.compareAtPrice!} currency={product.currency} className="text-sm text-[#a3a19c] line-through" />
          )}
          <Price amount={product.price} currency={product.currency} className="text-xl font-extrabold text-primary" />
          {hasDiscount && (
            <span className="rounded-full bg-action px-2.5 py-1 text-xs font-extrabold text-action-ink">
              -{discountPct}%
            </span>
          )}
        </div>

        {deal && (
          <p className="mt-1.5 flex items-center gap-1 text-xs font-bold text-status">
            <Gift size={14} />
            Buy {deal.tier.quantity}, save <Price amount={deal.savings} currency={product.currency} />
          </p>
        )}
      </Link>

      <div className="flex-1" />

      <button
        type="button"
        onClick={handleAdd}
        disabled={!product.inStock}
        className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#F6C935] to-[#C99200] text-base font-extrabold text-[#16161A] shadow-[0_6px_16px_-6px_rgba(201,146,0,0.55)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:from-[#e5e5e5] disabled:to-[#e5e5e5]"
      >
        {justAdded ? (
          <>
            <Check size={18} /> Added
          </>
        ) : (
          <>
            <ShoppingCart size={18} /> Add to Cart
          </>
        )}
      </button>
    </div>
  );
}
