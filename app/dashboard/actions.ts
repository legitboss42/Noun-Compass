"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/platform/auth";
import { normalizeCourseCode, uniqueCourseCodes } from "@/lib/platform/course-codes";
import { createClient } from "@/lib/supabase/server";

const text = (formData: FormData, name: string) => String(formData.get(name) ?? "").trim();

export async function saveSemesterProfile(formData: FormData) {
  const user = await requireUser("/dashboard/profile");
  const supabase = await createClient();
  if (!supabase) redirect("/dashboard/profile?error=Platform+database+is+not+configured");

  const level = Number(text(formData, "level"));
  const semester = Number(text(formData, "semester"));
  const courseCodes = uniqueCourseCodes(text(formData, "courseCodes").split(/[\s,;]+/));
  const studyDays = formData.getAll("studyDays").map(String);
  const payload = {
    display_name: text(formData, "displayName").slice(0, 100) || null,
    programme: text(formData, "programme").slice(0, 160) || null,
    level: Number.isFinite(level) && level >= 100 && level <= 900 ? level : null,
    semester: semester === 1 || semester === 2 ? semester : null,
    entry_mode: ["normal", "direct-entry"].includes(text(formData, "entryMode")) ? text(formData, "entryMode") : null,
    study_centre: text(formData, "studyCentre").slice(0, 180) || null,
    exam_mode: ["e-exam", "pop", "mixed"].includes(text(formData, "examMode")) ? text(formData, "examMode") : null,
    selected_course_codes: courseCodes.map(normalizeCourseCode),
    available_study_days: studyDays,
    onboarding_completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("profiles").upsert({ id: user.id, ...payload });
  if (error) redirect(`/dashboard/profile?error=${encodeURIComponent("Could not save the semester profile.")}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  redirect("/dashboard?notice=Semester+setup+saved");
}

export async function createSupportTicket(formData: FormData) {
  const user = await requireUser("/dashboard/support");
  const subject = text(formData, "subject").slice(0, 140);
  const body = text(formData, "body").slice(0, 5000);
  const category = text(formData, "category");
  if (subject.length < 5 || body.length < 2) redirect("/dashboard/support?error=Add+a+clear+subject+and+message");
  const supabase = await createClient();
  if (!supabase) redirect("/dashboard/support?error=Support+is+not+configured");
  const { data: ticket, error } = await supabase.from("support_tickets").insert({ user_id: user.id, subject, category }).select("id").single();
  if (error || !ticket) redirect("/dashboard/support?error=Could+not+create+the+ticket");
  const { error: messageError } = await supabase.from("support_messages").insert({ ticket_id: ticket.id, sender_id: user.id, body });
  if (messageError) redirect("/dashboard/support?error=Ticket+created+but+the+message+could+not+be+saved");
  revalidatePath("/dashboard/support");
  redirect("/dashboard/support?notice=Support+ticket+created");
}
