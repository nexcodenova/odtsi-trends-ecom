import { NextResponse } from "next/server";
import { changePassword } from "@odtsi/exiuscart-client";
import { getSession, SESSION_COOKIE, sessionCookieOptions, type Session } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { currentPassword, newPassword } = await request.json();
  if (typeof currentPassword !== "string" || typeof newPassword !== "string" || newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  }

  let result;
  try {
    result = await changePassword(session.token, { currentPassword, newPassword });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong — try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // ExiusCart signs out every other device and retires the old token, so
  // the new one has to replace it here or this device is signed out too.
  const updated: Session = { token: result.token, customer: result.customer };
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, JSON.stringify(updated), sessionCookieOptions());
  return response;
}
