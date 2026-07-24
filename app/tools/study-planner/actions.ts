"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAuditLog } from "@/lib/platform/audit";
import { requireStudyPlannerPremium } from "@/lib/platform/study-planner-access";
import { parseCalendarPlanPayload } from "@/lib/platform/study-planner-premium";
import { createAdminClient } from "@/lib/supabase/admin";

function fail(message: string): never {
  redirect(`/tools/study-planner?error=${encodeURIComponent(message)}`);
}

export async function savePremiumStudyPlan(formData: FormData) {
  const user = await requireStudyPlannerPremium("/tools/study-planner");
  const admin = createAdminClient();
  if (!admin) fail("Platform database is not configured.");

  const payload = parseCalendarPlanPayload(String(formData.get("planJson") ?? ""));
  const now = new Date().toISOString();

  const { data: plan, error: planError } = await admin
    .from("study_plans")
    .upsert(
      {
        user_id: user.id,
        timezone: payload.timezone,
        reminder_minutes_before: payload.reminderMinutesBefore,
        reminders_enabled: true,
        source_payload: payload,
        last_generated_at: now,
        updated_at: now,
      },
      { onConflict: "user_id" },
    )
    .select("id")
    .single();

  if (planError || !plan) fail("Could not save this study plan.");

  const { error: deleteError } = await admin
    .from("study_plan_sessions")
    .delete()
    .eq("plan_id", plan.id);

  if (deleteError) fail("Could not replace the previous saved sessions.");

  const { error: sessionError } = await admin.from("study_plan_sessions").insert(
    payload.sessions.map((session) => ({
      plan_id: plan.id,
      user_id: user.id,
      title: session.title,
      course_code: session.courseCode ?? null,
      course_title: session.courseTitle ?? null,
      starts_at: session.startsAt,
      ends_at: session.endsAt,
    })),
  );

  if (sessionError) fail("Could not save the calendar sessions.");

  await writeAuditLog({
    actorId: user.id,
    action: "study_plan.saved",
    targetType: "study_plan",
    targetId: String(plan.id),
    metadata: {
      session_count: payload.sessions.length,
      timezone: payload.timezone,
      reminder_minutes_before: payload.reminderMinutesBefore,
    },
  });

  revalidatePath("/tools/study-planner");
  redirect("/tools/study-planner?notice=Calendar+sessions+saved");
}

export async function updateStudyPlannerReminders(formData: FormData) {
  const user = await requireStudyPlannerPremium("/tools/study-planner");
  const admin = createAdminClient();
  if (!admin) fail("Platform database is not configured.");

  const enabled = formData.get("remindersEnabled") === "on";
  const { data: plan, error } = await admin
    .from("study_plans")
    .update({ reminders_enabled: enabled, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) fail("Could not update reminder settings.");
  if (!plan) fail("Save a study plan before changing reminders.");

  await writeAuditLog({
    actorId: user.id,
    action: enabled ? "study_plan.reminders_enabled" : "study_plan.reminders_disabled",
    targetType: "study_plan",
    targetId: String(plan.id),
    metadata: { reminders_enabled: enabled },
  });

  revalidatePath("/tools/study-planner");
  redirect(`/tools/study-planner?notice=${enabled ? "Reminders+enabled" : "Reminders+disabled"}`);
}
