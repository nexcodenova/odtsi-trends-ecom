import { NextResponse } from "next/server";
import { cancelPayoutRequest } from "@odtsi/exiuscart-client";
import { getSession } from "@/lib/session";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { id } = await params;
  try {
    await cancelPayoutRequest(session.token, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong — try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
