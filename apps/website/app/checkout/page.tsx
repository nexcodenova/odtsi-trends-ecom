import { getWallet } from "@odtsi/exiuscart-client";
import { CheckoutContent } from "@/components/checkout/checkout-content";
import { getSession } from "@/lib/session";

// Entirely derived from localStorage at runtime — a static shell has
// nothing real to show, so skip prerendering it at build time. Has to live
// in this server wrapper: Next.js ignores this export in a "use client" file.
export const dynamic = "force-dynamic";

// Signed-in shoppers get their details prefilled and can put their real
// wallet balance toward the order. The balance shown is only a preview —
// ExiusCart caps the amount at their real balance at checkout.
async function loadWalletBalance(token: string): Promise<{ balance: number; currency: string } | null> {
  try {
    const wallet = await getWallet(token);
    return { balance: wallet.balance, currency: wallet.currency };
  } catch (err) {
    console.error("Failed to load wallet for checkout:", err);
    return null;
  }
}

export default async function CheckoutPage() {
  const session = await getSession();
  const wallet = session ? await loadWalletBalance(session.token) : null;

  return <CheckoutContent customer={session?.customer ?? null} wallet={wallet} />;
}
