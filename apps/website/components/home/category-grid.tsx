"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Category } from "@odtsi/exiuscart-client";

interface CategoryGridProps {
  categories: Category[];
}

// Columns and rows per breakpoint — kept in one place so the grid's CSS and
// the pagination math can never drift apart like they did before (columns
// were set in Tailwind classes while row-slicing assumed a different count).
const BREAKPOINTS = [
  { minWidth: 768, columns: 10, rows: 2 }, // md and up
  { minWidth: 640, columns: 8, rows: 2 }, // sm
];
// Always matches (minWidth 0) — the guaranteed fallback below 640px, kept
// separate from BREAKPOINTS so its type isn't "possibly undefined" like an
// array-index fallback would be.
const MOBILE_GRID = { minWidth: 0, columns: 4, rows: 3 };

function getGridConfig(width: number) {
  return BREAKPOINTS.find((bp) => width >= bp.minWidth) ?? MOBILE_GRID;
}

export function CategoryGrid({ categories: allCategories }: CategoryGridProps) {
  // The API returns all 3 levels (Main/Sub/Sub-sub) flattened together —
  // the homepage grid is Main-level only, sub-categories live on the
  // category page instead.
  const categories = allCategories.filter((c) => c.parentId === null);

  const [page, setPage] = useState(0);
  // Mobile-first default so server and first client render match (no layout jump).
  const [{ columns, rows }, setGrid] = useState({ columns: 4, rows: 3 });

  useEffect(() => {
    function update() {
      setGrid(getGridConfig(window.innerWidth));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const perPage = columns * rows;
  const totalPages = Math.ceil(categories.length / perPage);
  const visible = categories.slice(page * perPage, page * perPage + perPage);

  const isLastPage = page === totalPages - 1;

  // One button, fixed on the right — it just flips direction depending on
  // whether there's more to see (points right) or you're at the end and
  // this click takes you back (points left).
  function handleArrowClick() {
    setPage((p) => (isLastPage ? p - 1 + totalPages : p + 1) % totalPages);
  }

  return (
    <section className="relative px-4 py-4 sm:px-5 sm:py-5">
      <div
        className={`grid gap-x-3 gap-y-4 ${totalPages > 1 ? "sm:pr-14" : ""}`}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, auto)` }}
      >
        {visible.map((category) => (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className="flex flex-col items-center gap-2 text-center"
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

      {totalPages > 1 && (
        <button
          type="button"
          onClick={handleArrowClick}
          aria-label={isLastPage ? "Show previous categories" : "Show more categories"}
          className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white shadow-md sm:right-5"
        >
          {isLastPage ? <ChevronLeft size={18} className="text-primary" /> : <ChevronRight size={18} className="text-primary" />}
        </button>
      )}
    </section>
  );
}
