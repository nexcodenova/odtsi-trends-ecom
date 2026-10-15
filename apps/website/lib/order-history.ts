// ExiusCart has no "list my orders" endpoint — only a single order-number +
// email lookup. So "order history" here means: remember which real orders
// were placed from *this* browser, then look each one up for real. Not a
// full account-wide history (that needs ExiusCart to add the endpoint),
// but every entry shown is a genuine, live-looked-up order — nothing here
// is fabricated.

export interface OrderRecord {
  orderNumber: string;
  email: string;
  placedAt: string;
  // Set at submit, before the shopper leaves for the payment page, and
  // removed once the return page sees the order confirmed. The Purchase
  // pixel and the cart clear both wait for that, so a shopper who backs
  // out of paying keeps their cart and isn't counted as a sale.
  awaitingPayment?: {
    total: number;
    currency: string;
    source: "cart" | "buy-now";
  };
}

const HISTORY_KEY = "odtsi_order_history";

export function getOrderRecords(): OrderRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as OrderRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveOrderRecord(record: Omit<OrderRecord, "placedAt">) {
  const records = getOrderRecords();
  const withoutDupe = records.filter((r) => r.orderNumber !== record.orderNumber);
  withoutDupe.unshift({ ...record, placedAt: new Date().toISOString() });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(withoutDupe));
}

export function markOrderPaid(orderNumber: string) {
  const records = getOrderRecords().map((r) =>
    r.orderNumber === orderNumber ? { ...r, awaitingPayment: undefined } : r,
  );
  localStorage.setItem(HISTORY_KEY, JSON.stringify(records));
}
