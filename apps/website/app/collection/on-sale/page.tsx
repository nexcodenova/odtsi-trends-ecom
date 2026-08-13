import { getProducts, type Product } from "@odtsi/exiuscart-client";
import { ProductCard } from "@/components/product/product-card";

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-5">
      <h1 className="text-2xl font-extrabold text-[#16161A] sm:text-3xl">On Sale</h1>
      <p className="mt-1 text-sm text-[#716D67]">Real products at more than {MIN_DISCOUNT_PCT}% off.</p>

      {products.length > 0 ? (
        <>
          <p className="mt-4 text-sm text-[#716D67]">{products.length} products</p>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : (
        <p className="mt-10 text-sm text-[#716D67]">
          No products are discounted more than {MIN_DISCOUNT_PCT}% right now — check back soon.
        </p>
      )}
    </div>
  );
}
