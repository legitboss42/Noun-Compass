import { NextResponse } from "next/server";
import { generateAiStudyPlan, AiStudyPlannerError } from "@/lib/platform/ai-study-planner";
import type { StudyPlannerGenerationInput } from "@/lib/platform/study-planner-ai-core";
import { getCurrentUser } from "@/lib/platform/auth";
import { enforceRateLimit, rateLimitHeaders } from "@/lib/platform/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { message: "Sign in to generate an AI study timetable." },
      { status: 401 },
    );
  }
  const limit = enforceRateLimit({
    bucket: "ai-study-planner-generate",
    key: user.id,
    limit: 10,
    windowMs: 24 * 60 * 60 * 1000,
  });
  if (limit.limited) {
    return NextResponse.json(
      { message: "Too many timetable requests. Please try again later." },
      { status: 429, headers: rateLimitHeaders(limit) },
    );
  }
  const body = await request.json().catch(() => null) as StudyPlannerGenerationInput | null;
  if (!body) return NextResponse.json({ message: "Enter valid timetable preferences." }, { status: 400 });
  try {
    return NextResponse.json(await generateAiStudyPlan(user.id, body));
  } catch (error) {
    if (error instanceof AiStudyPlannerError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "The timetable could not be generated." },
      { status: 400 },
    );
  }
}
