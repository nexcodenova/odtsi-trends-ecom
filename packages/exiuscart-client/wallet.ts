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
