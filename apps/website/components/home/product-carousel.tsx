import type { Product } from "@odtsi/exiuscart-client";
import { ProductCard } from "@/components/product/product-card";

// Mobile: 2-column grid. sm/md: 4-column. lg and up: 6-column. All of
// these wrap line by line — no horizontal scroll anywhere. Every real
// product is here either way, not capped at any count.
export function ProductCarousel({
  products,
  compact,
  sale,
}: {
  products: Product[];
  compact?: boolean;
  sale?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} compact={compact} sale={sale} />
      ))}
    </div>
  );
}
