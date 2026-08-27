import Link from "next/link";
import { PackageSearch } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative flex flex-col items-center overflow-hidden px-5 py-24 text-center sm:py-32">
      {/* Soft glow behind the numeral — pure decoration, no interaction. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-action/25 blur-3xl sm:top-20 sm:h-96 sm:w-96"
      />

      <div className="relative flex items-center gap-1 sm:gap-3">
        <span className="text-[88px] font-extrabold leading-none tracking-tight text-primary sm:text-[150px]">
          4
        </span>

        {/* The "0" — a floating gold badge with a slow rotating dashed ring
            standing in for it, like a radar sweep still searching. */}
        <span className="relative flex h-[76px] w-[76px] flex-shrink-0 items-center justify-center sm:h-[130px] sm:w-[130px]">
          <span className="animate-spin-slow absolute inset-0 rounded-full border-2 border-dashed border-primary/25" />
          <span className="animate-float flex h-[58px] w-[58px] items-center justify-center rounded-full bg-gradient-to-br from-[#F6C935] to-[#C99200] shadow-[0_10px_30px_-8px_rgba(201,146,0,0.6)] sm:h-24 sm:w-24">
            <PackageSearch size={26} strokeWidth={1.75} className="text-[#16161A] sm:hidden" />
            <PackageSearch size={44} strokeWidth={1.75} className="hidden text-[#16161A] sm:block" />
          </span>
        </span>

        <span className="text-[88px] font-extrabold leading-none tracking-tight text-primary sm:text-[150px]">
          4
        </span>
      </div>

      <h1 className="relative mt-8 max-w-md text-2xl font-extrabold leading-tight text-[#16161A] sm:text-3xl">
        We looked everywhere, but this page is gone
      </h1>
      <p className="relative mt-3 max-w-sm text-sm text-[#716D67] sm:text-base">
        It might have sold out, moved, or never existed. Let&apos;s get you back to something trending.
      </p>

      <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-action px-6 py-3 text-sm font-bold text-action-ink transition hover:brightness-95"
        >
          Back to Homepage
        </Link>
        <Link
          href="/collection/trending"
          className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-hover"
        >
          Shop Trending Now
        </Link>
      </div>
    </section>
  );
}
