import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/platform/auth";
import { createQuestionStore, StoreError } from "@/lib/platform/question-store";

const REPORT_TYPES = new Set(["wrong_answer", "unclear_question", "duplicate_question", "poor_explanation", "incorrect_reference", "formatting_issue"]);

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Sign in to report a question." }, { status: 401 });
  const body = await request.json().catch(() => null) as { questionId?: string; questionVersionId?: string; sessionId?: string; reportType?: string; details?: string } | null;
  if (!body?.questionId || !body.questionVersionId || !body.reportType || !REPORT_TYPES.has(body.reportType) || (body.details?.length ?? 0) > 1000) return NextResponse.json({ message: "Invalid question report." }, { status: 400 });
  try {
    await createQuestionStore().report(user.id, { questionId: body.questionId, questionVersionId: body.questionVersionId, sessionId: body.sessionId, reportType: body.reportType, details: body.details?.trim() || undefined });
    return NextResponse.json({ saved: true });
  } catch (error) {
    if (error instanceof StoreError) return NextResponse.json({ message: error.message }, { status: error.status });
    return NextResponse.json({ message: "Question report could not be saved." }, { status: 500 });
  }
}
