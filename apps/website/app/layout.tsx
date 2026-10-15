import type { Metadata } from "next";
import localFont from "next/font/local";
import { Navbar } from "@/components/layout/navbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Footer } from "@/components/layout/footer";
import { AddedNotification } from "@/components/shared/added-notification";
import { TrackingScripts } from "@/components/shared/tracking-scripts";
import { PageViewTracker } from "@/components/shared/page-view-tracker";
import { SitePopups } from "@/components/marketing/site-popups";
import { getCategories, type Category } from "@odtsi/exiuscart-client";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
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
  metadataBase: new URL(SITE_URL),
  // Pages set a short title; the template adds the brand once.
  title: {
    default: "ODTSI — Trending Products & Gifts, Shipped to the US, UK & Europe",
    template: "%s | ODTSI",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    alternateLocale: ["en_GB", "en_IE", "en_CA", "en_AU"],
    url: SITE_URL,
    images: ["/hero-halloween.png"],
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  // Paste the codes from Google Search Console / Bing Webmaster Tools
  // into these env vars to verify ownership — no code change needed.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
};

const SITE_JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": `${SITE_URL}/#store`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    email: "enquery@odtsi.com",
    areaServed: ["US", "GB", "IE", "DE", "FR", "NL", "ES", "IT", "CA", "AU"],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#store` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  },
];

async function loadCategories(): Promise<Category[]> {
  try {
    return await getCategories();
  } catch {
    return [];
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
        <PageViewTracker />
        <SitePopups />
        <JsonLd data={SITE_JSON_LD} />
      </body>
    </html>
  );
}
