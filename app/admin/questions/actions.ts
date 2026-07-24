"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/platform/admin-auth";
import { requireAdminReason } from "@/lib/platform/admin-workflows";
import { requireActionConfirmation } from "@/lib/platform/admin-workflows";
import { writeAuditLog } from "@/lib/platform/audit";
import { createAdminClient } from "@/lib/supabase/admin";

const value = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim();

function fail(questionId: string, message: string): never {
  redirect(`/admin/questions/${questionId}?error=${encodeURIComponent(message)}`);
}

export async function updateQuestionDraft(formData: FormData) {
  const session = await requirePermission("questions.write", "/admin/questions");
  const questionId = value(formData, "questionId");
  try {
    const prompt = value(formData, "prompt");
    const explanation = value(formData, "explanation");
    const sourceUnit = value(formData, "sourceUnit");
    const correctLabel = value(formData, "correctLabel").toUpperCase();
    const options = ["A", "B", "C", "D"].map((label, index) => ({
      label,
      option_text: value(formData, `option${label}`),
      position: index + 1,
      is_correct: label === correctLabel,
    }));
    if (
      prompt.length < 12 ||
      explanation.length < 20 ||
      !sourceUnit ||
      options.some((option) => !option.option_text) ||
      !["A", "B", "C", "D"].includes(correctLabel)
    ) {
      throw new Error("Complete the source, prompt, four options, answer, and explanation.");
    }
    const admin = createAdminClient();
    if (!admin) throw new Error("Platform database is not configured.");
    const { data: question } = await admin
      .from("questions")
      .select("id,status,current_version,topic,learning_objective,difficulty,sample")
      .eq("id", questionId)
      .maybeSingle();
    if (!question) throw new Error("Question was not found.");
    if (question.status !== "draft") {
      throw new Error("Only draft questions can be edited.");
    }
    const nextVersion = question.current_version + 1;
    const { data: version, error: versionError } = await admin
      .from("question_versions")
      .insert({
        question_id: questionId,
        version: nextVersion,
        prompt,
        explanation,
        source_unit: sourceUnit,
        source_page: value(formData, "sourcePage") || null,
        created_by: session.user.id,
      })
      .select("id")
      .single();
    if (versionError || !version) {
      throw versionError || new Error("Version could not be created.");
    }
    const { error: optionsError } = await admin
      .from("question_options")
      .insert(
        options.map((option) => ({
          ...option,
          question_version_id: version.id,
        })),
      );
    if (optionsError) {
      await admin.from("question_versions").delete().eq("id", version.id);
      throw optionsError;
    }
    const resultingState = {
      status: "draft" as const,
      current_version: nextVersion,
      topic: value(formData, "topic"),
      learning_objective: value(formData, "learningObjective"),
      difficulty: Number(value(formData, "difficulty")) || 1,
      sample: formData.get("sample") === "on",
    };
    const { error: updateError } = await admin
      .from("questions")
      .update(resultingState)
      .eq("id", questionId);
    if (updateError) throw updateError;
    await writeAuditLog({
      actorId: session.user.id,
      action: "question.version_created",
      targetType: "question",
      targetId: questionId,
      previousState: question,
      resultingState,
      metadata: { version_id: version.id },
    });
  } catch (error) {
    fail(questionId, error instanceof Error ? error.message : "Question could not be updated.");
  }
  revalidatePath("/admin/questions");
  revalidatePath(`/admin/questions/${questionId}`);
  redirect(`/admin/questions/${questionId}?notice=New+draft+version+saved`);
}

export async function requestQuestionChanges(formData: FormData) {
  const session = await requirePermission("questions.publish", "/admin/questions");
  const questionId = value(formData, "questionId");
  try {
    const reason = requireAdminReason(value(formData, "reason"));
    const admin = createAdminClient();
    if (!admin) throw new Error("Platform database is not configured.");
    const { data: before } = await admin
      .from("questions")
      .select("id,status,current_version")
      .eq("id", questionId)
      .maybeSingle();
    if (!before || before.status !== "review") {
      throw new Error("Only a question under review can be returned for changes.");
    }
    const { error } = await admin
      .from("questions")
      .update({
        status: "draft",
        reviewed_by: session.user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", questionId);
    if (error) throw error;
    await admin.from("content_reviews").insert({
      entity_type: "question",
      entity_id: questionId,
      decision: "changes-requested",
      notes: reason,
      reviewer_id: session.user.id,
    });
    await writeAuditLog({
      actorId: session.user.id,
      action: "question.changes_requested",
      targetType: "question",
      targetId: questionId,
      reason,
      previousState: before,
      resultingState: { status: "draft" },
    });
  } catch (error) {
    fail(questionId, error instanceof Error ? error.message : "Changes could not be requested.");
  }
  revalidatePath("/admin/questions");
  revalidatePath(`/admin/questions/${questionId}`);
  redirect(`/admin/questions/${questionId}?notice=Question+returned+to+draft`);
}

export async function resolveQuestionReport(formData: FormData) {
  const session = await requirePermission("questions.write", "/admin/questions");
  const questionId = value(formData, "questionId");
  const reportId = value(formData, "reportId");
  try {
    const reason = requireAdminReason(value(formData, "reason"));
    const status = value(formData, "status");
    if (!["reviewing", "resolved", "dismissed"].includes(status)) {
      throw new Error("Invalid report status.");
    }
    if (status === "dismissed") {
      requireActionConfirmation(value(formData, "confirmation"), "DISMISS");
    }
    const admin = createAdminClient();
    if (!admin) throw new Error("Platform database is not configured.");
    const { data: before } = await admin
      .from("question_reports")
      .select("id,status,question_id")
      .eq("id", reportId)
      .eq("question_id", questionId)
      .maybeSingle();
    if (!before) throw new Error("Question report was not found.");
    const resultingState = {
      status,
      reviewed_by: session.user.id,
      reviewed_at: new Date().toISOString(),
      resolution_notes: reason,
    };
    const { error } = await admin
      .from("question_reports")
      .update(resultingState)
      .eq("id", reportId);
    if (error) throw error;
    await writeAuditLog({
      actorId: session.user.id,
      action: `question_report.${status}`,
      targetType: "question_report",
      targetId: reportId,
      reason,
      previousState: before,
      resultingState,
      metadata: { question_id: questionId },
    });
  } catch (error) {
    fail(questionId, error instanceof Error ? error.message : "Report could not be updated.");
  }
  revalidatePath(`/admin/questions/${questionId}`);
  redirect(`/admin/questions/${questionId}?notice=Report+updated`);
}
