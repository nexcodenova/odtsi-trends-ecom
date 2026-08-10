"use client";

import { useState } from "react";
import type { Product } from "@odtsi/exiuscart-client";
import { ProductCard } from "@/components/product/product-card";

const PAGE_SIZE = 40;

export function ShopGrid({ products }: { products: Product[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visible = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="rounded-xl border-2 border-primary px-8 py-3 text-sm font-extrabold text-primary transition hover:bg-primary hover:text-white"
          >
            Load More ({products.length - visibleCount} left)
          </button>
        </div>
      )}
    </div>
  );
}
