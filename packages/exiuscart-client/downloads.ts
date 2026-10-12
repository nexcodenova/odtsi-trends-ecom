import { EXIUSCART_BASE_URL } from "./config";

// Digital product delivery. The buyer's delivery email links to
// /download/{token} on this site with an 8-character access code. The
// first call only reveals what's being delivered; the real file link
// comes back only after the code checks out (rate-limited by ExiusCart).

export interface DownloadInfo {
  productName: string | null;
  shopName: string | null;
}

async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.detail === "string") return body.detail;
    if (typeof body?.detail?.message === "string") return body.detail.message;
  } catch {}
  return fallback;
}

function downloadUrl(token: string, path = "") {
  return `${EXIUSCART_BASE_URL}/public/download/${encodeURIComponent(token)}${path}`;
}

export async function getDownload(token: string): Promise<DownloadInfo> {
  const res = await fetch(downloadUrl(token), { cache: "no-store" });
  if (!res.ok) throw new Error(await extractErrorMessage(res, "This download link doesn't exist."));
  const raw = await res.json();
  return {
    productName: raw.product_name ?? raw.product?.name ?? null,
    shopName: raw.shop_name ?? raw.shop?.name ?? null,
  };
}

export async function verifyDownload(token: string, code: string): Promise<{ fileUrl: string }> {
  const res = await fetch(downloadUrl(token, "/verify"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, "That code isn't right."));
  const raw = await res.json();
  return { fileUrl: raw.file_url };
}
