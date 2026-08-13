import { NextResponse } from "next/server";
import { submitReview } from "@odtsi/exiuscart-client";
import { getSession } from "@/lib/session";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to leave a review." }, { status: 401 });
  }

  const { slug } = await params;
  const { rating, comment } = await request.json();

  try {
    const review = await submitReview(slug, { rating, comment }, session.token);
    return NextResponse.json({ review });
  } catch {
    // Real failure — right now this always fires, since ExiusCart's
    // reviews endpoint doesn't exist yet (confirmed via direct testing).
    return NextResponse.json({ error: "Reviews aren't connected yet — check back soon." }, { status: 502 });
  }
}
