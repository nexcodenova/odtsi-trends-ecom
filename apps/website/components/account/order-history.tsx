"use client";

import { useEffect, useState } from "react";
import { lookupOrder, type Order } from "@odtsi/exiuscart-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Price } from "@/components/shared/price";
import { getOrderRecords } from "@/lib/order-history";
import { PackageX } from "lucide-react";

const STATUS_STYLE: Record<Order["status"], string> = {
  pending: "bg-[#FEF3C7] text-[#92400E]",
  confirmed: "bg-primary-light text-primary",
  processing: "bg-[#EDE9FE] text-[#5B21B6]",
  shipped: "bg-[#DBEAFE] text-[#1E40AF]",
  delivered: "bg-[#DCFCE7] text-[#166534]",
  cancelled: "bg-[#FEE2E2] text-[#991B1B]",
};

// ExiusCart has no "list my orders" endpoint — this remembers which real
// orders were placed from this browser (saved at checkout) and looks each
// one up for real via the same single-order endpoint Track Order uses. Not
// a full cross-device history, but every row shown here is a genuine,
// live-fetched order.
export function OrderHistory() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    const records = getOrderRecords();
    if (records.length === 0) {
      setOrders([]);
      return;
    }
    Promise.all(
      records.map((r) =>
        lookupOrder(r.orderNumber, r.email).catch(() => null),
      ),
    ).then((results) => setOrders(results.filter((o): o is Order => o !== null)));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>Orders placed from this device.</CardDescription>
      </CardHeader>
      <CardContent>
        {orders === null && <p className="text-sm text-[#8B8880]">Loading...</p>}

        {orders !== null && orders.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <PackageX size={24} className="text-[#8B8880]" />
            <p className="text-sm text-[#716D67]">No orders placed from this device yet.</p>
          </div>
        )}

        {orders !== null && orders.length > 0 && (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <div key={order.orderNumber} className="rounded-xl border border-black/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-extrabold text-[#16161A]">{order.orderNumber}</p>
                    <Price amount={order.total} currency={order.currency} className="text-sm text-[#716D67]" />
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${STATUS_STYLE[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                {/* Null until the seller marks the order shipped — not an error, just "not shipped yet". */}
                {order.trackingNumber && (
                  <p className="mt-2 border-t border-black/10 pt-2 text-xs text-[#716D67]">
                    Tracking: <span className="font-bold text-[#16161A]">{order.trackingNumber}</span>
                    {order.carrier && <span className="text-[#8B8880]"> via {order.carrier}</span>}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
