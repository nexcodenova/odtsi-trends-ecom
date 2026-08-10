"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import type { Product, BundleOffer } from "@odtsi/exiuscart-client";
import { formatCurrency } from "@odtsi/utils";
import { addToCart } from "@/lib/cart";
import { useCurrency } from "@/hooks/use-currency";

interface BundleOfferSectionProps {
  product: Product;
  bundle: BundleOffer;
}

// Shows a preview price only — the trusted, final price (with the bundle
// discount actually applied) is calculated by ExiusCart at checkout, not
// here. Adding the bundle just adds each item at its normal price; the
// discount lands once ExiusCart recognizes the combination at checkout.
export function BundleOfferSection({ product, bundle }: BundleOfferSectionProps) {
  const { currency, rates } = useCurrency();
  const rate = rates?.[currency] ?? 1;
  const price = (amount: number) => formatCurrency(amount * rate, currency);

  const savings = bundle.regularTotal - bundle.bundlePrice;

  function handleAddBundle() {
    addToCart({ productId: product.id, slug: product.slug, name: product.name, price: product.price, imageUrl: product.imageUrl });
    for (const item of bundle.items) {
      addToCart({ productId: item.productId, slug: item.slug, name: item.name, price: item.price, imageUrl: item.imageUrl });
    }
  }

  const savingsPct = Math.round((savings / bundle.regularTotal) * 100);

  return (
    <div className="mt-5 rounded-2xl border border-black/10 p-5 shadow-[0_4px_16px_-10px_rgba(26,26,26,0.15)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-extrabold uppercase tracking-wide text-[#8B8880]">Bundle &amp; Save More</h2>
        <span className="rounded-full bg-status/10 px-3 py-1 text-[10px] font-extrabold text-status">
          Save {price(savings)} ({savingsPct}%)
        </span>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
        <div className="relative h-[50px] w-[68px] flex-shrink-0 overflow-hidden rounded-xl bg-[#F6F5F3]">
          {product.imageUrl ? <Image src={product.imageUrl} alt={product.name} fill className="object-cover" /> : null}
        </div>

        {bundle.items.map((item) => (
          <span key={item.productId} className="flex items-center gap-2.5">
            <Plus size={16} className="text-[#a3a19c]" />
            <span className="relative h-[50px] w-[68px] flex-shrink-0 overflow-hidden rounded-xl bg-[#F6F5F3]">
              {item.imageUrl ? <Image src={item.imageUrl} alt={item.name} fill className="object-cover" /> : null}
            </span>
          </span>
        ))}

        <div className="ml-auto text-right">
          <p className="text-sm text-[#a3a19c] line-through">{price(bundle.regularTotal)}</p>
          <p className="text-2xl font-extrabold text-[#16161A]">{price(bundle.bundlePrice)}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] text-[#8B8880]">
          Includes: {product.name}
          {bundle.items.map((item) => ` + ${item.name}`).join("")}
        </p>
        <button
          type="button"
          onClick={handleAddBundle}
          className="rounded-xl bg-gradient-to-br from-[#F6C935] to-[#C99200] px-5 py-2.5 text-sm font-extrabold text-[#16161A] transition hover:brightness-105"
        >
          Add Bundle to Cart
        </button>
      </div>
    </div>
  );
}
