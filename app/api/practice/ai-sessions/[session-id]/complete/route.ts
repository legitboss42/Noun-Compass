import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/platform/auth";
import {
  AiPracticeError,
  completeAiPracticeSession,
} from "@/lib/platform/ai-practice";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ "session-id": string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Sign in to complete this session." }, { status: 401 });
  }
  const body = await request.json().catch(() => null) as {
    answers?: Record<string, string>;
  } | null;
  try {
    const result = await completeAiPracticeSession(
      user.id,
      (await params)["session-id"],
      body?.answers ?? {},
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AiPracticeError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { message: "AI practice session could not be completed." },
      { status: 500 },
    );
  }
}

