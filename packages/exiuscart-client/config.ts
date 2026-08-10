// Every call to ExiusCart goes through this one file's base URL + shop slug.
// Nothing else in the codebase should hardcode api.exiuscart.com directly.
//
// EXIUSCART_BASE_URL already includes the API version (e.g.
// "https://api.exiuscart.com/api/v1") — storeUrl() only appends
// "/public/store/{slug}{path}" on top of it. Don't add "/api/v1" again here.

export const EXIUSCART_BASE_URL =
  process.env.NEXT_PUBLIC_EXIUSCART_API_URL ?? "https://api.exiuscart.com/api/v1";

export const SHOP_SLUG = process.env.NEXT_PUBLIC_SHOP_SLUG ?? "odtsi";

export function storeUrl(path: string) {
  return `${EXIUSCART_BASE_URL}/public/store/${SHOP_SLUG}${path}`;
}
