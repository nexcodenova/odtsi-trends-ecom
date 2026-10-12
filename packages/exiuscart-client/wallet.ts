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
  // Reserved by pending withdrawals — not spendable, not in balance.
  onHold: number;
  currency: string;
  withdrawalsEnabled: boolean;
  transactions: WalletTransaction[];
}

// ExiusCart's real shape is snake_case on transactions (created_at) —
// confirmed live 2026-10-12.
interface RawWalletTransaction {
  amount: number;
  type: "credit" | "debit";
  description: string;
  created_at: string | null;
}

interface RawWallet {
  balance: number;
  on_hold?: number;
  currency: string;
  withdrawals_enabled?: boolean;
  transactions: RawWalletTransaction[];
}

function mapWallet(raw: RawWallet): Wallet {
  return {
    balance: raw.balance,
    onHold: raw.on_hold ?? 0,
    currency: raw.currency,
    withdrawalsEnabled: raw.withdrawals_enabled ?? false,
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
  withdrawals: {
    enabled: boolean;
    minAmount: number;
    currency: string;
    methods: string[];
    // How long withdrawals pause after a payout method is changed.
    payoutChangeHoldHours: number;
  };
}

// No-auth, real seller-set rate and withdrawal rules. Revalidated hourly:
// a real change shouldn't need a redeploy, but it also doesn't need to be
// live-fresh on every request.
export async function getWalletSettings(): Promise<WalletSettings> {
  const res = await fetch(storeUrl("/wallet-settings"), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Failed to load wallet settings: ${res.status}`);
  const raw = await res.json();
  const w = raw.withdrawals ?? {};
  return {
    isEnabled: raw.is_enabled,
    cashbackPercent: raw.cashback_percent,
    withdrawals: {
      enabled: w.enabled ?? false,
      minAmount: w.min_amount ?? 0,
      currency: w.currency ?? "USD",
      methods: (w.methods ?? []).map((m: string | { key: string }) => (typeof m === "string" ? m : m.key)),
      payoutChangeHoldHours: w.payout_change_hold_hours ?? 0,
    },
  };
}

export type PayoutRequestStatus = "pending" | "approved" | "paid" | "rejected" | "cancelled";

export interface PayoutRequest {
  id: string;
  amount: number;
  currency: string;
  // Where it's being paid — e.g. "PayPal · jane@example.com".
  destination: string | null;
  status: PayoutRequestStatus;
  rejectReason: string | null;
  createdAt: string | null;
}

interface RawPayoutRequest {
  id: number;
  amount: number;
  currency: string;
  status: PayoutRequestStatus;
  reject_reason?: string | null;
  created_at?: string | null;
  method?: string | null;
  method_label?: string | null;
  account?: string | null;
  paypal_email?: string | null;
}

function mapPayoutRequest(raw: RawPayoutRequest): PayoutRequest {
  const account = raw.account ?? raw.paypal_email ?? null;
  const label = raw.method_label ?? raw.method ?? null;
  return {
    id: String(raw.id),
    amount: raw.amount,
    currency: raw.currency,
    destination: account ? (label ? `${label} · ${account}` : account) : null,
    status: raw.status,
    rejectReason: raw.reject_reason ?? null,
    createdAt: raw.created_at ?? null,
  };
}

async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.detail === "string") return body.detail;
    if (typeof body?.detail?.message === "string") return body.detail.message;
  } catch {}
  return fallback;
}

// POST /wallet/payout-requests { amount } → the created request. The
// customer, currency and payout address come from the token on
// ExiusCart's side, never the body. The amount goes on hold.
export async function requestPayout(token: string, amount: number): Promise<PayoutRequest> {
  const res = await fetch(storeUrl("/wallet/payout-requests"), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, `Withdrawal request failed: ${res.status}`));
  return mapPayoutRequest(await res.json());
}

// GET /wallet/payout-requests → this customer's requests, newest first.
export async function getPayoutRequests(token: string): Promise<PayoutRequest[]> {
  const res = await fetch(storeUrl("/wallet/payout-requests"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load payout requests: ${res.status}`);
  const raw: RawPayoutRequest[] = await res.json();
  return raw.map(mapPayoutRequest);
}

// Only while still pending — the amount returns to the wallet.
export async function cancelPayoutRequest(token: string, id: string): Promise<void> {
  const res = await fetch(storeUrl(`/wallet/payout-requests/${encodeURIComponent(id)}/cancel`), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, `Couldn't cancel withdrawal: ${res.status}`));
}
