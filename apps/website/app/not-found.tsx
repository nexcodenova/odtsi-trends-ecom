import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex flex-col items-center px-5 py-24 text-center sm:py-32">
      {/* Placeholder wordmark — swap for the real ODTSI logo once it's ready */}
      <span className="text-2xl font-extrabold tracking-tight text-primary">ODTSI</span>

      <p className="mt-8 text-sm font-bold uppercase tracking-widest text-[#8B8880]">404</p>
      <h1 className="mt-3 max-w-md text-2xl font-extrabold leading-tight text-[#16161A] sm:text-3xl">
        This page hasn&apos;t landed yet
      </h1>
      <p className="mt-3 max-w-sm text-sm text-[#716D67] sm:text-base">
        The page you're looking for doesn't exist, or it's still being built. Let's get you back to something trending.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
