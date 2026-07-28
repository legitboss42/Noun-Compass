import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/platform/admin-auth";
import { generateQuestionDraftCsv } from "@/lib/platform/ai-question-drafts";
import { writeAuditLog } from "@/lib/platform/audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await requirePermission("questions.write", "/admin/questions");

  try {
    const body = await request.json() as {
      courseCode?: string;
      courseTitle?: string;
      sourceUnit?: string;
      sourcePage?: string;
      materialExcerpt?: string;
      questionCount?: number;
    };

    const result = await generateQuestionDraftCsv({
      courseCode: body.courseCode ?? "",
      courseTitle: body.courseTitle,
      sourceUnit: body.sourceUnit ?? "",
      sourcePage: body.sourcePage,
      materialExcerpt: body.materialExcerpt ?? "",
      questionCount: body.questionCount,
    });

    await writeAuditLog({
      actorId: session.user.id,
      action: "question_ai.draft_csv_generated",
      targetType: "question_bank",
      targetId: body.courseCode?.trim().toUpperCase() || null,
      metadata: {
        rowCount: result.rowCount,
        model: result.model,
        sourceUnit: body.sourceUnit,
        sourcePage: body.sourcePage,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not generate draft questions." },
      { status: 400 },
    );
  }
}
