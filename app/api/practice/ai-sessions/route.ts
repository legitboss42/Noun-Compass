import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/platform/auth";
import {
  AiPracticeError,
  startAiPracticeSession,
  type AiPracticeMode,
} from "@/lib/platform/ai-practice";
import { enforceRateLimit, rateLimitHeaders } from "@/lib/platform/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { message: "Sign in to generate AI practice questions." },
      { status: 401 },
    );
  }

  const limit = enforceRateLimit({
    bucket: "ai-practice-session-start",
    key: user.id,
    limit: 10,
    windowMs: 24 * 60 * 60 * 1000,
  });
  if (limit.limited) {
    return NextResponse.json(
      { message: "Daily AI practice generation limit reached. Please try again later." },
      { status: 429, headers: rateLimitHeaders(limit) },
    );
  }

  const body = await request.json().catch(() => null) as {
    materialKey?: string;
    mode?: AiPracticeMode;
    difficulty?: number;
    questionCount?: number;
  } | null;

  try {
    const result = await startAiPracticeSession(user.id, {
      materialKey: body?.materialKey ?? "",
      mode: body?.mode,
      difficulty: body?.difficulty,
      questionCount: body?.questionCount,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AiPracticeError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { message: "AI practice questions could not be generated." },
      { status: 500 },
    );
  }
}
