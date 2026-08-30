import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProducts, type Product } from "@odtsi/exiuscart-client";
import { ProductCarousel } from "@/components/home/product-carousel";

// Digital products only — same reasoning as the affiliate row: kept
// separate so Fresh Finds/Most Viewed stay about physical stock.
async function loadDigitalProducts(): Promise<Product[]> {
  try {
    const products = await getProducts();
    return products.filter((p) => p.productType === "digital");
  } catch {
    return [];
  }
}

export async function DigitalProducts() {
  const products = await loadDigitalProducts();
  // Honest-empty: skip the whole section rather than show a gap or fake
  // products, same rule as every other homepage row.
  if (products.length === 0) return null;

  return (
    <section className="px-4 py-10 sm:px-5 sm:py-14">
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-[#DEDCD5]" />
        <h2 className="shrink-0 text-3xl font-extrabold text-[#16161A] sm:text-4xl">Digi ODTSI</h2>
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
