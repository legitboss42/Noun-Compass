import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/platform/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(_request: Request, { params }: { params: Promise<{ "session-id": string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Sign in to continue." }, { status: 401 });
  const sessionId = (await params)["session-id"];
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ message: "Practice database is unavailable." }, { status: 503 });
  const { data: session } = await admin.from("practice_sessions").select("id,user_id,status,question_count").eq("id", sessionId).maybeSingle();
  if (!session || session.user_id !== user.id) return NextResponse.json({ message: "Session not found." }, { status: 404 });
  const { data: responses } = await admin.from("practice_responses").select("correct").eq("session_id", sessionId);
  const correct = (responses ?? []).filter((response) => response.correct).length;
  const answered = responses?.length ?? 0;
  const score = answered ? Math.round((correct / answered) * 100) : 0;
  await admin.from("practice_sessions").update({ status: "completed", completed_at: new Date().toISOString(), score }).eq("id", sessionId);
  return NextResponse.json({ correct, answered, total: session.question_count, score });
}
