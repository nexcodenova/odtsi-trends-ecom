import { getProducts, type Product } from "@odtsi/exiuscart-client";
import { ShopGrid } from "@/components/shop/shop-grid";
import { MIN_VIEWS_FOR_POPULAR } from "@/lib/product-thresholds";

// Same real-view-count signal as the homepage's Most Viewed row — ranked
// by genuine traffic, not a fabricated "trending" score.
async function loadTrending(): Promise<Product[]> {
  try {
    const products = await getProducts();
    return products
      .filter((p) => p.viewCount !== null && p.viewCount > MIN_VIEWS_FOR_POPULAR)
      .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
  } catch (err) {
    console.error("[collection-trending]", err);
    return [];
  }
}

export default async function TrendingPage() {
  const products = await loadTrending();

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-5">
      <h1 className="text-2xl font-extrabold text-[#16161A] sm:text-3xl">Trending Now</h1>
      <p className="mt-1 text-sm text-[#716D67]">
        {products.length > 0
          ? `${products.length} products ranked by real customer views`
          : "Nothing has enough real views to rank as trending yet — check back soon."}
      </p>

      {products.length > 0 && (
        <div className="mt-6">
          <ShopGrid products={products} />
        </div>
      )}
    </div>
  );
}
