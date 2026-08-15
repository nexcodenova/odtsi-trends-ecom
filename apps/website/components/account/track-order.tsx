"use client";

import { useState, type FormEvent } from "react";
import { lookupOrder, type Order } from "@odtsi/exiuscart-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Price } from "@/components/shared/price";

const STATUS_STYLE: Record<Order["status"], string> = {
  pending: "bg-[#FEF3C7] text-[#92400E]",
  paid: "bg-primary-light text-primary",
  shipped: "bg-[#DBEAFE] text-[#1E40AF]",
  delivered: "bg-[#DCFCE7] text-[#166534]",
  cancelled: "bg-[#FEE2E2] text-[#991B1B]",
};

// Real lookup only — order number + email match against ExiusCart, same
// as the guest tracking flow. There's no "list all my orders" endpoint on
// ExiusCart's side yet, so this is a single lookup, not a history list.
export function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [order, setOrder] = useState<Order | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setOrder(null);
    try {
      const result = await lookupOrder(orderNumber.trim(), email.trim());
      setOrder(result);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Track Order</CardTitle>
        <CardDescription>Enter your order number and the email used at checkout.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="order-number">Order Number</Label>
            <Input
              id="order-number"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. ODT-10234"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="order-email">Email</Label>
            <Input
              id="order-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          {status === "error" && (
            <p className="text-sm font-bold text-red-600">
              No order found with that order number and email — double check both and try again.
            </p>
          )}

          <Button type="submit" variant="action" disabled={status === "loading"}>
            {status === "loading" ? "Searching..." : "Track Order"}
          </Button>
        </form>

        {order && (
          <div className="mt-5 flex items-center justify-between rounded-xl border border-black/10 p-4">
            <div>
              <p className="text-sm font-extrabold text-[#16161A]">{order.orderNumber}</p>
              <Price amount={order.total} className="text-sm text-[#716D67]" />
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${STATUS_STYLE[order.status]}`}>
              {order.status}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
