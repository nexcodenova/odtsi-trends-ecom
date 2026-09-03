import type { ReactNode } from "react";

// Shared wrapper for the legal pages (Privacy, Terms, Returns) — one
// consistent header/typography treatment instead of three separate ones.
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-5 sm:py-16">
      <p className="text-xs font-bold uppercase tracking-widest text-action">Legal</p>
      <h1 className="mt-2 text-3xl font-extrabold text-primary sm:text-4xl">{title}</h1>
      <p className="mt-2 text-xs text-[#8B8880]">Last updated: {updated}</p>

      <div className="prose-legal mt-10 flex flex-col gap-6 text-[15px] leading-relaxed text-[#4A4844] [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-extrabold [&_h2]:text-[#16161A] [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-relaxed [&_strong]:text-[#16161A] [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
        {children}
      </div>
    </div>
  );
}
