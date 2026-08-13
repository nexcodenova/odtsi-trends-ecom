import { getProducts, type Product } from "@odtsi/exiuscart-client";
import { ShopGrid } from "@/components/shop/shop-grid";

async function loadProducts(): Promise<Product[]> {
  try {
    return await getProducts();
  } catch {
    // ExiusCart's public /products endpoint isn't live yet — no fake
    // products, just an honest empty state until it's deployed.
    return [];
  }
}

export default async function CollectionsPage() {
  const products = await loadProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-5">
      <h1 className="text-2xl font-extrabold text-[#16161A] sm:text-3xl">Collection</h1>

      {products.length > 0 ? (
        <>
          <p className="mt-1 text-sm text-[#716D67]">{products.length} products</p>
          <div className="mt-6">
            <ShopGrid products={products} />
          </div>
        </>
      ) : (
        <p className="mt-10 text-sm text-[#716D67]">
          Products aren&apos;t connected yet — this page will show real inventory once ExiusCart is live.
        </p>
      )}
    </div>
  );
}
