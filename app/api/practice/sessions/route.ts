import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/platform/auth";
import { membershipIsActive } from "@/lib/platform/membership";
import { normalizeCourseCode } from "@/lib/platform/course-codes";
import { selectQuestionSet, timedMockExpiresAt, TIMED_MOCK_MINUTES } from "@/lib/platform/practice";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Sign in to start practice." }, { status: 401 });
  const body = await request.json().catch(() => null) as { courseCode?: string; mode?: string } | null;
  const courseCode = normalizeCourseCode(body?.courseCode ?? "");
  const mode = body?.mode;
  if (!courseCode || !["diagnostic", "practice", "timed-mock", "revision"].includes(mode ?? "")) return NextResponse.json({ message: "Invalid practice request." }, { status: 400 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ message: "Practice database is not configured." }, { status: 503 });

  const { data: membership } = await admin.from("memberships").select("status,ends_at").eq("user_id", user.id).order("ends_at", { ascending: false }).limit(1).maybeSingle();
  const premium = membershipIsActive(membership?.status, membership?.ends_at);
  if (mode !== "diagnostic" && !premium) return NextResponse.json({ message: "A current semester pass is required for full practice, revision, and timed mocks." }, { status: 403 });

  const { data: bank } = await admin.from("question_banks").select("id,course_code,course_title,status").eq("course_code", courseCode).eq("status", "published").maybeSingle();
  if (!bank) return NextResponse.json({ message: "This bank is still in editorial review." }, { status: 404 });

  if (mode === "diagnostic" && !premium) {
    const { count } = await admin.from("practice_sessions").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("bank_id", bank.id).eq("mode", "diagnostic");
    if ((count ?? 0) >= 1) return NextResponse.json({ message: "The free diagnostic for this course has already been used." }, { status: 403 });
  }

  let dueQuestionIds: string[] | null = null;
  if (mode === "revision") {
    const { data: due } = await admin.from("revision_state").select("question_id").eq("user_id", user.id).lte("due_at", new Date().toISOString()).limit(100);
    dueQuestionIds = (due ?? []).map((item) => item.question_id);
    if (!dueQuestionIds.length) return NextResponse.json({ message: "No revision questions are due yet." }, { status: 404 });
  }

  let questionQuery = admin.from("questions").select("id,current_version,topic,difficulty").eq("bank_id", bank.id).eq("status", "published");
  if (mode === "diagnostic" && !premium) questionQuery = questionQuery.eq("sample", true);
  if (dueQuestionIds) questionQuery = questionQuery.in("id", dueQuestionIds);
  const limit = mode === "diagnostic" ? 15 : mode === "timed-mock" ? 40 : 20;
  const { data: availableQuestions, error: questionError } = await questionQuery.limit(500);
  const questions = selectQuestionSet(availableQuestions ?? [], limit);
  if (questionError || !questions?.length) return NextResponse.json({ message: "No reviewed questions are available for this mode." }, { status: 404 });

  const versionPairs = questions.map((question) => ({ questionId: question.id, version: question.current_version }));
  const { data: versions } = await admin.from("question_versions").select("id,question_id,version,prompt").in("question_id", questions.map((question) => question.id));
  const currentVersions = (versions ?? []).filter((version) => versionPairs.some((pair) => pair.questionId === version.question_id && pair.version === version.version));
  const { data: options } = await admin.from("question_options").select("id,question_version_id,label,option_text,position").in("question_version_id", currentVersions.map((version) => version.id)).order("position");

  const storedMode = mode === "revision" ? "practice" : mode;
  const { data: session, error: sessionError } = await admin.from("practice_sessions").insert({ user_id: user.id, bank_id: bank.id, mode: storedMode, question_count: currentVersions.length }).select("id,mode,started_at").single();
  if (sessionError || !session) return NextResponse.json({ message: "Could not create the practice session." }, { status: 500 });
  await admin.from("practice_session_questions").insert(currentVersions.map((version, index) => ({ session_id: session.id, question_version_id: version.id, position: index + 1 })));

  return NextResponse.json({
    session: { ...session, mode, courseCode: bank.course_code, courseTitle: bank.course_title, expiresAt: mode === "timed-mock" ? timedMockExpiresAt(session.started_at).toISOString() : null, timeLimitMinutes: mode === "timed-mock" ? TIMED_MOCK_MINUTES : null },
    questions: currentVersions.map((version) => {
      const question = questions.find((item) => item.id === version.question_id)!;
      return { id: version.id, prompt: version.prompt, topic: question.topic, difficulty: question.difficulty, options: (options ?? []).filter((option) => option.question_version_id === version.id).map(({ id, label, option_text }) => ({ id, label, text: option_text })) };
    }),
  });
}
