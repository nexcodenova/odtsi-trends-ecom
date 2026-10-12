export type FormStatus = { kind: "idle" | "loading" } | { kind: "error" | "success"; message: string };

export function FormStatusMessage({ status }: { status: FormStatus }) {
  if (status.kind === "error") return <p className="text-sm font-bold text-red-600">{status.message}</p>;
  if (status.kind === "success") return <p className="text-sm font-bold text-status">{status.message}</p>;
  return null;
}

// Every account/wallet route answers { error } on failure — the real
// message from ExiusCart, forwarded as-is.
export async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.error === "string") return body.error;
  } catch {}
  return "Something went wrong — try again.";
}
