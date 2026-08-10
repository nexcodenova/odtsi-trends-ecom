"use client";

import { useState } from "react";
import { Minus, Plus, Check } from "lucide-react";
import type { Product } from "@odtsi/exiuscart-client";
import { addToCart } from "@/lib/cart";
import { formatCurrency } from "@odtsi/utils";
import { useCurrency } from "@/hooks/use-currency";

// One consistent premium gold treatment for every badge — regardless of
// badgeType — instead of a different color per type, which read as
// mismatched rather than premium.
const BADGE_STYLE = "bg-action text-action-ink";

export function AddToCartSection({ product }: { product: Product }) {
  const { currency, rates } = useCurrency();
  const rate = rates?.[currency] ?? 1;
  const price = (amount: number) => formatCurrency(amount * rate, currency);

  const hasTiers = product.quantityTiers.length > 0;
  const defaultTierIndex = Math.max(0, product.quantityTiers.findIndex((t) => t.recommended));
  // Never let a customer select more units than ExiusCart actually has —
  // the real count still drives this, it's just not printed on the page.
  const maxQuantity = product.stockCount;

  const [quantity, setQuantity] = useState(1);
  const [selectedTier, setSelectedTier] = useState(defaultTierIndex === -1 ? 0 : defaultTierIndex);
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    if (hasTiers) {
      const tier = product.quantityTiers[selectedTier];
      // Cart stores a per-unit price so quantity × price still adds up
      // correctly on the cart page — the tier rate, not the base price.
      addToCart(
        { productId: product.id, slug: product.slug, name: product.name, price: tier.price / tier.quantity, imageUrl: product.imageUrl },
        tier.quantity,
      );
    } else {
      addToCart(
        { productId: product.id, slug: product.slug, name: product.name, price: product.price, imageUrl: product.imageUrl },
        quantity,
      );
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  return (
    <div className="mt-5">
      {hasTiers ? (
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#8B8880]">Choose Your Pack</p>
          <div className="mt-2.5 flex flex-col gap-4 pt-2">
            {product.quantityTiers.map((tier, i) => {
              const selected = i === selectedTier;
              const unavailable = maxQuantity != null && tier.quantity > maxQuantity;
              // Real numbers only: what buying this many would cost at the
              // base per-unit price, vs. what the tier actually charges.
              const compareTotal = product.price * tier.quantity;
              const savings = compareTotal - tier.price;
              const savingsPct = savings > 0 ? Math.round((savings / compareTotal) * 100) : 0;
              return (
                <button
                  key={tier.quantity}
                  type="button"
                  onClick={() => setSelectedTier(i)}
                  disabled={unavailable}
                  className={`relative flex items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    selected
                      ? "border-action bg-gradient-to-br from-[#FFFBEF] to-[#FCEFC7] shadow-[0_10px_26px_-12px_rgba(201,146,0,0.5)]"
                      : "border-black/10 bg-white hover:border-black/20"
                  }`}
                >
                  {tier.badge && (
                    <span
                      className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide shadow-sm ${BADGE_STYLE}`}
                    >
                      {tier.badge}
                    </span>
                  )}

                  <span
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
                      selected ? "border-action bg-action" : "border-black/15"
                    }`}
                  >
                    {selected && <Check size={13} className="text-[#16161A]" strokeWidth={3} />}
                  </span>

                  <div className="flex-1">
                    <p className="text-[15px] font-extrabold text-[#16161A]">{tier.label ?? `Buy ${tier.quantity}`}</p>
                    <p className="mt-1 text-[11px] text-[#8B8880]">Quantity: {tier.quantity}</p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-[#16161A]">{price(tier.price)}</span>
                      {savings > 0 && (
                        <span className="text-xs text-[#a3a19c] line-through">{price(compareTotal)}</span>
                      )}
                    </div>
                    {savings > 0 && (
                      <p className="mt-0.5 text-[11px] font-bold text-status">
                        Save {price(savings)} ({savingsPct}%)
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
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
      )}

      <button
        type="button"
        onClick={handleAdd}
        disabled={!product.inStock}
        className="mt-5 h-[58px] w-full rounded-2xl bg-gradient-to-br from-[#F6C935] to-[#C99200] text-[16px] font-extrabold text-[#16161A] shadow-[0_10px_24px_-8px_rgba(201,146,0,0.55)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
      >
        {!product.inStock ? "Out of Stock" : justAdded ? "Added to Cart" : "Add to Cart"}
      </button>

      <p className="mt-3 text-center text-[11px] text-[#8B8880]">3.5% back in your ODTSI Wallet on this order</p>
    </div>
  );
}
