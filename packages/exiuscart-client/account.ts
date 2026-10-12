import { storeUrl } from "./config";
import type { AuthResult } from "./auth";

// NOT LIVE YET — these endpoints are the shape this site needs from
// ExiusCart, not ones it has today. Every call is authenticated with the
// shopper's Bearer token, so ExiusCart always knows exactly which customer
// is asking from the token alone. Until ExiusCart ships them, each call
// fails and the real error is surfaced to the shopper as-is.

export type Customer = AuthResult["customer"];

interface RawCustomer {
  id: number;
  name: string;
  email: string;
}

// Same FastAPI detail-as-string-or-object handling as orders.ts.
async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.detail === "string") return body.detail;
    if (typeof body?.detail?.message === "string") return body.detail.message;
    return fallback;
  } catch {
    return fallback;
  }
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

// PATCH /account/profile → { customer: { id, name, email } }
// Email changes must be rejected by ExiusCart if another customer already
// uses that address (409 with a detail message).
export async function updateProfile(token: string, payload: { name: string; email: string }): Promise<Customer> {
  const res = await fetch(storeUrl("/account/profile"), {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, `Profile update failed: ${res.status}`));
  const raw: { customer: RawCustomer } = await res.json();
  return { id: String(raw.customer.id), name: raw.customer.name, email: raw.customer.email };
}

// POST /account/password → 204. ExiusCart verifies current_password itself
// (400 "Current password is incorrect" if it doesn't match).
export async function changePassword(
  token: string,
  payload: { currentPassword: string; newPassword: string },
): Promise<void> {
  const res = await fetch(storeUrl("/account/password"), {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ current_password: payload.currentPassword, new_password: payload.newPassword }),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, `Password change failed: ${res.status}`));
}

export interface PayoutMethod {
  paypalEmail: string | null;
}

// GET /account/payout-method → { paypal_email: string | null }
export async function getPayoutMethod(token: string): Promise<PayoutMethod> {
  const res = await fetch(storeUrl("/account/payout-method"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load payout method: ${res.status}`);
  const raw: { paypal_email: string | null } = await res.json();
  return { paypalEmail: raw.paypal_email };
}

// PUT /account/payout-method { paypal_email } → { paypal_email }
export async function savePayoutMethod(token: string, paypalEmail: string): Promise<PayoutMethod> {
  const res = await fetch(storeUrl("/account/payout-method"), {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ paypal_email: paypalEmail }),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, `Saving PayPal account failed: ${res.status}`));
  const raw: { paypal_email: string | null } = await res.json();
  return { paypalEmail: raw.paypal_email };
}
