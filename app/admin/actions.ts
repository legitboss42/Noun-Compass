"use server";

import { createHash, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/platform/auth";
import { normalizeCourseCode } from "@/lib/platform/course-codes";
import { parseQuestionCsv } from "@/lib/platform/question-import";
import { isOfficialNounSourceUrl, parseTimetableCsv } from "@/lib/platform/timetable-import";
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
  if (!version) {
    await admin.from("questions").delete().eq("id", question.id);
    redirect("/admin/questions?error=Question+version+could+not+be+created");
  }
  const { error: optionError } = await admin.from("question_options").insert(options.map((option) => ({ question_version_id: version.id, label: option.label, option_text: option.text, position: option.position, is_correct: option.label === correctLabel })));
  if (optionError) {
    await admin.from("questions").delete().eq("id", question.id);
    redirect("/admin/questions?error=Question+options+could+not+be+created");
  }
  await admin.from("audit_logs").insert({ actor_id: user.id, action: "question.created", entity_type: "question", entity_id: question.id, details: { courseCode } });
  revalidatePath("/admin/questions"); redirect("/admin/questions?notice=Draft+question+created");
}

export async function changeQuestionStatus(formData: FormData) {
  const status = text(formData, "status"); const questionId = text(formData, "questionId");
  const reviewerStatuses = ["published", "retired"];
  const { user } = await requireRole(reviewerStatuses.includes(status) ? ["academic_reviewer", "super_admin"] : ["content_editor", "academic_reviewer", "super_admin"], "/admin/questions");
  if (!["review", "published", "retired"].includes(status)) redirect("/admin/questions?error=Invalid+question+state");
  const admin = createAdminClient(); if (!admin) redirect("/admin/questions?error=Database+not+configured");
  const { data: question } = await admin.from("questions").select("id,status,current_version").eq("id", questionId).maybeSingle();
  if (!question) redirect("/admin/questions?error=Question+not+found");
  const allowedTransition = (question.status === "draft" && status === "review") || (question.status === "review" && status === "published") || (question.status === "published" && status === "retired");
  if (!allowedTransition) redirect("/admin/questions?error=Question+status+must+move+from+draft+to+review+to+published+or+retired");
  if (status === "published") {
    const { data: version } = await admin.from("question_versions").select("id,prompt,explanation,source_unit").eq("question_id", questionId).eq("version", question.current_version).maybeSingle();
    const { data: options } = version ? await admin.from("question_options").select("label,option_text,is_correct").eq("question_version_id", version.id) : { data: [] };
    const complete = version && version.prompt.trim().length >= 12 && version.explanation.trim().length >= 20 && Boolean(version.source_unit.trim()) && options?.length === 4 && options.filter((option) => option.is_correct).length === 1 && options.every((option) => option.option_text.trim());
    if (!complete) redirect("/admin/questions?error=Question+cannot+be+approved+until+its+source,+four+options,+one+answer,+and+explanation+are+complete");
  }
  const { error } = await admin.from("questions").update({ status, reviewed_by: reviewerStatuses.includes(status) ? user.id : null, reviewed_at: reviewerStatuses.includes(status) ? new Date().toISOString() : null }).eq("id", questionId);
  if (error) redirect("/admin/questions?error=Question+status+could+not+be+updated");
  await admin.from("content_reviews").insert({ entity_type: "question", entity_id: questionId, decision: status === "review" ? "submitted" : status === "published" ? "approved" : "retired", reviewer_id: user.id });
  await admin.from("audit_logs").insert({ actor_id: user.id, action: `question.${status}`, entity_type: "question", entity_id: questionId });
  revalidatePath("/admin/questions");
}

export async function importQuestionCsv(formData: FormData) {
  const { user } = await requireRole(["content_editor", "academic_reviewer", "super_admin"], "/admin/questions");
  const parsed = parseQuestionCsv(text(formData, "csv"));
  if (parsed.errors.length) redirect(`/admin/questions?error=${encodeURIComponent(parsed.errors.slice(0, 8).join(" "))}`);
  const admin = createAdminClient();
  if (!admin) redirect("/admin/questions?error=Database+not+configured");

  const courseCodes = [...new Set(parsed.rows.map((row) => row.courseCode))];
  const { data: banks } = await admin.from("question_banks").select("id,course_code").in("course_code", courseCodes);
  const bankByCode = new Map((banks ?? []).map((bank) => [bank.course_code, bank.id]));
  const missing = courseCodes.filter((courseCode) => !bankByCode.has(courseCode));
  if (missing.length) redirect(`/admin/questions?error=${encodeURIComponent(`Create these course banks before importing questions: ${missing.join(", ")}`)}`);

  const prepared = parsed.rows.map((row) => ({ row, questionId: randomUUID(), versionId: randomUUID(), bankId: bankByCode.get(row.courseCode)! }));
  const questionIds = prepared.map((item) => item.questionId);
  const { error: questionError } = await admin.from("questions").insert(prepared.map(({ row, questionId, bankId }) => ({
    id: questionId,
    bank_id: bankId,
    topic: row.topic,
    learning_objective: row.learningObjective,
    difficulty: row.difficulty,
    sample: row.sample,
    status: "draft",
    created_by: user.id,
  })));
  if (questionError) redirect("/admin/questions?error=Question+rows+could+not+be+imported");

  const { error: versionError } = await admin.from("question_versions").insert(prepared.map(({ row, questionId, versionId }) => ({
    id: versionId,
    question_id: questionId,
    version: 1,
    prompt: row.prompt,
    explanation: row.explanation,
    source_unit: row.sourceUnit,
    source_page: row.sourcePage,
    created_by: user.id,
  })));
  if (versionError) {
    await admin.from("questions").delete().in("id", questionIds);
    redirect("/admin/questions?error=Question+versions+could+not+be+imported");
  }

  const { error: optionError } = await admin.from("question_options").insert(prepared.flatMap(({ row, versionId }) => row.options.map((option, index) => ({
    question_version_id: versionId,
    label: option.label,
    option_text: option.text,
    position: index + 1,
    is_correct: option.label === row.correctLabel,
  }))));
  if (optionError) {
    await admin.from("questions").delete().in("id", questionIds);
    redirect("/admin/questions?error=Answer+options+could+not+be+imported");
  }

  await admin.from("audit_logs").insert(courseCodes.map((courseCode) => ({
    actor_id: user.id,
    action: "questions.csv_imported",
    entity_type: "question_bank",
    entity_id: bankByCode.get(courseCode),
    details: { courseCode, count: prepared.filter((item) => item.row.courseCode === courseCode).length },
  })));
  revalidatePath("/admin/questions");
  redirect(`/admin/questions?notice=${prepared.length}+draft+questions+imported+for+human+review`);
}

export async function publishQuestionBank(formData: FormData) {
  const { user } = await requireRole(["academic_reviewer", "super_admin"], "/admin/questions");
  const bankId = text(formData, "bankId"); const admin = createAdminClient(); if (!admin) redirect("/admin/questions?error=Database+not+configured");
  const { data: questions } = await admin.from("questions").select("id,current_version,sample").eq("bank_id", bankId).eq("status", "published");
  const questionIds = (questions ?? []).map((question) => question.id);
  if (questionIds.length < 100) redirect("/admin/questions?error=A+bank+needs+100+approved+questions+including+15+free+samples");
  const { data: versions } = await admin.from("question_versions").select("id,question_id,version,prompt,explanation,source_unit").in("question_id", questionIds);
  const currentVersions = (versions ?? []).filter((version) => questions?.some((question) => question.id === version.question_id && question.current_version === version.version));
  const versionIds = currentVersions.map((version) => version.id);
  const { data: options } = versionIds.length ? await admin.from("question_options").select("question_version_id,label,is_correct,option_text").in("question_version_id", versionIds) : { data: [] };
  const validQuestionIds = new Set(currentVersions.filter((version) => {
    const versionOptions = (options ?? []).filter((option) => option.question_version_id === version.id);
    return version.prompt.trim().length >= 12 && version.explanation.trim().length >= 20 && Boolean(version.source_unit.trim()) && versionOptions.length === 4 && versionOptions.filter((option) => option.is_correct).length === 1 && versionOptions.every((option) => option.option_text.trim());
  }).map((version) => version.question_id));
  const validPublished = validQuestionIds.size;
  const validSamples = (questions ?? []).filter((question) => question.sample && validQuestionIds.has(question.id)).length;
  if (validPublished < 100 || validSamples < 15) redirect(`/admin/questions?error=${encodeURIComponent(`Bank integrity gate failed: ${validPublished} complete approved questions and ${validSamples} complete samples.`)}`);
  await admin.from("question_banks").update({ status: "published", reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq("id", bankId);
  await admin.from("audit_logs").insert({ actor_id: user.id, action: "question_bank.published", entity_type: "question_bank", entity_id: bankId, details: { published: validPublished, samples: validSamples } });
  revalidatePath("/admin/questions"); revalidatePath("/dashboard/practice"); redirect("/admin/questions?notice=Question+bank+published");
}

export async function importTimetable(formData: FormData) {
  const { user } = await requireRole(["content_editor", "academic_reviewer", "super_admin"], "/admin/schedules");
  const csv = text(formData, "csv"); const parsed = parseTimetableCsv(csv);
  if (parsed.errors.length) redirect(`/admin/schedules?error=${encodeURIComponent(parsed.errors.slice(0, 5).join(" "))}`);
  const sourceUrl = text(formData, "sourceUrl"); const sessionCode = text(formData, "sessionCode");
  if (!isOfficialNounSourceUrl(sourceUrl)) redirect("/admin/schedules?error=Use+an+HTTPS+source+owned+by+nou.edu.ng");
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
  const { data: version } = await admin.from("exam_schedule_versions").select("source_url,source_checksum,status").eq("id", versionId).maybeSingle();
  if (!version || version.status !== "draft" || !isOfficialNounSourceUrl(version.source_url) || !/^[a-f0-9]{64}$/i.test(version.source_checksum)) redirect("/admin/schedules?error=Schedule+source+or+checksum+failed+the+release+gate");
  const { count } = await admin.from("exam_schedule_entries").select("id", { count: "exact", head: true }).eq("version_id", versionId);
  if (!count) redirect("/admin/schedules?error=Cannot+publish+an+empty+schedule");
  await admin.from("exam_schedule_versions").update({ status: "published", reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq("id", versionId);
  await admin.from("audit_logs").insert({ actor_id: user.id, action: "schedule.published", entity_type: "exam_schedule_version", entity_id: versionId, details: { rows: count } });
  revalidatePath("/admin/schedules"); revalidatePath("/dashboard");
}
