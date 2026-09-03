"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, Loader2 } from "lucide-react";
import { getProducts, type Product } from "@odtsi/exiuscart-client";
import { Price } from "@/components/shared/price";
import { displayPrice } from "@/lib/product-price";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;
const MAX_SUGGESTIONS = 6;

// Live search-as-you-type dropdown — real matches from ExiusCart's own
// `search` param (confirmed live, not a client-side guess over cached
// products), same shared component used for both the desktop pill and the
// mobile full-width bar.
export function SearchBar({ size = "base" }: { size?: "base" | "sm" }) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const products = await getProducts({ search: trimmed });
        if (!cancelled) setResults(products.slice(0, MAX_SUGGESTIONS));
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function goToResults() {
    const trimmed = query.trim();
    if (!trimmed) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    goToResults();
  }

  const showDropdown = open && query.trim().length >= MIN_QUERY_LENGTH;

  return (
    <div ref={containerRef} className="relative flex-1">
      <form onSubmit={handleSubmit} className="flex h-full items-stretch overflow-hidden rounded-full bg-white/90">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search products..."
          className={`flex-1 bg-transparent px-4 text-primary outline-none placeholder:text-primary/50 ${
            size === "sm" ? "text-sm" : "text-base"
          }`}
        />
        <button
          type="submit"
          aria-label="Search"
          className={`flex items-center justify-center rounded-r-full bg-action text-action-ink ${size === "sm" ? "w-14" : "w-12"}`}
        >
          <Search size={size === "sm" ? 16 : 18} />
        </button>
      </form>

      {showDropdown && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl bg-white text-left shadow-[0_16px_40px_-12px_rgba(0,0,0,0.25)]">
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-[#8B8880]">
              <Loader2 size={16} className="animate-spin" />
              Searching...
            </div>
          ) : results && results.length > 0 ? (
            <>
              <ul className="max-h-[70vh] overflow-y-auto">
                {results.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/product/${product.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-[#F6F5F3]"
                    >
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-primary-light">
                        {product.imageUrl && (
                          <Image src={product.imageUrl} alt="" fill className="object-cover" />
                        )}
                      </div>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#16161A]">
                        {product.name}
                      </span>
                      <Price
                        amount={displayPrice(product)}
                        currency={product.currency}
                        className="shrink-0 text-sm font-extrabold text-primary"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={goToResults}
                className="w-full border-t border-black/5 px-4 py-3 text-center text-sm font-bold text-primary transition hover:bg-[#F6F5F3]"
              >
                See all results for &ldquo;{query.trim()}&rdquo;
              </button>
            </>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-[#8B8880]">
              No products found for &ldquo;{query.trim()}&rdquo;
            </p>
          )}
        </div>
      )}
    </div>
  );
}
