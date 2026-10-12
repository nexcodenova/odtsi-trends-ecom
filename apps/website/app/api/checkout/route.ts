import { NextResponse } from "next/server";
import { createCheckout, type CheckoutPayload } from "@odtsi/exiuscart-client";
import { getSession } from "@/lib/session";

// Checkout goes through here, not straight from the browser, so a
// signed-in shopper's token can be attached for wallet spending without
// ever reaching client JS. Guests work the same, just without a token.
export async function POST(request: Request) {
  const payload: CheckoutPayload = await request.json();
  const session = await getSession();

  if (payload.useWalletAmount && !session) {
    return NextResponse.json({ error: "Sign in to use your wallet balance." }, { status: 401 });
  }

  try {
    const result = await createCheckout(payload, session?.token);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong — try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
