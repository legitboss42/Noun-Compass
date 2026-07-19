import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/platform/auth";
import { scoreSession } from "@/lib/platform/practice";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(_request: Request, { params }: { params: Promise<{ "session-id": string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Sign in to continue." }, { status: 401 });
  const sessionId = (await params)["session-id"];
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ message: "Practice database is unavailable." }, { status: 503 });
  const { data: session } = await admin.from("practice_sessions").select("id,user_id,status,question_count").eq("id", sessionId).maybeSingle();
  if (!session || session.user_id !== user.id) return NextResponse.json({ message: "Session not found." }, { status: 404 });
  const { data: responses } = await admin.from("practice_responses").select("question_version_id,selected_option_id,correct").eq("session_id", sessionId);
  const correct = (responses ?? []).filter((response) => response.correct).length;
  const answered = responses?.length ?? 0;
  const score = scoreSession(correct, session.question_count);
  await admin.from("practice_sessions").update({ status: "completed", completed_at: new Date().toISOString(), score }).eq("id", sessionId);
  const versionIds = (responses ?? []).map((response) => response.question_version_id);
  if (!versionIds.length) return NextResponse.json({ correct, answered, total: session.question_count, score, review: [] });
  const [{ data: versions }, { data: options }] = await Promise.all([
    admin.from("question_versions").select("id,prompt,explanation").in("id", versionIds),
    admin.from("question_options").select("id,question_version_id,label,option_text,is_correct").in("question_version_id", versionIds),
  ]);
  const review = (responses ?? []).map((response) => {
    const version = (versions ?? []).find((item) => item.id === response.question_version_id);
    const selected = (options ?? []).find((item) => item.id === response.selected_option_id);
    const expected = (options ?? []).find((item) => item.question_version_id === response.question_version_id && item.is_correct);
    return { questionVersionId: response.question_version_id, prompt: version?.prompt ?? "Question", explanation: version?.explanation ?? "", correct: response.correct, selectedAnswer: selected ? `${selected.label}. ${selected.option_text}` : "Not answered", correctAnswer: expected ? `${expected.label}. ${expected.option_text}` : "Unavailable" };
  });
  return NextResponse.json({ correct, answered, total: session.question_count, score, review });
}
