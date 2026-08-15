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
