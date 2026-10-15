import type { Metadata } from "next";
import { PRIVATE_PAGE } from "@/lib/site";
import { TrackOrder } from "@/components/account/track-order";

export const metadata: Metadata = PRIVATE_PAGE;

// Standalone guest-accessible version of the same real order lookup shown
// on the Account page — no sign-in required, matches a normal "Track My
// Order" footer link.
export default function OrderPage() {
  return (
    <div className="mx-auto max-w-lg px-5 py-10 sm:py-16">
      <h1 className="text-2xl font-extrabold text-[#16161A] sm:text-3xl">Track My Order</h1>
      <p className="mt-2 text-sm text-[#716D67]">Enter your order number and the email used at checkout.</p>

      <div className="mt-8">
        <TrackOrder />
      </div>
    </div>
  );
}
