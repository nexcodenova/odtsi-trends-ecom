import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProducts, type Product } from "@odtsi/exiuscart-client";
import { ProductCarousel } from "@/components/home/product-carousel";

async function loadProducts(): Promise<Product[]> {
  try {
    return await getProducts();
  } catch {
    return [];
  }
}

export async function TrendingProducts() {
  const products = await loadProducts();
  // Honest-empty: skip the whole section rather than show a gap or fake
  // products, same rule as the category grid.
  if (products.length === 0) return null;

  return (
    <section className="px-4 py-10 sm:px-5 sm:py-14">
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-[#DEDCD5]" />
        <h2 className="shrink-0 text-3xl font-extrabold text-[#16161A] sm:text-4xl">Fresh Finds</h2>
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
