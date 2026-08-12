"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/platform/admin-auth";
import { isOfficialNounSourceUrl, parseTimetableCsv } from "@/lib/platform/timetable-import";
import { createAdminClient } from "@/lib/supabase/admin";

const text = (formData: FormData, name: string) => String(formData.get(name) ?? "").trim();

export async function importTimetable(formData: FormData) {
  const { user } = await requirePermission("schedules.write", "/admin/schedules");
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
  const { user } = await requirePermission("schedules.publish", "/admin/schedules"); const versionId = text(formData, "versionId");
  const admin = createAdminClient(); if (!admin) redirect("/admin/schedules?error=Database+not+configured");
  const { data: version } = await admin.from("exam_schedule_versions").select("source_url,source_checksum,status").eq("id", versionId).maybeSingle();
  if (!version || version.status !== "draft" || !isOfficialNounSourceUrl(version.source_url) || !/^[a-f0-9]{64}$/i.test(version.source_checksum)) redirect("/admin/schedules?error=Schedule+source+or+checksum+failed+the+release+gate");
  const { count } = await admin.from("exam_schedule_entries").select("id", { count: "exact", head: true }).eq("version_id", versionId);
  if (!count) redirect("/admin/schedules?error=Cannot+publish+an+empty+schedule");
  await admin.from("exam_schedule_versions").update({ status: "published", reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq("id", versionId);
  await admin.from("audit_logs").insert({ actor_id: user.id, action: "schedule.published", entity_type: "exam_schedule_version", entity_id: versionId, details: { rows: count } });
  revalidatePath("/admin/schedules"); revalidatePath("/dashboard");
}
