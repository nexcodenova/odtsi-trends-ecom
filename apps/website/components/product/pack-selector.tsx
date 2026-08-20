"use client";

import { useState } from "react";
import { Space_Grotesk } from "next/font/google";
import { Check, Minus, Plus } from "lucide-react";
import type { Product } from "@odtsi/exiuscart-client";
import { addToCart } from "@/lib/cart";
import { notifyAdded } from "@/lib/notify";
import { formatCurrency, formatCurrencyParts } from "@odtsi/utils";

// A distinct display face for the pricing/titles here, separate from the
// site's body font (Plus Jakarta Sans) — geometric and punchy, so the
// numbers actually stand out instead of blending into the page.
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["600", "700"] });

// One consistent premium gold treatment for every badge, regardless of type.
const BADGE_STYLE = "bg-action text-action-ink";

// Big whole-dollar amount, small symbol/decimal, in the distinct display face.
function BigPrice({ amount }: { amount: number }) {
  const { symbol, whole, decimal } = formatCurrencyParts(amount, "USD");
  return (
    <span className={`${spaceGrotesk.className} text-[#16161A]`}>
      <span className="align-top text-sm">{symbol}</span>
      <span className="text-3xl leading-none">{whole}</span>
      <span className="align-top text-sm">{decimal}</span>
    </span>
  );
}

// Horizontal, centered pack cards — each with its own quantity stepper (how
// many of *that* bundle), separate from the plain "quick buy" quantity up
// in AddToCartSection. Only the selected card's bundle × its own stepper
// value is what Add to Cart here actually adds.
export function PackSelector({ product }: { product: Product }) {
  const price = (amount: number) => formatCurrency(amount, "USD");

  const defaultTierIndex = Math.max(0, product.quantityTiers.findIndex((t) => t.recommended));
  const [selectedTier, setSelectedTier] = useState(defaultTierIndex === -1 ? 0 : defaultTierIndex);
  const [multipliers, setMultipliers] = useState<number[]>(() => product.quantityTiers.map(() => 1));
  const [justAdded, setJustAdded] = useState(false);

  const maxQuantity = product.stockCount;

  function setMultiplier(i: number, next: number) {
    setMultipliers((prev) => prev.map((m, idx) => (idx === i ? Math.max(1, next) : m)));
  }

  function handleAdd() {
    const tier = product.quantityTiers[selectedTier];
    if (!tier) return;
    const multiplier = multipliers[selectedTier] ?? 1;
    const tierLabel = tier.label ?? "Pack of " + tier.quantity;
    const packName = product.name + " — " + tierLabel;
    // Cart stores a per-unit price so quantity × price still adds up
    // correctly on the cart page — the tier rate, not the base price.
    // step = tier.quantity so the cart's +/- buttons move by whole packs.
    // variantId keeps this tier as its own cart line — merging it with a
    // single-unit add (or a different tier) would silently mix prices.
    addToCart(
      {
        productId: product.id,
        slug: product.slug,
        name: packName,
        price: tier.price / tier.quantity,
        imageUrl: product.imageUrl,
        step: tier.quantity,
        variantId: `tier-${tier.quantity}`,
      },
      tier.quantity * multiplier,
    );
    notifyAdded({
      type: "cart",
      name: packName,
      imageUrl: product.imageUrl,
      price: tier.price * multiplier,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  // A grid hardcoded to 3 columns leaves a lone card stranded on the left
  // with two-thirds of the row as dead blank space when a product only has
  // 1 or 2 tiers — easy to mistake for "the pack isn't showing at all".
  // Size both the column count and the max width to the real tier count.
  const tierCount = product.quantityTiers.length;
  const gridColsClass = tierCount <= 1 ? "sm:grid-cols-1" : tierCount === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";
  const gridMaxWidthClass = tierCount <= 1 ? "max-w-sm" : tierCount === 2 ? "max-w-2xl" : "max-w-6xl";

  return (
    <div>
      <h2 className="text-center text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">
        Choose Your Pack
      </h2>

      <div className={`mx-auto mt-8 grid grid-cols-1 gap-4 ${gridMaxWidthClass} ${gridColsClass}`}>
        {product.quantityTiers.map((tier, i) => {
          const selected = i === selectedTier;
          const multiplier = multipliers[i] ?? 1;
          // How many bundles of this tier the real stock can actually cover.
          const bundleMax = maxQuantity != null ? Math.floor(maxQuantity / tier.quantity) : null;
          const unavailable = bundleMax != null && bundleMax < 1;
          const compareTotal = product.price * tier.quantity;
          const savings = compareTotal - tier.price;
          const savingsPct = savings > 0 ? Math.round((savings / compareTotal) * 100) : 0;

          return (
            <div
              key={tier.quantity}
              role="button"
              tabIndex={unavailable ? -1 : 0}
              aria-pressed={selected}
              onClick={() => !unavailable && setSelectedTier(i)}
              onKeyDown={(e) => {
                if (!unavailable && (e.key === "Enter" || e.key === " ")) setSelectedTier(i);
              }}
              className={`relative flex cursor-pointer flex-col gap-3 rounded-2xl px-5 py-4 text-left transition ${
                unavailable
                  ? "cursor-not-allowed bg-[#F6F5F3] opacity-40"
                  : selected
                    ? "bg-gradient-to-br from-[#FFFBEF] to-[#FCEFC7] shadow-[0_10px_26px_-12px_rgba(201,146,0,0.5)] ring-2 ring-action"
                    : "bg-white shadow-[0_2px_10px_-4px_rgba(22,22,26,0.12)] ring-1 ring-black/5 hover:shadow-[0_6px_18px_-6px_rgba(22,22,26,0.18)]"
              }`}
            >
              {tier.badge && (
                <span
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide shadow-sm ${BADGE_STYLE}`}
                >
                  {tier.badge}
                </span>
              )}

              {selected && (
                <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-action">
                  <Check size={13} className="text-[#16161A]" strokeWidth={3} />
                </span>
              )}

              <div className="flex items-center justify-between gap-3 pr-7">
                <p className="text-lg font-extrabold text-[#16161A]">{tier.label ?? `Buy ${tier.quantity}`}</p>
                <div className="flex items-baseline gap-2">
                  <BigPrice amount={tier.price * multiplier} />
                  {savings > 0 && (
                    <span className="text-xs text-[#a3a19c] line-through">{price(compareTotal * multiplier)}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-[#8B8880]">
                  Quantity: {tier.quantity}
                  {savings > 0 && (
                    <span className="ml-2 font-bold text-status">
                      Save {price(savings * multiplier)} ({savingsPct}%)
                    </span>
                  )}
                </p>

                <div onClick={(e) => e.stopPropagation()} className="flex items-center rounded-full bg-[#F6F5F3]">
                  <button
                    type="button"
                    onClick={() => setMultiplier(i, multiplier - 1)}
                    disabled={multiplier <= 1}
                    aria-label={`Decrease quantity of ${tier.label ?? "this pack"}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#716D67] transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-[#16161A]">{multiplier}</span>
                  <button
                    type="button"
                    onClick={() => setMultiplier(i, multiplier + 1)}
                    disabled={bundleMax != null && multiplier >= bundleMax}
                    aria-label={`Increase quantity of ${tier.label ?? "this pack"}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#716D67] transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mx-auto mt-8 max-w-md">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!product.inStock}
          className="h-[58px] w-full rounded-2xl bg-gradient-to-br from-[#F6C935] to-[#C99200] text-[16px] font-extrabold text-[#16161A] shadow-[0_10px_24px_-8px_rgba(201,146,0,0.55)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {!product.inStock ? "Out of Stock" : justAdded ? "Added to Cart" : "Add to Cart"}
        </button>
        <p className="mt-3 text-center text-[11px] text-[#8B8880]">3.5% back in your ODTSI Wallet on this order</p>
      </div>
    </div>
  );
}
