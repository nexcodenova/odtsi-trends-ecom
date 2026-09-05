import { getProducts, type Product } from "@odtsi/exiuscart-client";
import { ProductCarousel } from "@/components/home/product-carousel";

// Same category, any product type — physical, digital, or affiliate can all
// show up here, unlike the homepage rows which split by type. A shopper
// browsing a category doesn't care which fulfillment path a product takes,
// only that it's related to what they're already looking at. Sorted by
// real view count within the category, highest first — same "most viewed"
// idea as the homepage section, just scoped to this category instead of
// site-wide. Capped to 4 — two rows on the base mobile grid (grid-cols-2)
// instead of sprawling as more real products qualify.
const MAX_RELATED = 4;

async function loadRelated(categorySlug: string, excludeId: string): Promise<Product[]> {
  try {
    const products = await getProducts({ category: categorySlug });
    return products
      .filter((p) => p.id !== excludeId)
      .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
      .slice(0, MAX_RELATED);
  } catch {
    return [];
  }
}

export async function RelatedProducts({ categorySlug, excludeId }: { categorySlug: string; excludeId: string }) {
  // "uncategorized" means this product had no real category_id at all —
  // nothing real to relate it to, so don't even try the fetch.
  if (categorySlug === "uncategorized") return null;

  const products = await loadRelated(categorySlug, excludeId);
  // Honest-empty: skip the whole section rather than show a gap, same rule
  // as every other section on this page.
  if (products.length === 0) return null;

  return (
    <div className="mt-10 border-t border-black/5 pt-8">
      <h2 className="text-center text-xs font-extrabold uppercase tracking-wide text-[#8B8880]">
        Most Loved by Customers
      </h2>
      <div className="mt-4">
        <ProductCarousel products={products} compact sale />
      </div>
    </div>
  );
}
