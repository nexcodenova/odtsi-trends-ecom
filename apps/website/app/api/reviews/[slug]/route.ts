import { NextResponse } from "next/server";

// Retired — ExiusCart has no "logged-in customer reviews any product
// on-demand" endpoint; it only supports a token-based flow (an email sent
// after delivery, linking to ExiusCart's own hosted /review/{token} page,
// confirmed live at store.exiuscart.com). This route used to call a
// same-named endpoint on ExiusCart that never existed, so every request
// here always 502'd. Nothing in the app calls this route anymore (see
// components/product/reviews-section.tsx) — kept only as a dead stub so an
// old cached client hitting it gets a clear answer instead of a bare 404.
export async function POST() {
  return NextResponse.json(
    { error: "Self-serve reviews aren't supported — you'll get an email to review after your order is delivered." },
    { status: 410 },
  );
}
