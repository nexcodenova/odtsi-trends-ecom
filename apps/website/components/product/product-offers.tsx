"use client";

import Image from "next/image";
import { Check, Gift, Layers, Package, Plus, Tag } from "lucide-react";
import type { OfferGetProduct, OfferStyle, Product, ProductKit, ProductOffer, ProductVariant } from "@odtsi/exiuscart-client";
import { cheapestVariant, displayPrice } from "@/lib/product-price";
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

// One way to buy this item: a quantity and what it costs then.
interface Deal {
  qty: number;
  title: string;
  note: string;
  total: number;
  full: number;
}

type QuantityOffer = Extract<ProductOffer, { kind: "quantity_breaks" }> | Extract<ProductOffer, { kind: "bxgy" }>;

function isQuantityOffer(o: ProductOffer): o is QuantityOffer {
  return o.kind === "quantity_breaks" || (o.kind === "bxgy" && o.same);
}

// "1 item" first, then every quantity the offers price, keeping the
// cheapest version of each quantity.
function buildDeals(offers: QuantityOffer[], unitPrice: number): Deal[] {
  const byQty = new Map<number, Deal>();
  const add = (d: Deal) => {
    const prev = byQty.get(d.qty);
    if (!prev || d.total < prev.total) byQty.set(d.qty, d);
  };
  add({ qty: 1, title: "1 item", note: "Standard price", total: unitPrice, full: unitPrice });
  for (const offer of offers) {
    if (offer.kind === "quantity_breaks") {
      for (const t of offer.tiers) {
        const full = unitPrice * t.qty;
        add({ qty: t.qty, title: `Buy ${t.qty}`, note: `Save ${t.percent}%`, total: full * (1 - t.percent / 100), full });
      }
    } else {
      const qty = offer.buyQty + offer.getQty;
      const full = unitPrice * qty;
      const total = unitPrice * offer.buyQty + unitPrice * offer.getQty * (1 - offer.getPercent / 100);
      add({
        qty,
        title: offer.title || `Buy ${offer.buyQty}, get ${rewardLabel(offer.getQty, offer.getPercent)}`,
        note: `${qty} items${offer.getPercent >= 100 ? `, you pay for ${offer.buyQty}` : ""}`,
        total,
        full,
      });
    }
  }
  return [...byQty.values()].sort((a, b) => a.qty - b.qty);
}

// The offers that set a quantity, drawn the way the seller picked in
// ExiusCart (photos / cards / pills / bold / list) as one choice list.
function DealPicker({
  offers,
  imageUrl,
  unitPrice,
  currency,
  quantity,
  maxQuantity,
  onSetQuantity,
}: {
  offers: QuantityOffer[];
  imageUrl: string;
  unitPrice: number;
  currency: string;
  quantity: number;
  maxQuantity: number | null;
  onSetQuantity: (quantity: number) => void;
}) {
  const deals = buildDeals(offers, unitPrice);
  if (deals.length < 2) return null;
  const style: OfferStyle = offers[0]?.style ?? "list";
  const price = (amount: number) => formatCurrency(Math.round(amount * 100) / 100, currency);
  const saving = (d: Deal) => (d.full > 0 ? 1 - d.total / d.full : 0);
  const best = deals.reduce<Deal | null>((b, d) => (saving(d) > 0.001 && (!b || saving(d) > saving(b)) ? d : b), null);
  const only = offers.length === 1 ? offers[0] : undefined;
  const heading = only?.kind === "quantity_breaks" && only.title ? only.title : "Buy more, save more";

  const bestBadge = (
    <span className="absolute -top-2.5 right-3 rounded-full bg-[#16161A] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
      Best deal
    </span>
  );

  const items = deals.map((d) => {
    const selected = quantity === d.qty;
    const disabled = maxQuantity != null && d.qty > maxQuantity;
    const discounted = d.total < d.full - 0.005;
    const common = {
      type: "button" as const,
      role: "radio" as const,
      "aria-checked": selected,
      disabled,
      onClick: () => onSetQuantity(d.qty),
    };

    if (style === "pills") {
      return (
        <button
          key={d.qty}
          {...common}
          className={`relative flex items-center gap-1.5 rounded-full border-2 px-3.5 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
            selected ? "border-action bg-[#FFFBEF] text-[#16161A]" : "border-black/10 text-[#4A4844] hover:border-black/20"
          }`}
        >
          {d.title}
          <span aria-hidden className="text-[#a3a19c]">·</span>
          <span className="font-extrabold text-[#16161A]">{price(d.total)}</span>
        </button>
      );
    }

    // cards, and photos (cards with the product photo on top).
    if (style === "cards" || style === "photos") {
      const photos = style === "photos";
      return (
        <button
          key={d.qty}
          {...common}
          className={`relative flex flex-col items-center gap-0.5 rounded-xl border-2 text-center transition disabled:cursor-not-allowed disabled:opacity-40 ${
            photos ? "p-1.5 pb-2.5" : "px-2 pb-2.5 pt-3.5"
          } ${selected ? "border-action bg-[#FFFBEF]" : "border-black/10 hover:border-black/20"}`}
        >
          {best === d && bestBadge}
          {photos && (
            <span className="relative mb-1.5 block aspect-square w-full overflow-hidden rounded-lg bg-primary-light">
              {imageUrl && <Image src={imageUrl} alt="" fill sizes="(max-width: 640px) 33vw, 160px" className="object-cover" />}
              {d.qty > 1 && (
                <span className="absolute bottom-1 right-1 rounded-md bg-[#16161A]/85 px-1.5 text-[10px] font-extrabold text-white">
                  ×{d.qty}
                </span>
              )}
            </span>
          )}
          <span className="text-[13px] font-extrabold leading-tight text-[#16161A]">{d.title}</span>
          <span className="text-[11px] text-[#716D67]">{d.note}</span>
          <span className="mt-1 text-sm font-extrabold text-[#16161A]">{price(d.total)}</span>
          {discounted && <span className="text-[11px] text-[#a3a19c] line-through">{price(d.full)}</span>}
        </button>
      );
    }

    // bold and list: one row per choice.
    const bold = style === "bold";
    return (
      <button
        key={d.qty}
        {...common}
        className={`relative flex items-center gap-3 rounded-xl border-2 px-3 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
          bold ? "py-4" : "py-2.5"
        } ${
          selected
            ? bold
              ? "border-action bg-action/15"
              : "border-action bg-[#FFFBEF]"
            : bold
              ? "border-action/40 bg-[#FFFBEF] hover:border-action"
              : "border-black/10 hover:border-black/20"
        }`}
      >
        {best === d && bestBadge}
        <span
          className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
            selected ? "border-action bg-action" : "border-black/20"
          }`}
        >
          {selected && <Check size={10} strokeWidth={3.5} className="text-[#16161A]" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block font-extrabold text-[#16161A] ${bold ? "text-base" : "text-sm"}`}>{d.title}</span>
          <span className={`${bold ? "text-[13px]" : "text-xs"} ${discounted ? "font-bold text-status" : "text-[#716D67]"}`}>
            {discounted ? `${d.note} · save ${price(d.full - d.total)}` : d.note}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className={`block font-extrabold text-[#16161A] ${bold ? "text-base" : "text-sm"}`}>{price(d.total)}</span>
          {discounted && <span className="text-xs text-[#a3a19c] line-through">{price(d.full)}</span>}
        </span>
      </button>
    );
  });

  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#8B8880]">
        <Tag size={13} className="text-status" />
        {heading}
      </p>
      <div
        role="radiogroup"
        aria-label={heading}
        className={`mt-2.5 ${
          style === "pills"
            ? "flex flex-wrap gap-2"
            : style === "cards" || style === "photos"
              ?`grid gap-2 ${deals.length >= 3 ? "grid-cols-3" : "grid-cols-2"}`
              : "flex flex-col gap-2.5"
        }`}
      >
        {items}
      </div>
      <p className="mt-1.5 text-[11px] text-[#8B8880]">Mix colors and sizes. The saving comes off at checkout.</p>
    </div>
  );
}

export function ProductOffers({
  offers,
  imageUrl,
  unitPrice,
  currency,
  quantity,
  maxQuantity,
  onSetQuantity,
  onAddGetProduct,
}: {
  offers: ProductOffer[];
  // The selected variant's photo, for the "photos" style.
  imageUrl: string;
  unitPrice: number;
  currency: string;
  quantity: number;
  maxQuantity: number | null;
  onSetQuantity: (quantity: number) => void;
  onAddGetProduct: (product: OfferGetProduct, quantity: number) => void;
}) {
  const quantityOffers = offers.filter(isQuantityOffer);
  const rest: ProductOffer[] = offers.filter((o) => !isQuantityOffer(o) && o.kind !== "bundle");
  if (quantityOffers.length === 0 && rest.length === 0) return null;
  const price = (amount: number) => formatCurrency(amount, currency);

  return (
    <div className="mt-5 flex flex-col gap-3">
      {quantityOffers.length > 0 && (
        <DealPicker
          offers={quantityOffers}
          imageUrl={imageUrl}
          unitPrice={unitPrice}
          currency={currency}
          quantity={quantity}
          maxQuantity={maxQuantity}
          onSetQuantity={onSetQuantity}
        />
      )}
      {rest.map((offer) => {
        // Shown by BundleSavePicker instead.
        if (offer.kind === "bundle") return null;

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

export type BundleOffer = Extract<ProductOffer, { kind: "bundle" }>;

export interface BundleSelf {
  id: string;
  variant: ProductVariant | null;
  price: number;
  maxQuantity: number | null;
}

// The variant used for one item of a set: the page's own pick for the
// product being viewed, the shopper's pick for another product, else its
// cheapest in-stock option (the same default the product card shows).
export function bundleItemVariant(product: Product, picks: Record<string, string>, self: BundleSelf): ProductVariant | null {
  if (product.id === self.id) return self.variant;
  return product.variants.find((v) => v.id === picks[product.id]) ?? cheapestVariant(product);
}

// A set's full price and how many whole sets are in stock. Null when the
// set can't be bought from this page.
export function bundleSetInfo(
  offer: BundleOffer,
  picks: Record<string, string>,
  self: BundleSelf,
): { full: number; maxSets: number | null } | null {
  let full = 0;
  let maxSets: number | null = null;
  for (const item of offer.items) {
    const p = item.product;
    if (!p || p.productType === "affiliate" || !p.inStock) return null;
    // Another bundle product needs its own part picks, made on its page.
    if (p.id !== self.id && p.kit) return null;
    const variant = bundleItemVariant(p, picks, self);
    if (p.id !== self.id && variant && !variant.inStock) return null;
    const unit = p.id === self.id ? self.price : (variant?.price ?? displayPrice(p));
    const stock = p.id === self.id ? self.maxQuantity : variant ? variant.stockCount : p.stockCount;
    if (stock != null) {
      const sets = Math.floor(stock / item.quantity);
      if (sets < 1) return null;
      maxSets = maxSets == null ? sets : Math.min(maxSets, sets);
    }
    full += unit * item.quantity;
  }
  return { full: Math.round(full * 100) / 100, maxSets };
}

export function bundleSetPrice(full: number, percent: number): number {
  return Math.round(full * (1 - percent / 100) * 100) / 100;
}

// "Bundle & save": just this item first, then each set at its saved price.
export function BundleSavePicker({
  offers,
  self,
  currency,
  selectedId,
  onSelect,
  picks,
  onPick,
}: {
  offers: BundleOffer[];
  self: BundleSelf;
  currency: string;
  selectedId: string | null;
  onSelect: (offerId: string | null) => void;
  picks: Record<string, string>;
  onPick: (productId: string, variantId: string) => void;
}) {
  if (offers.length === 0) return null;
  const price = (amount: number) => formatCurrency(amount, currency);
  const cardClass = (selected: boolean) =>
    `relative flex w-full flex-col gap-2 rounded-xl border-2 px-3.5 py-3 text-left transition ${
      selected ? "border-action bg-[#FFFBEF]" : "border-black/10 hover:border-black/20"
    }`;
  const tick = (
    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-action">
      <Check size={11} strokeWidth={3} className="text-[#16161A]" />
    </span>
  );

  return (
    <div className="mt-5">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#8B8880]">
        <Layers size={13} className="text-status" />
        Bundle &amp; save
      </p>
      <div className="mt-2 flex flex-col gap-2" role="radiogroup" aria-label="Bundle and save">
        <button
          type="button"
          role="radio"
          aria-checked={selectedId === null}
          onClick={() => onSelect(null)}
          className={cardClass(selectedId === null)}
        >
          <span className="flex items-center justify-between gap-3">
            <span className="text-sm font-extrabold text-[#16161A]">Just this item</span>
            <span className="text-sm font-extrabold text-[#16161A]">{price(self.price)}</span>
          </span>
          {selectedId === null && tick}
        </button>

        {offers.map((offer) => {
          const info = bundleSetInfo(offer, picks, self);
          const selected = selectedId === offer.id;
          const saved = info ? bundleSetPrice(info.full, offer.percent) : 0;
          return (
            // A div rather than a button, because a set can hold option selects.
            <div
              key={offer.id}
              role="radio"
              aria-checked={selected}
              aria-disabled={!info}
              tabIndex={info ? 0 : -1}
              onClick={() => info && onSelect(offer.id)}
              onKeyDown={(e) => {
                if (info && (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
                  e.preventDefault();
                  onSelect(offer.id);
                }
              }}
              className={`${cardClass(selected)} ${info ? "cursor-pointer" : "cursor-not-allowed opacity-40"}`}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block text-sm font-extrabold text-[#16161A]">
                    {offer.title || `Bundle & save ${offer.percent}%`}
                  </span>
                  <span className="text-xs font-bold text-status">
                    {info ? `Save ${price(info.full - saved)} (${offer.percent}%)` : "Not available right now"}
                  </span>
                </span>
                {info && (
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-extrabold text-[#16161A]">{price(saved)}</span>
                    <span className="text-xs text-[#a3a19c] line-through">{price(info.full)}</span>
                  </span>
                )}
              </span>
              <span className="flex flex-col gap-1.5">
                {offer.items.map((item) => {
                  const p = item.product;
                  const variant = p ? bundleItemVariant(p, picks, self) : null;
                  const imageUrl = variant?.imageUrl || p?.imageUrl;
                  return (
                    <span key={item.productId} className="flex items-center gap-2.5">
                      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-primary-light">
                        {imageUrl && <Image src={imageUrl} alt={p?.name ?? ""} fill sizes="40px" className="object-cover" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-1 text-[13px] font-semibold text-[#16161A]">
                          {item.quantity > 1 && <span className="text-[#8B8880]">{item.quantity}× </span>}
                          {p?.id === self.id ? "This item" : (p?.name ?? "Unavailable item")}
                        </span>
                        {p && p.id !== self.id && p.variants.length > 1 && (
                          <select
                            value={variant?.id ?? ""}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              onPick(p.id, e.target.value);
                              onSelect(offer.id);
                            }}
                            aria-label={`Option for ${p.name}`}
                            className="mt-1 h-8 max-w-full rounded-lg border border-black/10 bg-white px-2 text-xs font-semibold text-[#16161A]"
                          >
                            {p.variants.map((v) => (
                              <option key={v.id} value={v.id} disabled={!v.inStock}>
                                {[v.color, v.size].filter(Boolean).join(" / ") || "Option"}
                                {v.inStock ? "" : " (sold out)"}
                              </option>
                            ))}
                          </select>
                        )}
                      </span>
                    </span>
                  );
                })}
              </span>
              {selected && tick}
            </div>
          );
        })}
      </div>
    </div>
  );
}
