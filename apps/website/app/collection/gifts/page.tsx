import { getProducts, type Product } from "@odtsi/exiuscart-client";
import { ShopGrid } from "@/components/shop/shop-grid";
import { GiftsHero } from "@/components/collection/gifts-hero";

// Real seller-set tags only — a product shows up here because it was
// actually tagged "gift" in ExiusCart, not because of any curation on
// this side.
async function loadGifts(): Promise<Product[]> {
  try {
    const products = await getProducts();
    return products.filter((p) => p.tags.some((t) => t.toLowerCase() === "gift"));
  } catch (err) {
    console.error("[collection-gifts]", err);
    return [];
  }
}

export default async function GiftsPage() {
  const products = await loadGifts();

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-5">
      <GiftsHero productCount={products.length} />

      <div id="gifts" className="mt-10 scroll-mt-20">
        <h2 className="text-2xl font-extrabold text-[#16161A] sm:text-3xl">Gifts</h2>
        <p className="mt-1 text-sm text-[#716D67]">
          {products.length > 0
            ? `${products.length} products tagged as gifts`
            : "No products are tagged as gifts yet — check back soon."}
        </p>

        {products.length > 0 && (
          <div className="mt-6">
            <ShopGrid products={products} />
          </div>
        )}
      </div>
    </div>
  );
}
