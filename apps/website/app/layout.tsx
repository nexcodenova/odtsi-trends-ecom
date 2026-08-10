import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CurrencyProvider } from "@/hooks/use-currency";
import { getCategories, type Category } from "@odtsi/exiuscart-client";
import { PLACEHOLDER_CATEGORIES } from "@/lib/placeholder-data";
import "./globals.css";

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
      <body>
        <CurrencyProvider>
          <Navbar categories={categories} />
          <main>{children}</main>
          <Footer />
        </CurrencyProvider>
      </body>
    </html>
  );
}
