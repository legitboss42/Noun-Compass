import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/platform/auth";
import { createQuestionStore, StoreError } from "@/lib/platform/question-store";

export async function POST(request: Request, { params }: { params: Promise<{ "session-id": string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Sign in to continue." }, { status: 401 });
  const body = await request.json().catch(() => null) as { questionVersionId?: string; selectedOptionId?: string; durationMs?: number } | null;
  if (!body?.questionVersionId || !body.selectedOptionId) return NextResponse.json({ message: "Choose an answer." }, { status: 400 });
  try {
    const result = await createQuestionStore().answer(user.id, (await params)["session-id"], {
      questionVersionId: body.questionVersionId,
      selectedOptionId: body.selectedOptionId,
      durationMs: Math.max(0, Math.min(Number(body.durationMs ?? 0), 3_600_000)),
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof StoreError) return NextResponse.json({ message: error.message }, { status: error.status });
    return NextResponse.json({ message: "The answer could not be saved." }, { status: 500 });
  }
}
