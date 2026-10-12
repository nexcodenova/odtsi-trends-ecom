import { NextResponse } from "next/server";
import { savePayoutMethod } from "@odtsi/exiuscart-client";
import { getSession } from "@/lib/session";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { paypalEmail } = await request.json();
  if (typeof paypalEmail !== "string" || !EMAIL_PATTERN.test(paypalEmail.trim())) {
    return NextResponse.json({ error: "Enter the email address of your PayPal account." }, { status: 400 });
  }

  try {
    const method = await savePayoutMethod(session.token, paypalEmail.trim());
    return NextResponse.json(method);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong — try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
