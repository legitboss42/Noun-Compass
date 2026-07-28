import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/platform/auth";
import { AiSummaryError, generateCourseMaterialSummary } from "@/lib/platform/ai-material-summary";
import { enforceRateLimit, rateLimitHeaders } from "@/lib/platform/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Sign in to generate a course summary." }, { status: 401 });
  const limit = enforceRateLimit({
    bucket: "material-summary",
    key: user.id,
    limit: 8,
    windowMs: 24 * 60 * 60 * 1000,
  });
  if (limit.limited) {
    return NextResponse.json(
      { message: "Daily AI summary limit reached. Please try again later." },
      { status: 429, headers: rateLimitHeaders(limit) },
    );
  }
  const body = await request.json().catch(() => null) as { materialKey?: string } | null;
  try {
    const result = await generateCourseMaterialSummary(user.id, body?.materialKey ?? "");
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AiSummaryError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "Course summary could not be generated." }, { status: 500 });
  }
}
