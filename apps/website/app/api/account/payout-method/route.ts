import { NextResponse } from "next/server";
import { savePayoutMethod } from "@odtsi/exiuscart-client";
import { getSession } from "@/lib/session";

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { method, account, accountName, currentPassword } = await request.json();
  if (typeof method !== "string" || !method) {
    return NextResponse.json({ error: "Choose a payout method." }, { status: 400 });
  }
  if (typeof account !== "string" || !account.trim()) {
    return NextResponse.json({ error: "Enter where the money should go." }, { status: 400 });
  }
  if (typeof currentPassword !== "string" || !currentPassword) {
    return NextResponse.json({ error: "Enter your current password to save this." }, { status: 400 });
  }

  // Which methods are allowed, and whether the account is valid for each,
  // is ExiusCart's call — its message comes back as-is.
  try {
    const result = await savePayoutMethod(session.token, {
      method,
      account: account.trim(),
      accountName: typeof accountName === "string" ? accountName.trim() : undefined,
      currentPassword,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong — try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
