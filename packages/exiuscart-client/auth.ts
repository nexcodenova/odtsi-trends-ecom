import { storeUrl } from "./config";

export interface AuthResult {
  token: string;
  customer: { id: string; name: string; email: string };
}

// ExiusCart's raw shape — customer.id comes back as a number, normalized to
// a string below to match the id-as-string convention used everywhere else
// in this client (products, categories, etc).
interface RawAuthResult {
  token: string;
  customer: { id: number; name: string; email: string };
}

function mapAuthResult(raw: RawAuthResult): AuthResult {
  return { token: raw.token, customer: { id: String(raw.customer.id), name: raw.customer.name, email: raw.customer.email } };
}

// Real error message from ExiusCart when there is one (e.g. "Incorrect
// email or password") — falls back to the status code only if the body
// isn't the shape we expect.
async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    return typeof body?.detail === "string" ? body.detail : fallback;
  } catch {
    return fallback;
  }
}

export async function signUp(payload: { name: string; email: string; password: string }): Promise<AuthResult> {
  const res = await fetch(storeUrl("/auth/signup"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, `Signup failed: ${res.status}`));
  return mapAuthResult(await res.json());
}

export async function signIn(payload: { email: string; password: string }): Promise<AuthResult> {
  const res = await fetch(storeUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, `Login failed: ${res.status}`));
  return mapAuthResult(await res.json());
}
