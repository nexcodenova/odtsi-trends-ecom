import type { Metadata } from "next";
import { PRIVATE_PAGE } from "@/lib/site";

export const metadata: Metadata = PRIVATE_PAGE;

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
