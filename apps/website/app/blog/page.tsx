import { Newspaper } from "lucide-react";

// ExiusCart's /blog endpoint is confirmed live but returns [] — no real
// post exists yet, and the field schema (title, cover image, body format,
// author, etc.) is undocumented until one does. Building against guessed
// field names would risk rendering garbage the moment a real post lands,
// so this stays an honest "nothing here yet" page until that's resolved.
export default function BlogPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-14 text-center sm:py-20">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
        <Newspaper size={28} />
      </span>
      <h1 className="mt-5 text-2xl font-extrabold text-[#16161A] sm:text-3xl">Blog</h1>
      <p className="mt-3 text-sm leading-relaxed text-[#716D67] sm:text-base">
        We haven&apos;t published anything yet — check back soon for guides, product picks, and updates from ODTSI.
      </p>
    </div>
  );
}
