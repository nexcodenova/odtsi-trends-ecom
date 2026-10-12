import { NextResponse } from "next/server";
import { updateProfile } from "@odtsi/exiuscart-client";
import { getSession, SESSION_COOKIE, sessionCookieOptions, type Session } from "@/lib/session";

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { name, email } = await request.json();
  if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "Name and email are both required." }, { status: 400 });
  }

  let customer;
  try {
    customer = await updateProfile(session.token, { name: name.trim(), email: email.trim() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong — try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // The session cookie carries the name/email the header and account page
  // show, so it's rewritten with ExiusCart's confirmed values.
  const updated: Session = { token: session.token, customer };
  const response = NextResponse.json({ customer });
  response.cookies.set(SESSION_COOKIE, JSON.stringify(updated), sessionCookieOptions());
  return response;
}
