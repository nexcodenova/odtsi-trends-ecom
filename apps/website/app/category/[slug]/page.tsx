import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/product-card";
import { getCategories, getProducts, type Category, type Product } from "@odtsi/exiuscart-client";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/json-ld";
import { SITE_URL, pageMetadata } from "@/lib/site";

// One fetch shared by generateMetadata and the page itself.
const loadCategory = cache(async (slug: string): Promise<Category | null> => {
  try {
    const categories = await getCategories();
    return categories.find((c) => c.slug === slug) ?? null;
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await loadCategory(slug);
  if (!category) return {};
  return pageMetadata({
    path: `/category/${category.slug}`,
    title: `${category.name} — Shop Online`,
    description: `Shop ${category.name} at ODTSI. Trending ${category.name.toLowerCase()} with fast delivery to the US, UK, Europe, Canada and Australia.`,
    image: category.imageUrl ?? undefined,
  });
}

async function loadProducts(slug: string): Promise<Product[]> {
  try {
    return await getProducts({ category: slug });
  } catch (err) {
    console.error("[category-page]", err);
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
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-5">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: category.name, url: `${SITE_URL}/category/${category.slug}` },
        ])}
      />
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
