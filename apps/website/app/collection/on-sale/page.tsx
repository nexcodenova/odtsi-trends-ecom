import { getProducts, type Product } from "@odtsi/exiuscart-client";
import { ProductCard } from "@/components/product/product-card";
import { OnSaleHero } from "@/components/collection/on-sale-hero";

const MIN_DISCOUNT_PCT = 40;

function discountPct(product: Product): number {
  if (product.compareAtPrice === null || product.compareAtPrice <= product.price) return 0;
  return (1 - product.price / product.compareAtPrice) * 100;
}

async function loadDeals(): Promise<Product[]> {
  try {
    const products = await getProducts();
    return products.filter((product) => discountPct(product) > MIN_DISCOUNT_PCT);
  } catch {
    // ExiusCart's public /products endpoint isn't live yet — no fake
    // products, just an honest empty state until it's deployed.
    return [];
  }
}

export default async function OnSalePage() {
  const products = await loadDeals();
  // Real max, from the same products actually listed below — never a
  // rounder/bigger number than what's really in the grid.
  const maxDiscountPct = products.length > 0 ? Math.round(Math.max(...products.map(discountPct))) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-5">
      <OnSaleHero maxDiscountPct={maxDiscountPct} dealCount={products.length} />

      <div id="deals" className="mt-10 scroll-mt-20">
        <h2 className="text-2xl font-extrabold text-[#16161A] sm:text-3xl">Today&apos;s Best Deals</h2>
        <p className="mt-1 text-sm text-[#716D67]">
          {products.length > 0
            ? `${products.length} hand-picked ${products.length === 1 ? "offer" : "offers"} • Prices shown before checkout`
            : `No products are discounted more than ${MIN_DISCOUNT_PCT}% right now — check back soon.`}
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
