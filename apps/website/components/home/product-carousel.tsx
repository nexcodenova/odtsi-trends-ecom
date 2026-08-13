import type { Product } from "@odtsi/exiuscart-client";
import { ProductCard } from "@/components/product/product-card";

// No arrow buttons — native swipe/trackpad/drag scroll through the row
// instead. Every real product is here, not capped at any count.
export function ProductCarousel({ products }: { products: Product[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto scroll-smooth pb-1">
      {products.map((product) => (
        <div key={product.id} className="w-[62%] flex-shrink-0 sm:w-[220px]">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
