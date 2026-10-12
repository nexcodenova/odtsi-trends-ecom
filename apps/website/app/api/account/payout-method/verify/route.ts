import { NextResponse } from "next/server";
import { verifyPayoutMethod } from "@odtsi/exiuscart-client";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { code } = await request.json();
  if (typeof code !== "string" || !code.trim()) {
    return NextResponse.json({ error: "Enter the code from your email." }, { status: 400 });
  }

  try {
    await verifyPayoutMethod(session.token, code.trim());
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong — try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
