import { cookies } from "next/headers";
import type { AuthResult } from "@odtsi/exiuscart-client";

export const SESSION_COOKIE = "odtsi_session";

export interface Session {
  token: string;
  customer: AuthResult["customer"];
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  // Real HTTPS only in production — localhost dev has no TLS to require.
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

// Server-only — httpOnly means client JS can never read this token, which
// is the whole point (an XSS bug can't walk off with it like it could from
// localStorage). Only Server Components and Route Handlers call this.
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return COOKIE_OPTIONS;
}
