import { NextResponse } from "next/server";
import { signUp } from "@odtsi/exiuscart-client";
import { SESSION_COOKIE, sessionCookieOptions, type Session } from "@/lib/session";

export async function POST(request: Request) {
  const { name, email, password } = await request.json();

  let result;
  try {
    result = await signUp({ name, email, password });
  } catch (err) {
    // Real failure from ExiusCart (email already taken, endpoint down,
    // etc.) — forwarded as-is, not a generic "not connected" message.
    const message = err instanceof Error ? err.message : "Something went wrong — try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const session: Session = { token: result.token, customer: result.customer };
  const response = NextResponse.json({ customer: result.customer });
  response.cookies.set(SESSION_COOKIE, JSON.stringify(session), sessionCookieOptions());
  return response;
}
