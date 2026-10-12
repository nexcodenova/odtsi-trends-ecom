import { NextResponse } from "next/server";
import { verifyEmailChange } from "@odtsi/exiuscart-client";
import { getSession, SESSION_COOKIE, sessionCookieOptions, type Session } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { code } = await request.json();
  if (typeof code !== "string" || !code.trim()) {
    return NextResponse.json({ error: "Enter the code from your email." }, { status: 400 });
  }

  let customer;
  try {
    customer = await verifyEmailChange(session.token, code.trim());
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong — try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const updated: Session = { token: session.token, customer };
  const response = NextResponse.json({ customer });
  response.cookies.set(SESSION_COOKIE, JSON.stringify(updated), sessionCookieOptions());
  return response;
}
