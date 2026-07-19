"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/platform/auth";
import { normalizeCourseCode } from "@/lib/platform/course-codes";
import { parseTimetableCsv } from "@/lib/platform/timetable-import";
import { createAdminClient } from "@/lib/supabase/admin";

const text = (formData: FormData, name: string) => String(formData.get(name) ?? "").trim();

export async function createQuestion(formData: FormData) {
  const { user } = await requireRole(["content_editor", "academic_reviewer", "super_admin"], "/admin/questions");
  const admin = createAdminClient(); if (!admin) redirect("/admin/questions?error=Database+not+configured");
  const courseCode = normalizeCourseCode(text(formData, "courseCode"));
  const { data: bank } = await admin.from("question_banks").select("id").eq("course_code", courseCode).maybeSingle();
  if (!bank) redirect("/admin/questions?error=Choose+a+configured+question+bank");
  const prompt = text(formData, "prompt"); const explanation = text(formData, "explanation");
  const correctLabel = text(formData, "correctLabel").toUpperCase();
  const options = ["A", "B", "C", "D"].map((label, index) => ({ label, text: text(formData, `option${label}`), position: index + 1 }));
  if (prompt.length < 12 || explanation.length < 20 || options.some((option) => option.text.length < 1) || !["A","B","C","D"].includes(correctLabel)) redirect("/admin/questions?error=Complete+the+prompt,+four+options,+answer,+and+explanation");
  const { data: question, error } = await admin.from("questions").insert({ bank_id: bank.id, topic: text(formData, "topic"), learning_objective: text(formData, "learningObjective"), difficulty: Number(text(formData, "difficulty")) || 1, sample: formData.get("sample") === "on", created_by: user.id }).select("id").single();
  if (error || !question) redirect("/admin/questions?error=Question+could+not+be+created");
  const { data: version } = await admin.from("question_versions").insert({ question_id: question.id, version: 1, prompt, explanation, source_unit: text(formData, "sourceUnit"), source_page: text(formData, "sourcePage") || null, created_by: user.id }).select("id").single();
  if (!version) redirect("/admin/questions?error=Question+created+without+a+version");
  await admin.from("question_options").insert(options.map((option) => ({ question_version_id: version.id, label: option.label, option_text: option.text, position: option.position, is_correct: option.label === correctLabel })));
  await admin.from("audit_logs").insert({ actor_id: user.id, action: "question.created", entity_type: "question", entity_id: question.id, details: { courseCode } });
  revalidatePath("/admin/questions"); redirect("/admin/questions?notice=Draft+question+created");
}

export async function changeQuestionStatus(formData: FormData) {
  const status = text(formData, "status"); const questionId = text(formData, "questionId");
  const reviewerStatuses = ["published", "retired"];
  const { user } = await requireRole(reviewerStatuses.includes(status) ? ["academic_reviewer", "super_admin"] : ["content_editor", "academic_reviewer", "super_admin"], "/admin/questions");
  if (!["review", "published", "retired"].includes(status)) redirect("/admin/questions?error=Invalid+question+state");
  const admin = createAdminClient(); if (!admin) redirect("/admin/questions?error=Database+not+configured");
  await admin.from("questions").update({ status, reviewed_by: reviewerStatuses.includes(status) ? user.id : null, reviewed_at: reviewerStatuses.includes(status) ? new Date().toISOString() : null }).eq("id", questionId);
  await admin.from("content_reviews").insert({ entity_type: "question", entity_id: questionId, decision: status === "review" ? "submitted" : status === "published" ? "approved" : "retired", reviewer_id: user.id });
  await admin.from("audit_logs").insert({ actor_id: user.id, action: `question.${status}`, entity_type: "question", entity_id: questionId });
  revalidatePath("/admin/questions");
}

export async function publishQuestionBank(formData: FormData) {
  const { user } = await requireRole(["academic_reviewer", "super_admin"], "/admin/questions");
  const bankId = text(formData, "bankId"); const admin = createAdminClient(); if (!admin) redirect("/admin/questions?error=Database+not+configured");
  const [{ count: published }, { count: samples }] = await Promise.all([
    admin.from("questions").select("id", { count: "exact", head: true }).eq("bank_id", bankId).eq("status", "published"),
    admin.from("questions").select("id", { count: "exact", head: true }).eq("bank_id", bankId).eq("status", "published").eq("sample", true),
  ]);
  if ((published ?? 0) < 100 || (samples ?? 0) < 15) redirect("/admin/questions?error=A+bank+needs+100+published+questions+including+15+free+samples");
  await admin.from("question_banks").update({ status: "published", reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq("id", bankId);
  await admin.from("audit_logs").insert({ actor_id: user.id, action: "question_bank.published", entity_type: "question_bank", entity_id: bankId, details: { published, samples } });
  revalidatePath("/admin/questions"); revalidatePath("/dashboard/practice"); redirect("/admin/questions?notice=Question+bank+published");
}

export async function importTimetable(formData: FormData) {
  const { user } = await requireRole(["content_editor", "academic_reviewer", "super_admin"], "/admin/schedules");
  const csv = text(formData, "csv"); const parsed = parseTimetableCsv(csv);
  if (parsed.errors.length) redirect(`/admin/schedules?error=${encodeURIComponent(parsed.errors.slice(0, 5).join(" "))}`);
  const sourceUrl = text(formData, "sourceUrl"); const sessionCode = text(formData, "sessionCode");
  const admin = createAdminClient(); if (!admin) redirect("/admin/schedules?error=Database+not+configured");
  const { data: term } = await admin.from("academic_terms").upsert({ name: text(formData, "termName"), session_code: sessionCode, source_url: sourceUrl, created_by: user.id }, { onConflict: "session_code" }).select("id").single();
  if (!term) redirect("/admin/schedules?error=Academic+term+could+not+be+created");
  const checksum = createHash("sha256").update(csv).digest("hex");
  const { data: version } = await admin.from("exam_schedule_versions").insert({ academic_term_id: term.id, label: text(formData, "label"), exam_mode: text(formData, "examMode"), source_url: sourceUrl, source_checksum: checksum, created_by: user.id }).select("id").single();
  if (!version) redirect("/admin/schedules?error=Schedule+version+could+not+be+created");
  await admin.from("exam_schedule_entries").insert(parsed.rows.map((row) => ({ version_id: version.id, course_code: row.courseCode, course_title: row.courseTitle || null, exam_date: row.examDate, starts_at: row.startsAt, venue: row.venue || null })));
  await admin.from("audit_logs").insert({ actor_id: user.id, action: "schedule.imported", entity_type: "exam_schedule_version", entity_id: version.id, details: { rows: parsed.rows.length, checksum } });
  revalidatePath("/admin/schedules"); redirect(`/admin/schedules?notice=${parsed.rows.length}+rows+imported+as+a+draft`);
}

export async function publishSchedule(formData: FormData) {
  const { user } = await requireRole(["academic_reviewer", "super_admin"], "/admin/schedules"); const versionId = text(formData, "versionId");
  const admin = createAdminClient(); if (!admin) redirect("/admin/schedules?error=Database+not+configured");
  const { count } = await admin.from("exam_schedule_entries").select("id", { count: "exact", head: true }).eq("version_id", versionId);
  if (!count) redirect("/admin/schedules?error=Cannot+publish+an+empty+schedule");
  await admin.from("exam_schedule_versions").update({ status: "published", reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq("id", versionId);
  await admin.from("audit_logs").insert({ actor_id: user.id, action: "schedule.published", entity_type: "exam_schedule_version", entity_id: versionId, details: { rows: count } });
  revalidatePath("/admin/schedules"); revalidatePath("/dashboard");
}
