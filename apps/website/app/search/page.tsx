import { getProducts, type Product } from "@odtsi/exiuscart-client";
import { ProductCarousel } from "@/components/home/product-carousel";
import { SearchX } from "lucide-react";

async function loadResults(q: string): Promise<Product[]> {
  try {
    return await getProducts({ search: q });
  } catch {
    return [];
  }
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const products = query ? await loadResults(query) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-5">
      <h1 className="text-2xl font-extrabold text-[#16161A] sm:text-3xl">
        {query ? (
          <>
            Search results for &ldquo;{query}&rdquo;
          </>
        ) : (
          "Search"
        )}
      </h1>
      {query && (
        <p className="mt-1 text-sm text-[#716D67]">
          {products.length} {products.length === 1 ? "product" : "products"} found
        </p>
      )}

      <div className="mt-8">
        {!query ? (
          <p className="text-sm text-[#716D67]">Enter a search term to find products.</p>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <SearchX size={32} className="text-[#8B8880]" />
            <p className="text-base font-bold text-[#16161A]">No products found for &ldquo;{query}&rdquo;</p>
            <p className="text-sm text-[#716D67]">Try a different search term or browse our categories instead.</p>
          </div>
        ) : (
          <ProductCarousel products={products} />
        )}
      </div>
    </div>
  );
}
