"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { lookupOrder, type Order } from "@odtsi/exiuscart-client";
import { getOrderRecords } from "@/lib/order-history";

// Where every real gateway (Stripe/Whop/PayPal) sends the shopper back
// after paying. We don't know the real order number at the point we had
// to choose this URL (ExiusCart generates it as part of the same call
// that returns the payment redirect), so it isn't in the query string —
// the most recently saved order record (set right before the redirect
// out to the gateway) is the real source of truth here instead.
//
// The order itself only flips from "pending" to "confirmed" once the
// gateway's webhook reaches ExiusCart — which can take a few seconds
// after the shopper lands back here, not necessarily before. Honest
// "still confirming" state while that catches up, with a real manual
// re-check rather than silently showing a stale status.
export default function CheckoutReturnPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "found" | "not-found" | "no-record">("loading");

  async function check(orderNumber: string, email: string) {
    setStatus("loading");
    try {
      const result = await lookupOrder(orderNumber, email);
      setOrder(result);
      setStatus("found");
    } catch {
      setStatus("not-found");
    }
  }

  useEffect(() => {
    const latest = getOrderRecords()[0];
    if (!latest) {
      setStatus("no-record");
      return;
    }
    setEmail(latest.email);
    check(latest.orderNumber, latest.email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "no-record") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-16 text-center sm:py-24">
        <h1 className="text-2xl font-extrabold text-[#16161A]">No recent order found</h1>
        <p className="mt-2 text-sm text-[#716D67]">
          If you just paid, check your email for a confirmation, or look up your order with its number.
        </p>
        <Link href="/account" className="mt-6 rounded-xl bg-action px-6 py-3 text-sm font-bold text-action-ink hover:brightness-95">
          Track an Order
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 py-16 text-center sm:py-24">
      {status === "found" && order?.status !== "pending" ? (
        <>
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-status/10 text-status">
            <CheckCircle2 size={28} />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold text-[#16161A] sm:text-3xl">Payment confirmed</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#716D67]">
            Order <span className="font-bold text-[#16161A]">{order?.orderNumber}</span> is confirmed. A receipt is on
            its way to your email.
          </p>
        </>
      ) : (
        <>
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
            <Clock size={28} />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold text-[#16161A] sm:text-3xl">Confirming your payment</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#716D67]">
            {status === "loading" && "Checking your order..."}
            {status === "not-found" &&
              "We couldn't look this order up just yet — this can happen for a few seconds right after paying."}
            {status === "found" &&
              order?.status === "pending" &&
              `Order ${order.orderNumber} is still showing as pending — confirmation usually lands within a few seconds of a real payment.`}
          </p>
          {email && (
            <button
              type="button"
              onClick={() => {
                const latest = getOrderRecords()[0];
                if (latest) check(latest.orderNumber, latest.email);
              }}
              className="mt-5 flex items-center gap-2 rounded-xl border border-black/10 px-5 py-2.5 text-sm font-bold text-[#16161A] transition hover:border-black/20"
            >
              <RefreshCw size={15} />
              Check again
            </button>
          )}
        </>
      )}

      <Link href="/" className="mt-6 text-sm font-bold text-primary hover:underline">
        Continue shopping
      </Link>
    </div>
  );
}
