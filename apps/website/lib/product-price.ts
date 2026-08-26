import type { Product, ProductVariant } from "@odtsi/exiuscart-client";

// ExiusCart's flat product.price field isn't kept in sync with real variant
// prices — confirmed on a real product where price was $49.99 but every
// variant was either $41.96 or $61.03, none matching. Showing product.price
// on listing cards while the product page defaults to an arbitrary variant
// meant the two pages disagreed on price for the same item. Both now derive
// from the same real source: the cheapest in-stock variant, so they can
// never drift apart again.
export function cheapestVariant(product: Product): ProductVariant | null {
  if (product.variants.length === 0) return null;
  const inStock = product.variants.filter((v) => v.inStock);
  const pool = inStock.length > 0 ? inStock : product.variants;
  return pool.reduce((min, v) => (v.price < min.price ? v : min));
}

export function displayPrice(product: Product): number {
  return cheapestVariant(product)?.price ?? product.price;
}
