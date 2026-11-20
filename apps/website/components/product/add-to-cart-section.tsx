"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Minus, Plus, Check, ExternalLink, CheckCircle2, ShoppingCart } from "lucide-react";
import { trackStorefrontEvent, type OfferGetProduct, type Product, type ProductVariant } from "@odtsi/exiuscart-client";
import { addToCart } from "@/lib/cart";
import { setBuyNowItem } from "@/lib/buy-now";
import { GALLERY_IMAGE_EVENT, notifyAdded, notifyVariantImage, type VariantImageDetail } from "@/lib/notify";
import { WishlistButton } from "@/components/product/wishlist-button";
import { Price } from "@/components/shared/price";
import { cheapestVariant } from "@/lib/product-price";
import { getSpecIcon } from "@/lib/spec-icons";
import { trackViewContent } from "@/lib/tracking";
import { PaymentBadges } from "@/components/checkout/payment-badges";
import {
  BundleSavePicker,
  KitPicker,
  ProductOffers,
  bundleItemVariant,
  bundleSetInfo,
  bundleSetPrice,
  offerSaving,
  type BundleOffer,
} from "@/components/product/product-offers";
import { displayPrice } from "@/lib/product-price";
import { formatCurrency } from "@odtsi/utils";

// Price, stock, color/size picker, quantity, and Add to Cart all live here
// together — once a variant is selected, the price and stock shown above
// need to follow it, and those can't stay static JSX in the server-rendered
// page anymore.
export function AddToCartSection({ product, cashbackLabel }: { product: Product; cashbackLabel: string }) {
  const router = useRouter();
  // Affiliate products aren't sold by us — no cart, no quantity, no stock
  // info (ExiusCart's checkout rejects them with a 400 if they ever reach
  // it), and no wallet cashback since no money actually moves through us.
  const isAffiliate = product.productType === "affiliate";
  const isDigital = product.productType === "digital";
  const hasVariants = !isAffiliate && product.variants.length > 0;
  // Same cheapest-in-stock pick used for the listing card's price — the
  // product page needs to default to whatever price the shopper already
  // saw before clicking through, not just whichever variant sits first in
  // the array (confirmed on a real product where those didn't match).
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(() =>
    hasVariants ? cheapestVariant(product) : null,
  );
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  // Bundle products: one pick per part. Parts with a single option are
  // pre-picked (checkout would pick them anyway).
  const kit = isAffiliate ? null : product.kit;
  const [kitPicks, setKitPicks] = useState<Record<string, string>>(() => {
    const picks: Record<string, string> = {};
    for (const part of kit?.parts ?? []) {
      const only = part.options.length === 1 ? part.options[0] : undefined;
      if (only) picks[part.productId] = only.variantId;
    }
    return picks;
  });
  const missingKitPick = kit?.parts.find((p) => p.options.length > 1 && !kitPicks[p.productId]) ?? null;
  const offers = isAffiliate ? [] : product.offers;
  // Bundle & save: null = just this item, else the picked set's offer id.
  // At most 8 offers come back, so this list stays short.
  const bundleOffers = offers.filter((o): o is BundleOffer => o.kind === "bundle");
  const [bundleId, setBundleId] = useState<string | null>(null);
  const [bundlePicks, setBundlePicks] = useState<Record<string, string>>({});

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

  // A gallery photo that belongs to one color selects that color (keeping
  // the size when it can). Photos shared by every color change nothing.
  useEffect(() => {
    function handle(e: Event) {
      const url = (e as CustomEvent<VariantImageDetail>).detail.imageUrl;
      if (!url || selectedVariant?.imageUrl === url) return;
      const match = product.variants.find((v) => v.color && v.imageUrl === url);
      if (!match?.color) return;
      const sameSize = product.variants.find((v) => v.color === match.color && v.size === selectedVariant?.size);
      setSelectedVariant(sameSize ?? match);
    }
    window.addEventListener(GALLERY_IMAGE_EVENT, handle);
    return () => window.removeEventListener(GALLERY_IMAGE_EVENT, handle);
  }, [product.variants, selectedVariant]);

  function selectSize(size: string) {
    const next =
      product.variants.find((v) => v.color === selectedVariant?.color && v.size === size) ??
      product.variants.find((v) => v.size === size);
    if (next) selectVariant(next);
  }

  const currentPrice = selectedVariant?.price ?? product.price;
  const inStock = kit ? product.inStock && kit.inStock > 0 : selectedVariant ? selectedVariant.inStock : product.inStock;
  const itemMaxQuantity = kit ? kit.inStock : selectedVariant ? selectedVariant.stockCount : product.stockCount;
  const bundleSelf = { id: product.id, variant: selectedVariant, price: currentPrice, maxQuantity: itemMaxQuantity };
  const selectedSet = bundleOffers.find((o) => o.id === bundleId) ?? null;
  const setInfo = selectedSet ? bundleSetInfo(selectedSet, bundlePicks, bundleSelf) : null;
  // With a set picked, quantity counts whole sets.
  const activeSet = selectedSet && setInfo ? { offer: selectedSet, ...setInfo } : null;
  const maxQuantity = activeSet ? activeSet.maxSets : itemMaxQuantity;
  const unitTotal = activeSet ? activeSet.full : currentPrice;
  const estimatedSaving = activeSet
    ? Math.round((activeSet.full - bundleSetPrice(activeSet.full, activeSet.offer.percent)) * quantity * 100) / 100
    : offerSaving(offers, currentPrice, quantity);

  // Keep quantity within the stock of whatever is picked now.
  useEffect(() => {
    if (maxQuantity != null) setQuantity((q) => Math.max(1, Math.min(q, maxQuantity)));
  }, [maxQuantity]);
  const hasDiscount = product.compareAtPrice !== null && product.compareAtPrice > currentPrice;
  const savings = hasDiscount ? product.compareAtPrice! - currentPrice : 0;

  // Fires once per real product-page view — this component only mounts on
  // an actual product page with real product data, no separate "is this a
  // real view" check needed. Only on product identity, not on every
  // variant reselect — a color/size swap isn't a new "view" of the product.
  useEffect(() => {
    trackViewContent({ id: product.id, name: product.name, price: currentPrice, currency: product.currency });
    // Real ExiusCart on-site analytics (separate from the retargeting call
    // above) — this is the only thing that fills the seller dashboard's
    // Website Traffic chart and per-product funnel; it was real but
    // undocumented until now, not unbuilt.
    trackStorefrontEvent({ event: "view", productId: product.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  function currentLineItem() {
    if (kit) {
      const bundleSelections = kit.parts.flatMap((p) => {
        const variantId = kitPicks[p.productId];
        return variantId ? [{ componentProductId: p.productId, variantId }] : [];
      });
      const pickedLabels = kit.parts
        .filter((p) => p.options.length > 1 && kitPicks[p.productId])
        .map((p) => p.options.find((o) => o.variantId === kitPicks[p.productId])?.title)
        .filter(Boolean);
      return {
        productId: product.id,
        slug: product.slug,
        name: pickedLabels.length > 0 ? `${product.name} — ${pickedLabels.join(", ")}` : product.name,
        price: currentPrice,
        currency: product.currency,
        imageUrl: product.imageUrl,
        // Different picks = a separate cart line (and a separate checkout item).
        variantId: bundleSelections.length > 0 ? `kit:${bundleSelections.map((b) => b.variantId).join("-")}` : undefined,
        bundleSelections,
      };
    }
    const variantLabel = selectedVariant
      ? [selectedVariant.color, selectedVariant.size].filter(Boolean).join(" / ")
      : null;
    const name = variantLabel ? `${product.name} — ${variantLabel}` : product.name;
    const imageUrl = selectedVariant?.imageUrl || product.imageUrl;
    return {
      productId: product.id,
      slug: product.slug,
      name,
      price: currentPrice,
      currency: product.currency,
      imageUrl,
      variantId: selectedVariant?.sku,
      exiusVariantId: selectedVariant?.id,
    };
  }

  // Buy X get Y where Y is another product: Y goes in the cart as a normal
  // line; checkout takes the discount off it while the shopper qualifies.
  function handleAddGetProduct(item: OfferGetProduct, qty: number) {
    if (item.price === null) return;
    addToCart(
      { productId: item.productId, slug: item.slug ?? "", name: item.title, price: item.price, currency: product.currency, imageUrl: item.imageUrl ?? "" },
      qty,
    );
    notifyAdded({ type: "cart", name: item.title, imageUrl: item.imageUrl ?? "", price: item.price * qty, currency: product.currency });
  }

  // Every item of the picked set goes in as its own line at full price;
  // checkout sees the whole set in the cart and takes the saving off.
  function addSet(set: BundleOffer) {
    for (const item of set.items) {
      const p = item.product;
      if (!p) continue;
      const qty = item.quantity * quantity;
      if (p.id === product.id) {
        addToCart(currentLineItem(), qty);
        continue;
      }
      const variant = bundleItemVariant(p, bundlePicks, bundleSelf);
      const label = variant ? [variant.color, variant.size].filter(Boolean).join(" / ") : "";
      addToCart(
        {
          productId: p.id,
          slug: p.slug,
          name: label ? `${p.name} — ${label}` : p.name,
          price: variant?.price ?? displayPrice(p),
          currency: p.currency,
          imageUrl: variant?.imageUrl || p.imageUrl,
          variantId: variant?.sku,
          exiusVariantId: variant?.id,
        },
        qty,
      );
    }
  }

  function handleAdd() {
    if (activeSet) {
      addSet(activeSet.offer);
      notifyAdded({
        type: "cart",
        name: activeSet.offer.title || `${product.name} bundle`,
        imageUrl: product.imageUrl,
        price: activeSet.full * quantity,
        currency: product.currency,
      });
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
      return;
    }
    const { name, imageUrl } = currentLineItem();
    addToCart(currentLineItem(), quantity);
    notifyAdded({ type: "cart", name, imageUrl, price: currentPrice * quantity, currency: product.currency });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  // Digital only — skips the cart page entirely and goes straight to
  // checkout. Deliberately does NOT touch the persistent cart: adding this
  // item there and then opening normal checkout would check out whatever
  // else was already in the cart too. Instead this stashes exactly one
  // line in a session-only "buy now" slot that checkout prefers over the
  // real cart when present.
  function handleBuyNow() {
    setBuyNowItem({ ...currentLineItem(), quantity });
    router.push("/checkout");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-3">
        {hasDiscount && (
          <Price amount={product.compareAtPrice!} currency={product.currency} className="text-base text-[#a3a19c] line-through" />
        )}
        <Price amount={currentPrice} currency={product.currency} className="text-[30px] font-extrabold text-[#16161A]" />
        {hasDiscount &&
          (isDigital ? (
            <span className="-mt-2.5 rounded-full border border-[#B91C1C] px-3 py-1 text-xs font-extrabold text-[#B91C1C] self-start">
              Save <Price amount={savings} currency={product.currency} />
            </span>
          ) : (
            <span className="animate-float rounded-full bg-action px-3 py-1 text-xs font-extrabold text-action-ink shadow-[0_4px_12px_-4px_rgba(242,183,5,0.6)]">
              Save <Price amount={savings} currency={product.currency} />
            </span>
          ))}
      </div>

      {!isAffiliate && (
        <p className="mt-2 text-sm font-bold text-status">
          {isDigital
            ? inStock
              ? "Available — Digital Delivery"
              : "Currently Unavailable"
            : inStock
              ? "In Stock — Order Now Before It's Gone"
              : "Out of Stock"}
          {!isDigital && inStock && product.freeShipping && <span className="text-[#4A4844]"> · Free shipping</span>}
        </p>
      )}

      {/* Real per-product highlights from ExiusCart (product.specs, mapped
          from their real `highlights` field) — renders nothing until a
          seller actually sets any. Each entry's real icon name is mapped
          to an actual icon component, not hardcoded to one icon for every
          row. */}
      {isDigital && product.specs.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {product.specs.map((spec) => {
            const Icon = getSpecIcon(spec.icon);
            return (
              <div key={spec.label} className="flex items-center gap-2.5 text-[14px] text-[#4A4844]">
                <Icon size={17} className="shrink-0 text-status" />
                {spec.label}
              </div>
            );
          })}
        </div>
      )}

      {/* Everything from here down is the purchase control block — pinned
          to the bottom edge on digital via mt-auto, so the info column's
          bottom lines up with the gallery image's bottom edge exactly,
          instead of just floating wherever the content above happens to
          end. Physical gets no mt-auto, same flow as before. */}
      <div className={isDigital ? "mt-auto" : ""}>
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
                    {v.colorHex ? (
                      <span
                        className="h-4 w-4 flex-shrink-0 rounded-full border border-black/10"
                        style={{ backgroundColor: v.colorHex }}
                      />
                    ) : (
                      // No hex from the seller: the color's own photo is
                      // the clearest swatch there is.
                      v.imageUrl && (
                        <span className="relative -ml-1.5 h-7 w-7 flex-shrink-0 overflow-hidden rounded-lg bg-primary-light">
                          <Image src={v.imageUrl} alt="" fill sizes="28px" className="object-cover" />
                        </span>
                      )
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

      {kit && (
        <KitPicker
          kit={kit}
          currency={product.currency}
          picks={kitPicks}
          onPick={(partId, variantId) => setKitPicks((p) => ({ ...p, [partId]: variantId }))}
        />
      )}

      <ProductOffers
        offers={offers}
        imageUrl={selectedVariant?.imageUrl || product.imageUrl}
        unitPrice={currentPrice}
        currency={product.currency}
        quantity={quantity}
        maxQuantity={maxQuantity}
        onSetQuantity={(q) => setQuantity(Math.max(1, maxQuantity != null ? Math.min(maxQuantity, q) : q))}
        onAddGetProduct={handleAddGetProduct}
      />

      <BundleSavePicker
        offers={bundleOffers}
        self={bundleSelf}
        currency={product.currency}
        selectedId={bundleId}
        onSelect={setBundleId}
        picks={bundlePicks}
        onPick={(productId, variantId) => setBundlePicks((p) => ({ ...p, [productId]: variantId }))}
      />

      {!isAffiliate && (
        <div className={isDigital ? "mt-3" : "mt-5"}>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-[#8B8880]">{activeSet ? "Sets" : "Quantity"}</p>
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
          {estimatedSaving > 0 && (
            <p className="mt-2 text-[13px] font-semibold text-[#4A4844]">
              {quantity} for{" "}
              <span className="font-extrabold text-[#16161A]">
                {formatCurrency(unitTotal * quantity - estimatedSaving, product.currency)}
              </span>{" "}
              <span className="text-[#a3a19c] line-through">{formatCurrency(unitTotal * quantity, product.currency)}</span>{" "}
              <span className="font-bold text-status">— you save {formatCurrency(estimatedSaving, product.currency)}</span>
            </p>
          )}
          {missingKitPick && <p className="mt-2 text-xs font-semibold text-[#B91C1C]">Choose an option for {missingKitPick.name}</p>}
        </div>
      )}

      <div className={`flex items-center gap-3 ${isDigital ? "mt-4" : "mt-5"}`}>
        {isAffiliate ? (
          <a
            href={product.affiliateUrl ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[58px] flex-1 items-center justify-center gap-2 rounded-2xl bg-primary text-[16px] font-extrabold text-white shadow-[0_10px_24px_-8px_rgba(27,42,94,0.5)] transition hover:bg-primary-hover"
          >
            <ExternalLink size={18} />
            {product.affiliateCtaText || "Buy Now"}
          </a>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            disabled={!inStock || (hasVariants && !selectedVariant) || !!missingKitPick}
            className={`flex w-full max-w-[360px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#F6C935] to-[#C99200] text-[16px] font-extrabold text-[#16161A] shadow-[0_10px_24px_-8px_rgba(201,146,0,0.55)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none ${
              isDigital ? "h-[50px]" : "h-[58px]"
            }`}
          >
            {!inStock ? null : justAdded ? <Check size={19} /> : <ShoppingCart size={19} />}
            {!inStock ? "Out of Stock" : justAdded ? "Added to Cart" : "Add to Cart"}
          </button>
        )}
        {/* Digital's wishlist button lives on the gallery image corner
            instead (see the product page), so Add to Cart can go full
            width and match Buy Now below it exactly. */}
        {!isDigital && <WishlistButton product={product} />}
      </div>

      {/* Digital only — a second, direct-to-checkout path below Add to
          Cart. Skips the cart page since a digital purchase is usually a
          single-item decision. */}
      {/* Buy Now checks out a single line, so it's hidden while a set is picked. */}
      {isDigital && !activeSet && (
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!inStock || (hasVariants && !selectedVariant) || !!missingKitPick}
          className="mt-2.5 h-[50px] w-full max-w-[360px] rounded-2xl bg-primary text-[16px] font-extrabold text-white shadow-[0_10px_24px_-8px_rgba(27,42,94,0.5)] transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          Buy Now
        </button>
      )}

      {isDigital && (
        <p className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold text-status">
          <CheckCircle2 size={14} />
          Digital product • No physical shipping
        </p>
      )}

      {!isAffiliate && <PaymentBadges compact align="start" className="mt-3" />}

      {!isAffiliate && (
        <p className={`text-[11px] text-[#8B8880] text-left ${isDigital ? "mt-1.5" : "mt-2.5"}`}>
          {cashbackLabel} back in your ODTSI Wallet on this order
        </p>
      )}
      </div>
    </div>
  );
}
