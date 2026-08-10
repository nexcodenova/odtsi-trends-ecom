import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/product-card";
import { getCategories, getProducts, type Category, type Product } from "@odtsi/exiuscart-client";
import { getPlaceholderCategory } from "@/lib/placeholder-data";

async function loadCategory(slug: string): Promise<Category | null> {
  try {
    const categories = await getCategories();
    return categories.find((c) => c.slug === slug) ?? null;
  } catch {
    // ExiusCart's public /categories endpoint isn't live yet.
    return getPlaceholderCategory(slug) ?? null;
  }
}

async function loadProducts(slug: string): Promise<Product[]> {
  try {
    return await getProducts({ category: slug });
  } catch {
    // ExiusCart's public /products endpoint isn't live yet — no fake
    // products, just an honest empty state until it's deployed.
    return [];
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await loadCategory(slug);

  if (!category) {
    notFound();
  }

  const products = await loadProducts(slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-5">
      <nav className="text-xs text-[#8B8880]">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>{" "}
        / <span className="text-[#4A4844]">{category.name}</span>
      </nav>

      <h1 className="mt-2 text-2xl font-extrabold text-[#16161A] sm:text-3xl">{category.name}</h1>

      {products.length > 0 ? (
        <>
          <p className="mt-1 text-sm text-[#716D67]">{products.length} products</p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : (
        <p className="mt-10 text-sm text-[#716D67]">
          Products aren&apos;t connected yet — this page will show real {category.name.toLowerCase()} inventory once ExiusCart is live.
        </p>
      )}
    </div>
  );
}
