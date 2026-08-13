import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CurrencyProvider } from "@/hooks/use-currency";
import { AddedNotification } from "@/components/shared/added-notification";
import { getCategories, type Category } from "@odtsi/exiuscart-client";
import { PLACEHOLDER_CATEGORIES } from "@/lib/placeholder-data";
import "./globals.css";

// Self-hosted via next/font — no runtime request to Google, no layout
// shift. Applied on <body> so it's the site-wide default everywhere,
// not just patched into one component.
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

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
      <body className={plusJakarta.className}>
        <CurrencyProvider>
          <Navbar categories={categories} />
          <main>{children}</main>
          <Footer />
          <AddedNotification />
        </CurrencyProvider>
      </body>
    </html>
  );
}
