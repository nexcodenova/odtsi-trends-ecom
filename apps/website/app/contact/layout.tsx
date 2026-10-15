import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

// The contact page is a client component, so its metadata lives here.
export const metadata: Metadata = pageMetadata({
  path: "/contact",
  title: "Contact Us",
  description: "Questions about an order, shipping to the US, UK or Europe, or a return? Contact the ODTSI support team.",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
