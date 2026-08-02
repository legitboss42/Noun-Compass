import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/platform/auth";
import { AiPracticeError, generateNextAiPracticeBatch } from "@/lib/platform/ai-practice";
import { enforceRateLimit, rateLimitHeaders } from "@/lib/platform/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ "session-id": string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Sign in to continue generating this Practice Exam." }, { status: 401 });
  const limit = enforceRateLimit({
    bucket: "ai-practice-batch-generate",
    key: user.id,
    limit: 30,
    windowMs: 60 * 60 * 1000,
  });
  if (limit.limited) {
    return NextResponse.json(
      { message: "Practice Exam generation is temporarily rate limited. Your completed batches are saved." },
      { status: 429, headers: rateLimitHeaders(limit) },
    );
  }
  try {
    return NextResponse.json(await generateNextAiPracticeBatch(user.id, (await params)["session-id"]));
  } catch (error) {
    if (error instanceof AiPracticeError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "The next Practice Exam batch could not be generated." }, { status: 500 });
  }
}
