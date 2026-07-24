import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/platform/auth";
import { normalizeCourseCode } from "@/lib/platform/course-codes";
import { createQuestionStore, StoreError, type PracticeMode } from "@/lib/platform/question-store";
import { getBooleanPlatformSetting } from "@/lib/platform/runtime-settings";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Sign in to start practice." }, { status: 401 });
  const body = await request.json().catch(() => null) as { courseCode?: string; mode?: string; module?: string; unit?: string; difficulty?: number; questionCount?: number } | null;
  const courseCode = normalizeCourseCode(body?.courseCode ?? "");
  const modes: PracticeMode[] = ["diagnostic", "practice", "timed-mock", "revision"];
  if (!courseCode || !modes.includes(body?.mode as PracticeMode)) return NextResponse.json({ message: "Invalid practice request." }, { status: 400 });
  if (
    body?.mode === "diagnostic" &&
    !(await getBooleanPlatformSetting("diagnostic_available", true))
  ) {
    return NextResponse.json(
      { message: "The free diagnostic is temporarily unavailable." },
      { status: 503 },
    );
  }
  try {
    const result = await createQuestionStore().start(user.id, {
      courseCode,
      mode: body!.mode as PracticeMode,
      module: body?.module?.trim() || undefined,
      unit: body?.unit?.trim() || undefined,
      difficulty: [1, 2, 3].includes(Number(body?.difficulty)) ? Number(body?.difficulty) : undefined,
      questionCount: Number.isFinite(Number(body?.questionCount)) ? Number(body?.questionCount) : undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof StoreError) return NextResponse.json({ message: error.message }, { status: error.status });
    return NextResponse.json({ message: "Practice session could not start." }, { status: 500 });
  }
}
