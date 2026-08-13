import type { Product } from "@odtsi/exiuscart-client";
import { ProductCard } from "@/components/product/product-card";

// Mobile: plain 2-column grid, wraps line by line — no horizontal scroll.
// sm and up: horizontal scroll carousel, native swipe/trackpad/drag through
// the row instead of arrow buttons. Every real product is here either way,
// not capped at any count.
export function ProductCarousel({ products }: { products: Product[] }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:hidden">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="hidden gap-4 overflow-x-auto scroll-smooth pb-1 sm:flex">
        {products.map((product) => (
          <div key={product.id} className="w-[220px] flex-shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </>
  );
}
