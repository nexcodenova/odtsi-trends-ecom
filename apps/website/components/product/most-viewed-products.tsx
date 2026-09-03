import { getProducts, type Product } from "@odtsi/exiuscart-client";
import { ProductCarousel } from "@/components/home/product-carousel";
import { MIN_VIEWS_FOR_POPULAR } from "@/lib/product-thresholds";

// Same real >50-view bar the homepage's Most Viewed section uses (shared
// constant, not reinvented) — physical and digital both compete here,
// affiliate doesn't since it isn't sold by us. Styled to match the other
// product-page sections (small uppercase heading) rather than the
// homepage's big divider treatment, since this sits at the bottom of a
// product page, not as its own homepage row.
async function loadMostViewed(excludeId: string): Promise<Product[]> {
  try {
    const products = await getProducts();
    return products
      .filter(
        (p) =>
          p.id !== excludeId &&
          (p.productType === "physical" || p.productType === "digital") &&
          p.viewCount !== null &&
          p.viewCount > MIN_VIEWS_FOR_POPULAR,
      )
      .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
      .slice(0, 12);
  } catch {
    return [];
  }
}

export async function MostViewedProducts({ excludeId }: { excludeId: string }) {
  const products = await loadMostViewed(excludeId);
  // Honest-empty: skip the whole section rather than show a gap, same rule
  // as every other section on this page.
  if (products.length === 0) return null;

  return (
    <div className="mt-10 border-t border-black/5 pt-8">
      <h2 className="text-center text-xs font-extrabold uppercase tracking-wide text-[#8B8880]">Most Viewed</h2>
      <div className="mt-4">
        <ProductCarousel products={products} />
      </div>
    </div>
  );
}
