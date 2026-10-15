import type { Metadata } from "next";

// Public origin used for canonical URLs, the sitemap, Open Graph and
// JSON-LD. Set NEXT_PUBLIC_SITE_URL on preview deploys so they don't
// claim to be the live site.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://odtsi.com").replace(/\/$/, "");
export const SITE_NAME = "ODTSI";
export const SITE_DESCRIPTION =
  "Shop trending lifestyle products, gifts and seasonal finds with fast delivery to the US, UK, Europe, Canada and Australia.";

// One English storefront serves every market, so each locale points at
// the same URL. This tells Google the page is meant for US, UK and EU
// shoppers instead of leaving it to guess from the server location.
const MARKET_LOCALES = ["en-US", "en-GB", "en-IE", "en-DE", "en-FR", "en-NL", "en-CA", "en-AU"] as const;

export function pageAlternates(path: string): Metadata["alternates"] {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  const languages: Record<string, string> = { "x-default": url };
  for (const locale of MARKET_LOCALES) languages[locale] = url;
  return { canonical: url, languages };
}

// Indexable page: canonical + hreflang + matching Open Graph.
export function pageMetadata({
  path,
  title,
  description,
  image,
}: {
  path: string;
  title: string | { absolute: string };
  description: string;
  image?: string;
}): Metadata {
  const socialTitle = typeof title === "string" ? title : title.absolute;
  return {
    title,
    description,
    alternates: pageAlternates(path),
    openGraph: {
      title: socialTitle,
      description,
      url: `${SITE_URL}${path}`,
      ...(image ? { images: [image] } : {}),
    },
    twitter: { title: socialTitle, description, ...(image ? { images: [image] } : {}) },
  };
}

// Account, cart, checkout and other per-user pages: kept out of search
// results but links on them are still followed.
export const PRIVATE_PAGE: Metadata = { robots: { index: false, follow: true } };
