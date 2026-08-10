import { storeUrl } from "./config";

export interface AuthResult {
  token: string;
  customer: { id: string; name: string; email: string };
}

// Neither endpoint exists on ExiusCart yet — customer accounts are new scope,
// same as the checkout/payment endpoints. These calls will fail until that's
// built; callers should catch and show an honest "not connected yet" state.

export async function signUp(payload: { name: string; email: string; password: string }): Promise<AuthResult> {
  const res = await fetch(storeUrl("/auth/signup"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Signup failed: ${res.status}`);
  return res.json();
}

export async function signIn(payload: { email: string; password: string }): Promise<AuthResult> {
  const res = await fetch(storeUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  return res.json();
}
