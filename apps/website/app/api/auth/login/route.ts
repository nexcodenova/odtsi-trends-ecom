import { NextResponse } from "next/server";
import { signIn } from "@odtsi/exiuscart-client";
import { SESSION_COOKIE, sessionCookieOptions, type Session } from "@/lib/session";

// This route exists so the ExiusCart token never reaches client JS — the
// browser calls this, not signIn() directly, and only gets an httpOnly
// cookie back, never the token itself.
export async function POST(request: Request) {
  const { email, password } = await request.json();

  let result;
  try {
    result = await signIn({ email, password });
  } catch (err) {
    // Real failure from ExiusCart (wrong password, endpoint down, etc.) —
    // forwarded as-is, not a generic "not connected" message.
    const message = err instanceof Error ? err.message : "Something went wrong — try again.";
    return NextResponse.json({ error: message }, { status: 401 });
  }

  const session: Session = { token: result.token, customer: result.customer };
  const response = NextResponse.json({ customer: result.customer });
  response.cookies.set(SESSION_COOKIE, JSON.stringify(session), sessionCookieOptions());
  return response;
}
