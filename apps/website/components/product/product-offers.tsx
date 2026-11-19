"use client";

import Image from "next/image";
import { Check, Gift, Package, Plus, Tag } from "lucide-react";
import type { OfferGetProduct, ProductKit, ProductOffer } from "@odtsi/exiuscart-client";
import { formatCurrency } from "@odtsi/utils";

// Seller offers on the product page. Units are added to the cart at full
// price — ExiusCart's checkout applies the offer itself, so nothing here
// is the trusted price, only a preview of the same rule.

// Best saving the offers give on `quantity` units at `unitPrice`.
// Quantity counts across variants on ExiusCart's side, so this is a floor.
export function offerSaving(offers: ProductOffer[], unitPrice: number, quantity: number): number {
  let best = 0;
  for (const offer of offers) {
    if (offer.kind === "quantity_breaks") {
      const tier = [...offer.tiers].reverse().find((t) => quantity >= t.qty);
      if (tier) best = Math.max(best, (quantity * unitPrice * tier.percent) / 100);
    } else if (offer.kind === "bxgy" && offer.same) {
      const groups = Math.floor(quantity / (offer.buyQty + offer.getQty));
      best = Math.max(best, (groups * offer.getQty * unitPrice * offer.getPercent) / 100);
    }
  }
  return Math.round(best * 100) / 100;
}

function rewardLabel(getQty: number, percent: number) {
  return percent >= 100 ? `${getQty} free` : `${getQty} at ${percent}% off`;
}

export function ProductOffers({
  offers,
  unitPrice,
  currency,
  quantity,
  maxQuantity,
  onSetQuantity,
  onAddGetProduct,
}: {
  offers: ProductOffer[];
  unitPrice: number;
  currency: string;
  quantity: number;
  maxQuantity: number | null;
  onSetQuantity: (quantity: number) => void;
  onAddGetProduct: (product: OfferGetProduct, quantity: number) => void;
}) {
  if (offers.length === 0) return null;
  const price = (amount: number) => formatCurrency(amount, currency);
  const fits = (qty: number) => maxQuantity == null || qty <= maxQuantity;

  return (
    <div className="mt-5 flex flex-col gap-3">
      {offers.map((offer) => {
        if (offer.kind === "quantity_breaks") {
          const activeQty = [...offer.tiers].reverse().find((t) => quantity >= t.qty)?.qty;
          return (
            <div key={offer.id}>
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#8B8880]">
                <Tag size={13} className="text-status" />
                {offer.title || "Buy more, save more"}
              </p>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {offer.tiers.map((tier) => {
                  const full = unitPrice * tier.qty;
                  const selected = activeQty === tier.qty;
                  const available = fits(tier.qty);
                  return (
                    <button
                      key={tier.qty}
                      type="button"
                      disabled={!available}
                      onClick={() => onSetQuantity(tier.qty)}
                      aria-pressed={selected}
                      className={`relative flex items-center justify-between gap-3 rounded-xl border-2 px-3.5 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
                        selected ? "border-action bg-[#FFFBEF]" : "border-black/10 hover:border-black/20"
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-extrabold text-[#16161A]">Buy {tier.qty}</span>
                        <span className="text-xs font-bold text-status">Save {tier.percent}%</span>
                      </span>
                      <span className="text-right">
                        <span className="block text-sm font-extrabold text-[#16161A]">
                          {price(full * (1 - tier.percent / 100))}
                        </span>
                        <span className="text-xs text-[#a3a19c] line-through">{price(full)}</span>
                      </span>
                      {selected && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-action">
                          <Check size={11} strokeWidth={3} className="text-[#16161A]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }

        if (offer.kind === "bxgy" && offer.same) {
          const groupQty = offer.buyQty + offer.getQty;
          const selected = quantity >= groupQty;
          return (
            <button
              key={offer.id}
              type="button"
              disabled={!fits(groupQty)}
              onClick={() => onSetQuantity(Math.max(groupQty, Math.ceil(quantity / groupQty) * groupQty))}
              aria-pressed={selected}
              className={`flex items-center gap-3 rounded-xl border-2 px-3.5 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
                selected ? "border-action bg-[#FFFBEF]" : "border-dashed border-action/60 hover:bg-[#FFFBEF]"
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-action/15 text-[#8A6400]">
                <Gift size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold text-[#16161A]">
                  {offer.title || `Buy ${offer.buyQty}, get ${rewardLabel(offer.getQty, offer.getPercent)}`}
                </span>
                <span className="text-xs text-[#716D67]">
                  {selected
                    ? "Applied at checkout"
                    : `Tap to set quantity to ${groupQty} — you pay for ${offer.buyQty}${offer.getPercent < 100 ? " + the discount" : ""}`}
                </span>
              </span>
              {selected && <Check size={18} className="shrink-0 text-status" />}
            </button>
          );
        }

        if (offer.kind === "bxgy") {
          return (
            <div key={offer.id} className="rounded-xl border-2 border-dashed border-action/60 px-3.5 py-3">
              <p className="flex items-center gap-1.5 text-sm font-extrabold text-[#16161A]">
                <Gift size={16} className="text-[#8A6400]" />
                {offer.title || `Buy ${offer.buyQty}, get ${rewardLabel(offer.getQty, offer.getPercent)}`}
              </p>
              {offer.get.length > 0 && (
                <div className="mt-2.5 flex flex-col gap-2">
                  {offer.get.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-primary-light">
                        {item.imageUrl && <Image src={item.imageUrl} alt={item.title} fill sizes="48px" className="object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-[13px] font-semibold text-[#16161A]">{item.title}</p>
                        {item.price !== null && (
                          <p className="text-xs">
                            <span className="font-bold text-status">
                              {offer.getPercent >= 100 ? "Free" : price(item.price * (1 - offer.getPercent / 100))}
                            </span>{" "}
                            <span className="text-[#a3a19c] line-through">{price(item.price)}</span>
                          </p>
                        )}
                      </div>
                      {item.price !== null && (
                        <button
                          type="button"
                          onClick={() => onAddGetProduct(item, offer.getQty)}
                          className="flex h-9 shrink-0 items-center gap-1 rounded-lg border border-black/10 px-3 text-xs font-bold text-[#16161A] hover:bg-[#F6F5F3]"
                        >
                          <Plus size={13} /> Add
                        </button>
                      )}
                    </div>
                  ))}
                  <p className="text-[11px] text-[#8B8880]">
                    Discount applies at checkout when you also buy {offer.buyQty} of this item.
                  </p>
                </div>
              )}
            </div>
          );
        }

        return (
          <p
            key={offer.id}
            className="flex items-center gap-2 rounded-xl bg-[#FFFBEF] px-3.5 py-2.5 text-sm font-bold text-[#6B4E00] ring-1 ring-action/30"
          >
            <Gift size={16} className="shrink-0 text-action" />
            {offer.title}
          </p>
        );
      })}
    </div>
  );
}

// Bundle parts, with an option picker for each part that has a choice.
export function KitPicker({
  kit,
  currency,
  picks,
  onPick,
}: {
  kit: ProductKit;
  currency: string;
  picks: Record<string, string>;
  onPick: (partProductId: string, variantId: string) => void;
}) {
  const price = (amount: number) => formatCurrency(amount, currency);
  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#8B8880]">
          <Package size={13} className="text-status" />
          In this bundle
        </p>
        {kit.saving > 0 && (
          <span className="rounded-full bg-status/10 px-2.5 py-1 text-[11px] font-extrabold text-status">
            Save {price(kit.saving)} vs {price(kit.partsValue)} separately
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-col divide-y divide-black/5 rounded-xl border border-black/10">
        {kit.parts.map((part) => (
          <div key={part.productId} className="flex gap-3 p-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-primary-light">
              {part.imageUrl && <Image src={part.imageUrl} alt={part.name} fill sizes="56px" className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-semibold leading-snug text-[#16161A]">
                {part.quantity > 1 && <span className="text-[#8B8880]">{part.quantity}× </span>}
                {part.name}
              </p>
              {part.options.length > 1 && (
                <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Choose ${part.name}`}>
                  {part.options.map((option) => {
                    const selected = picks[part.productId] === option.variantId;
                    const soldOut = option.stockCount !== null && option.stockCount < part.quantity;
                    return (
                      <button
                        key={option.variantId}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        disabled={soldOut}
                        onClick={() => onPick(part.productId, option.variantId)}
                        className={`flex h-8 items-center gap-1.5 rounded-lg border-2 px-2.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-30 ${
                          selected ? "border-action bg-[#FFFBEF] text-[#16161A]" : "border-black/10 text-[#4A4844] hover:border-black/20"
                        }`}
                      >
                        {option.colorHex && (
                          <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ backgroundColor: option.colorHex }} />
                        )}
                        {option.title}
                      </button>
                    );
                  })}
                </div>
              )}
              {part.options.length === 1 && <p className="mt-0.5 text-xs text-[#8B8880]">{part.options[0]?.title}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
