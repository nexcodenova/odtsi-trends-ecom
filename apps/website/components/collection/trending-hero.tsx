import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Real product count and real top view count, both computed by the page
// from the same products listed below — no invented "going viral" framing,
// just what customers actually looked at.
export function TrendingHero({ productCount, topViewCount }: { productCount: number; topViewCount: number }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5A1A0B] via-[#7A2A12] to-[#C94E22] px-6 py-5 sm:px-8 sm:py-7 lg:py-10">
      <div className="absolute -right-10 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-white/5 sm:h-72 sm:w-72" />
      <div className="absolute right-16 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-white/5 sm:h-40 sm:w-40" />

      <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-action">Real Views, No Guesswork</p>
          <h1 className="mt-1.5 max-w-md text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl">
            What everyone&apos;s actually buying.
          </h1>
          <p className="mt-1.5 max-w-sm text-sm text-white/70">
            {productCount} real {productCount === 1 ? "product" : "products"} ranked by genuine customer views — no
            fabricated trend score.
          </p>
          <Link
            href="#trending"
            className="mt-3.5 inline-flex items-center gap-2 rounded-full bg-action px-6 py-2.5 text-sm font-extrabold text-action-ink transition hover:brightness-95"
          >
            Shop what&apos;s trending
            <ArrowRight size={16} />
          </Link>
        </div>

        {topViewCount > 0 && (
          <div className="shrink-0 self-end text-right sm:self-auto">
            <p className="text-xl font-extrabold uppercase tracking-wide text-white sm:text-2xl">Top item</p>
            <p className="text-4xl font-extrabold leading-tight text-action sm:text-5xl lg:text-6xl">
              {topViewCount.toLocaleString()}
            </p>
            <p className="text-xs font-bold uppercase tracking-wide text-white/70">real views</p>
          </div>
        )}
      </div>
    </div>
  );
}
