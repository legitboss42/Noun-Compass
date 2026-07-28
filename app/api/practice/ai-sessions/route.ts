import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/platform/auth";
import {
  AiPracticeError,
  startAiPracticeSession,
  type AiPracticeMode,
} from "@/lib/platform/ai-practice";

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

