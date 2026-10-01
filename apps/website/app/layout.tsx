import type { Metadata } from "next";
import localFont from "next/font/local";
import { Navbar } from "@/components/layout/navbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Footer } from "@/components/layout/footer";
import { AddedNotification } from "@/components/shared/added-notification";
import { TrackingScripts } from "@/components/shared/tracking-scripts";
import { getCategories, type Category } from "@odtsi/exiuscart-client";
import { PLACEHOLDER_CATEGORIES } from "@/lib/placeholder-data";
import "./globals.css";

// The actual font file, downloaded once and committed to the repo
// (app/fonts/plus-jakarta-sans.woff2 — the real Google-served variable
// font, latin subset) instead of next/font/google fetching it live from
// Google at BUILD time. That live fetch is what broke Vercel's build
// (next/font/google's loader.js threw on a null response — a real
// network failure reaching Google from the build machine, confirmed not
// a code bug since the same build always succeeds locally). Self-hosting
// the file removes that network dependency entirely, not just at
// runtime (the old comment's claim) but at build time too.
const plusJakarta = localFont({
  src: "./fonts/plus-jakarta-sans.woff2",
  weight: "400 800",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ODTSI — Trending Finds, Delivered Fast",
  description: "Trending lifestyle products delivered fast across the UK, US, EU, Australia and Canada.",
};

async function loadCategories(): Promise<Category[]> {
  try {
    return await getCategories();
  } catch {
    return PLACEHOLDER_CATEGORIES;
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await loadCategories();

  return (
    <html lang="en">
      {/* pb-16 makes room at the bottom of the whole page (footer included)
          for the fixed mobile tab bar so it never covers real content —
          sm:pb-0 because the tab bar itself doesn't render at that width. */}
      <body className={`${plusJakarta.className} pb-16 sm:pb-0`}>
        <Navbar categories={categories} />
        <main>{children}</main>
        <Footer />
        <AddedNotification />
        <BottomNav categories={categories} />
        <TrackingScripts />
      </body>
    </html>
  );
}
