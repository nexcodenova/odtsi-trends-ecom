import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProducts, type Product } from "@odtsi/exiuscart-client";
import { ProductCarousel } from "@/components/home/product-carousel";

// "Top Rated" isn't buildable yet — every real product currently has
// avg_rating: null and review_count: 0, nothing to rank by honestly. Real
// view counts do have genuine variance today, so this ranks by those
// instead. Swap the sort to rating once real reviews start coming in.
const MIN_VIEWS = 50;

async function loadMostViewed(): Promise<Product[]> {
  try {
    const products = await getProducts();
    return products
      // Physical and digital — both are things we actually sell (real
      // orders, real wallet earnings), so both compete for this section on
      // real views. Affiliate keeps its own dedicated row instead, same as
      // Fresh Finds.
      .filter(
        (p) =>
          (p.productType === "physical" || p.productType === "digital") &&
          p.viewCount !== null &&
          p.viewCount > MIN_VIEWS,
      )
      .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
      .slice(0, 12);
  } catch {
    return [];
  }
}

export async function MostViewed() {
  const products = await loadMostViewed();
  // Honest-empty: skip the whole section rather than show a gap or fake
  // products, same rule as the category grid and Fresh Finds.
  if (products.length === 0) return null;

  return (
    <section className="px-4 py-10 sm:px-5 sm:py-14">
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-[#DEDCD5]" />
        <h2 className="shrink-0 text-3xl font-extrabold text-[#16161A] sm:text-4xl">Most Viewed</h2>
        <span className="h-px flex-1 bg-[#DEDCD5]" />
      </div>

      <div className="mt-8">
        <ProductCarousel products={products} />
      </div>

      <div className="mt-6 flex justify-center">
        <Link
          href="/collections"
          className="flex items-center gap-1.5 text-sm font-bold text-primary transition hover:text-primary-hover"
        >
          View All Products
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
