import Link from "next/link";
import Image from "next/image";
import { getCategories, type Category } from "@odtsi/exiuscart-client";

async function loadCategories(): Promise<Category[]> {
  try {
    const categories = await getCategories();
    return categories.filter((c) => c.parentId === null);
  } catch (err) {
    console.error("[category-index]", err);
    return [];
  }
}

export default async function CategoryIndexPage() {
  const categories = await loadCategories();

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-5">
      <h1 className="text-2xl font-extrabold text-[#16161A] sm:text-3xl">All Categories</h1>

      {categories.length > 0 ? (
        <div className="mt-8 grid grid-cols-3 gap-x-4 gap-y-7 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="flex flex-col items-center gap-2.5 text-center"
            >
              <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary-light">
                {category.imageUrl ? (
                  <Image src={category.imageUrl} alt="" width={80} height={80} className="h-full w-full object-cover" />
                ) : null}
              </span>
              <span className="text-xs font-semibold leading-tight text-[#3A3835] sm:text-sm">{category.name}</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-10 text-sm text-[#716D67]">No categories available right now — check back soon.</p>
      )}
    </div>
  );
}
