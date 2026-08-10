import { storeUrl } from "./config";

export interface WalletTransaction {
  id: string;
  amount: number;
  type: "credit" | "debit";
  description: string;
  createdAt: string;
}

export interface Wallet {
  balance: number;
  currency: string;
  transactions: WalletTransaction[];
}

// Authenticated — needs the token returned by signIn()/signUp(). No token
// storage exists yet on ODTSI's side (that's the httpOnly-cookie piece
// still to build), so nothing calls this yet — but the endpoint itself is
// now complete and matches ExiusCart's real one.
export async function getWallet(token: string): Promise<Wallet> {
  const res = await fetch(storeUrl("/wallet"), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed to load wallet: ${res.status}`);
  return res.json();
}
