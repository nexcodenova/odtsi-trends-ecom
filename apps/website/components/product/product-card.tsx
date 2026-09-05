"use client";

import { useState, useEffect, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Check, Gift, Eye, Heart, ExternalLink } from "lucide-react";
import type { Product, QuantityTier } from "@odtsi/exiuscart-client";
import { Price } from "@/components/shared/price";
import { addToCart } from "@/lib/cart";
import { isInWishlist, toggleWishlist } from "@/lib/wishlist";
import { notifyAdded } from "@/lib/notify";
import { cheapestVariant, displayPrice } from "@/lib/product-price";

interface ProductCardProps {
  product: Product;
  // Smaller icon-only Add to Cart instead of the full-width labeled
  // button — used in the denser bottom-of-product-page carousels
  // (Most Loved by Customers, Most Viewed) so more cards fit per row
  // without the button dominating each card.
  compact?: boolean;
  // Bordered card + a red corner-flag discount badge instead of the
  // usual gold pill — used on the On Sale page to read as a deals
  // listing. Add to Cart stays the exact same button either way.
  sale?: boolean;
}

// Best real multi-buy saving on this product, if any tier is actually
// cheaper per-unit than buying single units at the base price.
function bestTierDeal(product: Product, price: number): { tier: QuantityTier; savings: number } | null {
  let best: { tier: QuantityTier; savings: number } | null = null;
  for (const tier of product.quantityTiers) {
    const savings = price * tier.quantity - tier.price;
    if (savings > 0 && (!best || savings > best.savings)) {
      best = { tier, savings };
    }
  }
  return best;
}

export function ProductCard({ product, compact, sale }: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false);
  // Starts false on the server (no localStorage there) and syncs on mount.
  const [saved, setSaved] = useState(false);
  // Affiliate products aren't sold by us — ExiusCart's checkout rejects
  // them with a 400 if they ever reach it, so the card can't offer Add to
  // Cart at all for these, only a real external link.
  const isAffiliate = product.productType === "affiliate";
  const variant = cheapestVariant(product);
  const price = displayPrice(product);
  const imageUrl = variant?.imageUrl || product.imageUrl;
  const hasDiscount = product.compareAtPrice !== null && product.compareAtPrice > price;
  const discountPct = hasDiscount ? Math.round((1 - price / product.compareAtPrice!) * 100) : 0;
  const deal = bestTierDeal(product, price);
  const secondImageUrl = product.images.find((url) => url !== product.imageUrl) ?? null;

  useEffect(() => {
    setSaved(isInWishlist(product.id));
  }, [product.id]);

  function handleAdd() {
    addToCart({ productId: product.id, slug: product.slug, name: product.name, price, currency: product.currency, imageUrl, variantId: variant?.sku });
    notifyAdded({ type: "cart", name: product.name, imageUrl, price, currency: product.currency });
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
      price,
      currency: product.currency,
      imageUrl,
    });
    setSaved(nowSaved);
    if (nowSaved) {
      notifyAdded({ type: "wishlist", name: product.name, imageUrl, price, currency: product.currency });
    }
  }

  // Small icon-only cart control, shared by both compact layouts below —
  // sits inline next to the stock line instead of pinned to the card's
  // bottom edge, so a compact card has no dead space under it.
  const compactCta = isAffiliate ? (
    <a
      href={product.affiliateUrl ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      aria-label={product.affiliateCtaText || "Buy Now"}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-[0_4px_12px_-6px_rgba(27,42,94,0.5)] transition hover:bg-primary-hover"
    >
      <ExternalLink size={14} />
    </a>
  ) : (
    <button
      type="button"
      onClick={handleAdd}
      disabled={!product.inStock}
      aria-label={justAdded ? "Added to cart" : "Add to cart"}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#F6C935] to-[#C99200] text-[#16161A] shadow-[0_4px_12px_-6px_rgba(201,146,0,0.55)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:from-[#e5e5e5] disabled:to-[#e5e5e5]"
    >
      {justAdded ? <Check size={14} /> : <ShoppingCart size={14} />}
    </button>
  );

  return (
    <div className="flex h-full flex-col rounded-2xl p-3">
      <Link
        href={`/product/${product.slug}`}
        className={`group relative block ${sale ? "rounded-xl border border-black/10 bg-white p-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]" : ""}`}
      >
        {/* Sale variant: a red corner flag sitting right at the card's own
            outer corner (pulled out by the card's padding with negative
            inset, not the image's corner) instead of the usual gold pill
            next to the price — reads as "this is a deals listing" at a
            glance. Same real discount number either way. animate-float is
            the same gentle drift already used elsewhere to draw the eye to
            a real discount, not a new effect just for this. */}
        {sale && hasDiscount && (
          <span className="animate-float absolute -left-2.5 -top-2.5 z-10 rounded-br-xl rounded-tl-xl bg-[#E0342A] py-1.5 pl-2.5 pr-3 text-xs font-extrabold text-white shadow-[0_4px_10px_-4px_rgba(224,52,42,0.6)]">
            -{discountPct}% OFF
          </span>
        )}

        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-white">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className={`object-contain transition duration-300 ${
                secondImageUrl ? "group-hover:opacity-0" : "group-hover:scale-105"
              }`}
            />
          ) : null}
          {secondImageUrl && (
            <Image
              src={secondImageUrl}
              alt={product.name}
              fill
              className="object-contain opacity-0 transition duration-300 group-hover:opacity-100"
            />
          )}
          {!product.inStock && !isAffiliate && (
            <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs font-bold text-[#716D67]">
              Out of stock
            </span>
          )}

          {isAffiliate && (
            <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
              Affiliate
            </span>
          )}

          {/* Compact cards move this down into the bottom row next to the
              cart icon instead — two floating overlays on a small image
              looked cluttered, and it reads better as part of the same
              action row as Add to Cart. */}
          {!compact && (
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
          )}
        </div>

        <p className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-[#16161A]">{product.name}</p>

        {/* Compact cards (bottom-of-product-page carousels) skip rating and
            view-count rows entirely — a genuinely minimal card, not just a
            smaller button — and put the stock line and cart icon on one
            row instead of pinning the button to the bottom with empty
            space under it. */}
        {/* Sale cards drop the rating text and the views row entirely —
            just the stars, then straight to stock — a shorter card on
            mobile where height matters more than these secondary details. */}
        {!compact && (
          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-[#8B8880]">
            <span className="tracking-[1px] text-action">
              {"★".repeat(Math.round(product.rating ?? 0))}
              <span className="text-[#D8D5CE]">{"★".repeat(5 - Math.round(product.rating ?? 0))}</span>
            </span>
            {!sale && (product.rating !== null ? `${product.rating.toFixed(1)} (${product.reviewCount ?? 0})` : "No reviews yet")}
          </div>
        )}

        {!compact && !sale && product.viewCount !== null && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-[#8B8880]">
            <Eye size={13} />
            {product.viewCount.toLocaleString()} views
          </div>
        )}

        {!isAffiliate && !compact && !sale && (
          <p className={`mt-1 text-sm font-bold ${product.inStock ? "text-status" : "text-[#B9412E]"}`}>
            {!product.inStock
              ? "Out of Stock"
              : product.stockCount !== null && product.stockCount <= 10
                ? "Limited Stock"
                : "In Stock"}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          {hasDiscount && (
            <Price amount={product.compareAtPrice!} currency={product.currency} className="text-sm text-[#a3a19c] line-through" />
          )}
          <Price amount={price} currency={product.currency} className="text-xl font-extrabold text-primary" />
          {hasDiscount && !sale && (
            <span className="rounded-full bg-action px-2.5 py-1 text-xs font-extrabold text-action-ink">
              -{discountPct}%
            </span>
          )}
        </div>

        {deal && !compact && (
          <p className="mt-1.5 flex items-center gap-1 text-xs font-bold text-status">
            <Gift size={14} />
            Buy {deal.tier.quantity}, save <Price amount={deal.savings} currency={product.currency} />
          </p>
        )}
      </Link>

      {compact ? (
        <div className="mt-2 flex items-center justify-between gap-2">
          {!isAffiliate ? (
            <p className={`text-xs font-bold ${product.inStock ? "text-status" : "text-[#B9412E]"}`}>
              {!product.inStock ? "Out of Stock" : "In Stock"}
            </p>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleWishlist}
              aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={saved}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition ${
                saved ? "border-action bg-[#FFFBEF] text-action" : "border-black/10 text-[#716D67] hover:border-black/20 hover:text-action"
              }`}
            >
              <Heart size={14} className={saved ? "fill-action" : ""} />
            </button>
            {compactCta}
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1" />
          {isAffiliate ? (
            <a
              href={product.affiliateUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-primary text-xs font-extrabold text-white shadow-[0_6px_16px_-6px_rgba(27,42,94,0.5)] transition hover:bg-primary-hover sm:h-12 sm:gap-2 sm:text-base"
            >
              <ExternalLink size={14} className="sm:hidden" />
              <ExternalLink size={18} className="hidden sm:block" />
              {product.affiliateCtaText || "Buy Now"}
            </a>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              disabled={!product.inStock}
              className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-[#F6C935] to-[#C99200] text-xs font-extrabold text-[#16161A] shadow-[0_6px_16px_-6px_rgba(201,146,0,0.55)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:from-[#e5e5e5] disabled:to-[#e5e5e5] sm:h-12 sm:gap-2 sm:text-base"
            >
              {justAdded ? (
                <>
                  <Check size={14} className="sm:hidden" />
                  <Check size={18} className="hidden sm:block" /> Added
                </>
              ) : (
                <>
                  <ShoppingCart size={14} className="sm:hidden" />
                  <ShoppingCart size={18} className="hidden sm:block" /> Add to Cart
                </>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}
