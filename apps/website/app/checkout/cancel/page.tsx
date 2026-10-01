import Link from "next/link";
import { XCircle } from "lucide-react";

// Where the gateway sends the shopper back if they back out of paying.
// The order ExiusCart created still exists (as "pending" — nothing
// deletes it), but nothing here claims it was cancelled server-side,
// since this page can't know that for certain, only that the shopper
// didn't complete the gateway's own payment page.
export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 py-16 text-center sm:py-24">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FEE2E2] text-[#B9412E]">
        <XCircle size={28} />
      </span>
      <h1 className="mt-5 text-2xl font-extrabold text-[#16161A] sm:text-3xl">Payment cancelled</h1>
      <p className="mt-3 text-sm leading-relaxed text-[#716D67]">
        No charge was made. If this was a mistake, you can place your order again.
      </p>
      <Link
        href="/cart"
        className="mt-6 rounded-xl bg-action px-6 py-3 text-sm font-bold text-action-ink transition hover:brightness-95"
      >
        Back to Cart
      </Link>
    </div>
  );
}
