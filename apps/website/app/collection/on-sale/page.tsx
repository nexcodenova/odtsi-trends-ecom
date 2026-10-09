import { getProducts, type Product } from "@odtsi/exiuscart-client";
import { ProductCard } from "@/components/product/product-card";
import { OnSaleHero } from "@/components/collection/on-sale-hero";

const MIN_DISCOUNT_PCT = 40;

// Explicit product call: when no real product is currently discounted,
// show this placeholder in the banner instead of "0% OFF". Not derived
// from real data — overridden the moment any real discount exists.
const FALLBACK_MAX_DISCOUNT_PCT = 90;

function discountPct(product: Product): number {
  if (product.compareAtPrice === null || product.compareAtPrice <= product.price) return 0;
  return (1 - product.price / product.compareAtPrice) * 100;
}

async function loadAllDiscounted(): Promise<Product[]> {
  try {
    const products = await getProducts();
    return products.filter((product) => discountPct(product) > 0);
  } catch (err) {
    console.error("[collection-on-sale]", err);
    return [];
  }
}

export default async function OnSalePage() {
  const allDiscounted = await loadAllDiscounted();
  // The grid only lists real standout deals (> MIN_DISCOUNT_PCT% off) —
  // that threshold is just an internal cutoff for what's worth featuring,
  // never shown to the shopper as a number. The banner's "up to X% off"
  // uses the real max across every discounted product, not just the ones
  // that clear the grid's bar, so it never understates what's genuinely
  // available.
  const products = allDiscounted.filter((product) => discountPct(product) > MIN_DISCOUNT_PCT);
  const maxDiscountPct =
    allDiscounted.length > 0 ? Math.round(Math.max(...allDiscounted.map(discountPct))) : FALLBACK_MAX_DISCOUNT_PCT;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-5">
      <OnSaleHero maxDiscountPct={maxDiscountPct} dealCount={products.length} />

      <div id="deals" className="mt-10 scroll-mt-20">
        <h2 className="text-2xl font-extrabold text-[#16161A] sm:text-3xl">Today&apos;s Best Deals</h2>
        <p className="mt-1 text-sm text-[#716D67]">
          {products.length > 0
            ? `${products.length} hand-picked ${products.length === 1 ? "offer" : "offers"} • Prices shown before checkout`
            : "No standout deals right now — check back soon."}
        </p>

        {products.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} sale />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
