import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/platform/auth";
import { nextRevisionState } from "@/lib/platform/revision";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request, { params }: { params: Promise<{ "session-id": string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Sign in to continue." }, { status: 401 });
  const sessionId = (await params)["session-id"];
  const body = await request.json().catch(() => null) as { questionVersionId?: string; selectedOptionId?: string; durationMs?: number } | null;
  if (!body?.questionVersionId || !body.selectedOptionId) return NextResponse.json({ message: "Choose an answer." }, { status: 400 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ message: "Practice database is unavailable." }, { status: 503 });

  const { data: session } = await admin.from("practice_sessions").select("id,user_id,mode,status").eq("id", sessionId).maybeSingle();
  if (!session || session.user_id !== user.id || session.status !== "active") return NextResponse.json({ message: "This practice session is not active." }, { status: 403 });
  const { data: assignment } = await admin.from("practice_session_questions").select("question_version_id").eq("session_id", sessionId).eq("question_version_id", body.questionVersionId).maybeSingle();
  if (!assignment) return NextResponse.json({ message: "Question is not part of this session." }, { status: 400 });
  const { data: option } = await admin.from("question_options").select("id,is_correct,question_version_id").eq("id", body.selectedOptionId).maybeSingle();
  if (!option || option.question_version_id !== body.questionVersionId) return NextResponse.json({ message: "Invalid answer option." }, { status: 400 });
  const { data: version } = await admin.from("question_versions").select("question_id,explanation").eq("id", body.questionVersionId).single();
  if (!version) return NextResponse.json({ message: "Question version is unavailable." }, { status: 404 });

  const { error } = await admin.from("practice_responses").insert({ session_id: sessionId, question_version_id: body.questionVersionId, selected_option_id: body.selectedOptionId, correct: option.is_correct, duration_ms: Math.max(0, Math.min(Number(body.durationMs ?? 0), 60 * 60 * 1000)) });
  if (error?.code === "23505") return NextResponse.json({ message: "This question has already been answered." }, { status: 409 });
  if (error) return NextResponse.json({ message: "The answer could not be saved." }, { status: 500 });

  const { data: current } = await admin.from("revision_state").select("box").eq("user_id", user.id).eq("question_id", version.question_id).maybeSingle();
  const next = nextRevisionState(current?.box ?? 1, option.is_correct);
  await admin.from("revision_state").upsert({ user_id: user.id, question_id: version.question_id, box: next.box, due_at: next.dueAt.toISOString(), last_correct: option.is_correct, updated_at: new Date().toISOString() });
  return NextResponse.json({ saved: true, correct: session.mode === "timed-mock" ? null : option.is_correct, explanation: session.mode === "timed-mock" ? null : version.explanation, nextRevisionAt: next.dueAt.toISOString() });
}
