import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Real max discount and deal count, computed by the page from the same
// products actually listed below — no invented "up to 82%" that doesn't
// match what's really in the grid. No fake urgency either ("limited time",
// a countdown) since there's no real end date behind this page.
export function OnSaleHero({ maxDiscountPct, dealCount }: { maxDiscountPct: number; dealCount: number }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1B4D] via-[#16234F] to-[#C99200] px-6 py-5 sm:px-8 sm:py-7">
      <div className="absolute -right-10 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-white/5 sm:h-72 sm:w-72" />
      <div className="absolute right-16 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-white/5 sm:h-40 sm:w-40" />

      <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-action">Real Discounts, No Gimmicks</p>
          <h1 className="mt-1.5 max-w-md text-2xl font-extrabold leading-tight text-white sm:text-3xl">
            The sale worth scrolling for.
          </h1>
          <p className="mt-1.5 max-w-sm text-sm text-white/70">
            {dealCount} real {dealCount === 1 ? "product" : "products"} discounted right now. Prices shown are exactly what you&apos;ll pay.
          </p>
          <Link
            href="#deals"
            className="mt-3.5 inline-flex items-center gap-2 rounded-full bg-action px-6 py-2.5 text-sm font-extrabold text-action-ink transition hover:brightness-95"
          >
            Shop all deals
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xl font-extrabold uppercase tracking-wide text-white sm:text-2xl">Up to</p>
          <p className="text-4xl font-extrabold leading-tight text-action sm:text-5xl">{maxDiscountPct}% OFF</p>
        </div>
      </div>
    </div>
  );
}
