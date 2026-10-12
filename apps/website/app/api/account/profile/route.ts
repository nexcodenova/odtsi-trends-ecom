import { NextResponse } from "next/server";
import { updateProfile } from "@odtsi/exiuscart-client";
import { getSession, SESSION_COOKIE, sessionCookieOptions, type Session } from "@/lib/session";

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { name, email, phone, currentPassword } = await request.json();
  if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "Name and email are both required." }, { status: 400 });
  }
  const emailChanged = email.trim().toLowerCase() !== session.customer.email.toLowerCase();
  if (emailChanged && (typeof currentPassword !== "string" || !currentPassword)) {
    return NextResponse.json({ error: "Enter your current password to change your email." }, { status: 400 });
  }

  let result;
  try {
    result = await updateProfile(session.token, {
      name: name.trim(),
      // Only sent when it actually changed — ExiusCart starts a
      // verification for any email it's given.
      email: emailChanged ? email.trim() : undefined,
      phone: typeof phone === "string" ? phone.trim() : undefined,
      currentPassword: emailChanged ? currentPassword : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong — try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // The session cookie carries the name/email the header and account page
  // show, so it's rewritten with ExiusCart's confirmed values. A new email
  // isn't in here yet — it only switches once the code is verified.
  const updated: Session = { token: session.token, customer: result.customer };
  const response = NextResponse.json(result);
  response.cookies.set(SESSION_COOKIE, JSON.stringify(updated), sessionCookieOptions());
  return response;
}
