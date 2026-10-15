import type { Metadata } from "next";
import { PRIVATE_PAGE } from "@/lib/site";

// Covers /checkout/return and /checkout/cancel too.
export const metadata: Metadata = PRIVATE_PAGE;

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
