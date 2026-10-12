import { NextResponse } from "next/server";
import { requestPayout } from "@odtsi/exiuscart-client";
import { getSession } from "@/lib/session";

// Only the amount is sent — ExiusCart takes the customer, currency and
// payout address from the token, and enforces balance, minimum, whether
// withdrawals are on, and any payout-change hold itself.
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { amount } = await request.json();
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Enter an amount to withdraw." }, { status: 400 });
  }

  try {
    const payout = await requestPayout(session.token, Math.round(amount * 100) / 100);
    return NextResponse.json(payout);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong — try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
