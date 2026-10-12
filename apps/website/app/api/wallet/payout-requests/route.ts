import { NextResponse } from "next/server";
import { getWallet, getPayoutMethod, requestPayout } from "@odtsi/exiuscart-client";
import { getSession } from "@/lib/session";
import { MIN_REDEEM_AMOUNT } from "@/lib/wallet-limits";

// Balance and PayPal account are read fresh from ExiusCart here, never
// taken from the browser — the shopper only chooses how much to withdraw.
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { amount } = await request.json();
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return NextResponse.json({ error: "Enter an amount to withdraw." }, { status: 400 });
  }

  let wallet, payoutMethod;
  try {
    [wallet, payoutMethod] = await Promise.all([getWallet(session.token), getPayoutMethod(session.token)]);
  } catch (err) {
    console.error("Failed to load wallet/payout method for withdrawal:", err);
    return NextResponse.json({ error: "Couldn't check your balance right now — try again shortly." }, { status: 502 });
  }

  if (!payoutMethod.paypalEmail) {
    return NextResponse.json({ error: "Save your PayPal account on your account page first." }, { status: 400 });
  }
  if (amount < MIN_REDEEM_AMOUNT) {
    return NextResponse.json({ error: `The minimum withdrawal is $${MIN_REDEEM_AMOUNT}.` }, { status: 400 });
  }
  if (amount > wallet.balance) {
    return NextResponse.json({ error: "That's more than your wallet balance." }, { status: 400 });
  }

  try {
    const payout = await requestPayout(session.token, {
      amount: Math.round(amount * 100) / 100,
      paypalEmail: payoutMethod.paypalEmail,
      customer: session.customer,
      balanceAtRequest: wallet.balance,
      currency: wallet.currency,
    });
    return NextResponse.json(payout);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong — try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
