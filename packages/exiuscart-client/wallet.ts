import { storeUrl } from "./config";

export interface WalletTransaction {
  // ExiusCart's real /wallet response sends no id on a transaction at all
  // (confirmed via a live authenticated call this session) — every other
  // field here is real, this one just doesn't exist on their side. Callers
  // use the array index as a React key instead of pretending one exists.
  amount: number;
  type: "credit" | "debit";
  description: string;
  createdAt: string | null;
}

export interface Wallet {
  balance: number;
  currency: string;
  transactions: WalletTransaction[];
}

// ExiusCart's real shape is snake_case on transactions (created_at) — this
// endpoint is live and working (confirmed via a real signup + authenticated
// call this session: real $0.00/no-transactions for a fresh account, which
// is the honest correct state since no payment gateway is connected yet,
// so no real cashback has ever been credited to anyone).
interface RawWalletTransaction {
  amount: number;
  type: "credit" | "debit";
  description: string;
  created_at: string | null;
}

interface RawWallet {
  balance: number;
  currency: string;
  transactions: RawWalletTransaction[];
}

function mapWallet(raw: RawWallet): Wallet {
  return {
    balance: raw.balance,
    currency: raw.currency,
    transactions: raw.transactions.map((t) => ({
      amount: t.amount,
      type: t.type,
      description: t.description,
      createdAt: t.created_at,
    })),
  };
}

// Authenticated — needs the token returned by signIn()/signUp(), forwarded
// via the httpOnly session cookie (see lib/session.ts on the website side).
export async function getWallet(token: string): Promise<Wallet> {
  const res = await fetch(storeUrl("/wallet"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load wallet: ${res.status}`);
  return mapWallet(await res.json());
}

export interface WalletSettings {
  isEnabled: boolean;
  cashbackPercent: number;
}

// No-auth, real seller-set rate — added to ExiusCart specifically so the
// site's "X% back" copy (product pages, wallet page, signup) stops being a
// hardcoded guess. Revalidated hourly: a real rate change shouldn't need a
// redeploy, but it also doesn't need to be live-fresh on every request.
export async function getWalletSettings(): Promise<WalletSettings> {
  const res = await fetch(storeUrl("/wallet-settings"), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Failed to load wallet settings: ${res.status}`);
  const raw = await res.json();
  return { isEnabled: raw.is_enabled, cashbackPercent: raw.cashback_percent };
}

export type PayoutRequestStatus = "pending" | "approved" | "paid" | "rejected";

export interface PayoutRequest {
  id: string;
  amount: number;
  currency: string;
  paypalEmail: string;
  status: PayoutRequestStatus;
  createdAt: string;
}

interface RawPayoutRequest {
  id: number;
  amount: number;
  currency: string;
  paypal_email: string;
  status: PayoutRequestStatus;
  created_at: string;
}

function mapPayoutRequest(raw: RawPayoutRequest): PayoutRequest {
  return {
    id: String(raw.id),
    amount: raw.amount,
    currency: raw.currency,
    paypalEmail: raw.paypal_email,
    status: raw.status,
    createdAt: raw.created_at,
  };
}

// What a withdrawal request tells ExiusCart, so the seller's wallet page
// in ExiusCart can show who asked, what they had, and where to send it.
// The customer/balance fields are informational for the seller's list —
// ExiusCart must still trust only the Bearer token for who the customer
// is, and re-check amount <= real balance and amount >= its minimum.
export interface PayoutRequestPayload {
  amount: number;
  paypalEmail: string;
  customer: { id: string; name: string; email: string };
  balanceAtRequest: number;
  currency: string;
}

// NOT LIVE YET — POST /wallet/payout-requests → the created request
// (status "pending"). ExiusCart should hold the amount (debit or reserve
// it) so the same balance can't be requested twice.
export async function requestPayout(token: string, payload: PayoutRequestPayload): Promise<PayoutRequest> {
  const res = await fetch(storeUrl("/wallet/payout-requests"), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: payload.amount,
      paypal_email: payload.paypalEmail,
      customer_id: payload.customer.id,
      customer_name: payload.customer.name,
      customer_email: payload.customer.email,
      balance_at_request: payload.balanceAtRequest,
      currency: payload.currency,
    }),
  });
  if (!res.ok) {
    let message = `Withdrawal request failed: ${res.status}`;
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") message = body.detail;
      else if (typeof body?.detail?.message === "string") message = body.detail.message;
    } catch {}
    throw new Error(message);
  }
  return mapPayoutRequest(await res.json());
}

// NOT LIVE YET — GET /wallet/payout-requests → this customer's requests,
// newest first, so the wallet page can show pending/paid status.
export async function getPayoutRequests(token: string): Promise<PayoutRequest[]> {
  const res = await fetch(storeUrl("/wallet/payout-requests"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load payout requests: ${res.status}`);
  const raw: RawPayoutRequest[] = await res.json();
  return raw.map(mapPayoutRequest);
}
