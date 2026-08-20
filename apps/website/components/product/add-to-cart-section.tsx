"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, Check } from "lucide-react";
import type { Product, ProductVariant } from "@odtsi/exiuscart-client";
import { addToCart } from "@/lib/cart";
import { notifyAdded, notifyVariantImage } from "@/lib/notify";
import { WishlistButton } from "@/components/product/wishlist-button";
import { Price } from "@/components/shared/price";

function firstInStockVariant(variants: ProductVariant[]): ProductVariant | null {
  return variants.find((v) => v.inStock) ?? variants[0] ?? null;
}

// Price, stock, color/size picker, quantity, and Add to Cart all live here
// together — once a variant is selected, the price and stock shown above
// need to follow it, and those can't stay static JSX in the server-rendered
// page anymore.
export function AddToCartSection({ product }: { product: Product }) {
  const hasVariants = product.variants.length > 0;
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(() =>
    hasVariants ? firstInStockVariant(product.variants) : null,
  );
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const colors = useMemo(() => {
    const seen = new Map<string, ProductVariant>();
    for (const v of product.variants) {
      if (v.color && !seen.has(v.color)) seen.set(v.color, v);
    }
    return [...seen.values()];
  }, [product.variants]);

  const sizesForSelectedColor = useMemo(() => {
    const pool = selectedVariant?.color
      ? product.variants.filter((v) => v.color === selectedVariant.color)
      : product.variants;
    return pool.filter((v) => v.size);
  }, [product.variants, selectedVariant]);

  function selectVariant(next: ProductVariant) {
    setSelectedVariant(next);
    notifyVariantImage({ imageUrl: next.imageUrl });
  }

  function selectColor(color: string) {
    // Keep the current size if this color still offers it, otherwise fall
    // back to that color's first available option.
    const sameSize = product.variants.find((v) => v.color === color && v.size === selectedVariant?.size);
    const next = sameSize ?? product.variants.find((v) => v.color === color);
    if (next) selectVariant(next);
  }

  function selectSize(size: string) {
    const next =
      product.variants.find((v) => v.color === selectedVariant?.color && v.size === size) ??
      product.variants.find((v) => v.size === size);
    if (next) selectVariant(next);
  }

  const currentPrice = selectedVariant?.price ?? product.price;
  const inStock = selectedVariant ? selectedVariant.inStock : product.inStock;
  const maxQuantity = selectedVariant ? selectedVariant.stockCount : product.stockCount;
  const hasDiscount = product.compareAtPrice !== null && product.compareAtPrice > currentPrice;
  const savings = hasDiscount ? product.compareAtPrice! - currentPrice : 0;

  function handleAdd() {
    const variantLabel = selectedVariant
      ? [selectedVariant.color, selectedVariant.size].filter(Boolean).join(" / ")
      : null;
    const name = variantLabel ? `${product.name} — ${variantLabel}` : product.name;
    const imageUrl = selectedVariant?.imageUrl || product.imageUrl;

    addToCart(
      {
        productId: product.id,
        slug: product.slug,
        name,
        price: currentPrice,
        currency: product.currency,
        imageUrl,
        variantId: selectedVariant?.sku,
      },
      quantity,
    );
    notifyAdded({ type: "cart", name, imageUrl, price: currentPrice * quantity, currency: product.currency });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        {hasDiscount && (
          <Price amount={product.compareAtPrice!} currency={product.currency} className="text-base text-[#a3a19c] line-through" />
        )}
        <Price amount={currentPrice} currency={product.currency} className="text-[30px] font-extrabold text-[#16161A]" />
        {hasDiscount && (
          <span className="animate-float rounded-full bg-action px-3 py-1 text-xs font-extrabold text-action-ink shadow-[0_4px_12px_-4px_rgba(242,183,5,0.6)]">
            Save <Price amount={savings} currency={product.currency} />
          </span>
        )}
      </div>

      <p className="mt-2 text-sm font-bold text-status">
        {inStock ? "In Stock — Order Now Before It's Gone" : "Out of Stock"}
      </p>

      {hasVariants && (
        <div className="mt-5 flex flex-col gap-4">
          {colors.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#8B8880]">
                Color: <span className="normal-case text-[#16161A]">{selectedVariant?.color}</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {colors.map((v) => (
                  <button
                    key={v.color}
                    type="button"
                    onClick={() => selectColor(v.color!)}
                    aria-pressed={selectedVariant?.color === v.color}
                    className={`flex h-10 items-center gap-2 rounded-xl border-2 px-3 text-xs font-bold transition ${
                      selectedVariant?.color === v.color
                        ? "border-action bg-[#FFFBEF] text-[#16161A]"
                        : "border-black/10 text-[#4A4844] hover:border-black/20"
                    }`}
                  >
                    {v.colorHex && (
                      <span
                        className="h-4 w-4 flex-shrink-0 rounded-full border border-black/10"
                        style={{ backgroundColor: v.colorHex }}
                      />
                    )}
                    {v.color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sizesForSelectedColor.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#8B8880]">Size</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {sizesForSelectedColor.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    disabled={!v.inStock}
                    onClick={() => selectSize(v.size!)}
                    aria-pressed={selectedVariant?.size === v.size}
                    className={`h-10 min-w-[44px] rounded-xl border-2 px-3 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-30 ${
                      selectedVariant?.size === v.size
                        ? "border-action bg-[#FFFBEF] text-[#16161A]"
                        : "border-black/10 text-[#4A4844] hover:border-black/20"
                    }`}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-5 flex w-fit items-center rounded-xl border border-black/10">
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
          disabled={!inStock || (hasVariants && !selectedVariant)}
          className="h-[58px] flex-1 rounded-2xl bg-gradient-to-br from-[#F6C935] to-[#C99200] text-[16px] font-extrabold text-[#16161A] shadow-[0_10px_24px_-8px_rgba(201,146,0,0.55)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {!inStock ? "Out of Stock" : justAdded ? "Added to Cart" : "Add to Cart"}
        </button>
        <WishlistButton product={product} />
      </div>

      <p className="mt-3 text-center text-[11px] text-[#8B8880]">3.5% back in your ODTSI Wallet on this order</p>
    </div>
  );
}
