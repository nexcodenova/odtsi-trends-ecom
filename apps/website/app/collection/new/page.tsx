import { getProducts, type Product } from "@odtsi/exiuscart-client";
import { ShopGrid } from "@/components/shop/shop-grid";

// ExiusCart doesn't expose a createdAt field on products yet, so this
// can't be sorted by real listing date. IDs are assigned sequentially by
// the database, so sorting by id descending is the closest honest proxy
// for "newest" available today.
async function loadNewArrivals(): Promise<Product[]> {
  try {
    const products = await getProducts();
    return [...products].sort((a, b) => Number(b.id) - Number(a.id));
  } catch (err) {
    console.error("[collection-new]", err);
    return [];
  }
}

export default async function NewArrivalsPage() {
  const products = await loadNewArrivals();

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-5">
      <h1 className="text-2xl font-extrabold text-[#16161A] sm:text-3xl">New Arrivals</h1>
      <p className="mt-1 text-sm text-[#716D67]">
        {products.length > 0 ? `${products.length} products, newest first` : "No products available right now — check back soon."}
      </p>

      {products.length > 0 && (
        <div className="mt-6">
          <ShopGrid products={products} />
        </div>
      )}
    </div>
  );
}
