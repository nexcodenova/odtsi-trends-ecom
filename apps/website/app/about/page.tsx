import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-5 sm:py-16">
      <p className="text-xs font-bold uppercase tracking-widest text-action">About</p>
      <h1 className="mt-2 text-3xl font-extrabold text-primary sm:text-4xl">About ODTSI</h1>

      <div className="prose-legal mt-8 flex flex-col gap-5 text-[15px] leading-relaxed text-[#4A4844]">
        <p>
          ODTSI is a storefront for trending physical products, real digital downloads, and honest third-party
          picks we don&rsquo;t sell ourselves — all in one place.
        </p>
        <p>
          The site is operated by <strong className="text-[#16161A]">Fairam (Private) Limited</strong>, built and
          maintained by <strong className="text-[#16161A]">NexCode Nova</strong>, and runs on commerce
          infrastructure managed by <strong className="text-[#16161A]">ExiusCart Platforms</strong>.
        </p>
        <p>
          We care about showing real information — real stock, real view counts, real reviews once they exist —
          rather than inflated numbers or fabricated signals. If something can&rsquo;t be shown honestly, we leave
          it out rather than fake it.
        </p>
        <p>
          Questions? Visit our{" "}
          <Link href="/contact" className="font-bold text-primary underline-offset-2 hover:underline">
            Contact page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
