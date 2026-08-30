import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProducts, type Product } from "@odtsi/exiuscart-client";
import { ProductCarousel } from "@/components/home/product-carousel";

// Affiliate products only — kept out of Fresh Finds/Most Viewed so those
// keep reading as "shop directly from us." No minimum view count like Most
// Viewed has: there won't be many affiliate picks at first, and gating on
// views would likely empty this section out before it ever shows anything.
async function loadAffiliateProducts(): Promise<Product[]> {
  try {
    const products = await getProducts();
    return products
      .filter((p) => p.productType === "affiliate")
      .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
  } catch {
    return [];
  }
}

export async function PopularAffiliate() {
  const products = await loadAffiliateProducts();
  // Honest-empty: skip the whole section rather than show a gap or fake
  // products, same rule as every other homepage row.
  if (products.length === 0) return null;

  return (
    <section className="px-4 py-10 sm:px-5 sm:py-14">
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-[#DEDCD5]" />
        <h2 className="shrink-0 text-3xl font-extrabold text-[#16161A] sm:text-4xl">Popular on ODTSI</h2>
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
