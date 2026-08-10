import { NextResponse } from "next/server";
import { sendReengagementEmail, sendStudyReminderEmail } from "@/lib/contact-mail";
import { syncSubscriberToBrevo } from "@/lib/newsletter";
import { shouldSendStudyReminder } from "@/lib/platform/study-planner-premium";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected || request.headers.get("authorization") !== `Bearer ${expected}`) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  const admin = createAdminClient(); if (!admin) return NextResponse.json({ message: "Database unavailable." }, { status: 503 });
  const runDate = new Date().toISOString().slice(0, 10);
  const { data: run, error: runError } = await admin.from("cron_runs").insert({ job_key: "daily-platform-operations", run_date: runDate, status: "running" }).select("id").single();
  if (runError?.code === "23505") return NextResponse.json({ ok: true, duplicate: true });
  if (!run) return NextResponse.json({ message: "Could not start job." }, { status: 500 });
  try {
    const now = new Date();
    const { data: expiring } = await admin.from("memberships").select("id,user_id,ends_at,status").eq("status", "active").not("ends_at", "is", null).lte("ends_at", new Date(now.getTime() + 7 * 86400000).toISOString());
    let expiredCount = 0; let reminderCount = 0;
    for (const membership of expiring ?? []) {
      const end = new Date(membership.ends_at);
      if (end <= now) {
        await admin.from("memberships").update({ status: "expired", updated_at: now.toISOString() }).eq("id", membership.id).eq("status", "active");
        await admin.from("audit_logs").insert({ action: "membership.expired", entity_type: "membership", entity_id: membership.id, details: { ends_at: membership.ends_at } });
        expiredCount += 1;
      } else {
        const days = Math.ceil((end.getTime() - now.getTime()) / 86400000);
        if ([1, 3, 7].includes(days)) {
          const { error } = await admin.from("notifications").insert({ user_id: membership.user_id, kind: "membership", title: `Semester pass ends in ${days} day${days === 1 ? "" : "s"}`, body: "Renew only if you still need premium preparation. Core NounCompass tools remain free.", action_url: "/membership", dedupe_key: `membership-expiry:${membership.id}:${days}` });
          if (!error) reminderCount += 1;
        }
      }
    }
    const { data: studySessions } = await admin
      .from("study_plan_sessions")
      .select("id,user_id,title,starts_at,reminder_sent_at,study_plans!inner(timezone,reminder_minutes_before,reminders_enabled)")
      .is("reminder_sent_at", null)
      .gte("starts_at", now.toISOString())
      .lte("starts_at", new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString())
      .eq("study_plans.reminders_enabled", true)
      .limit(200);
    let studyReminderCount = 0; let studyEmailCount = 0;
    for (const session of studySessions ?? []) {
      const plan = Array.isArray(session.study_plans) ? session.study_plans[0] : session.study_plans;
      const reminderMinutesBefore = Number(plan?.reminder_minutes_before ?? 60);
      if (!shouldSendStudyReminder({ startsAt: session.starts_at, now, reminderMinutesBefore: Math.max(24 * 60, reminderMinutesBefore) })) continue;
      const dedupeKey = `study-session:${session.id}`;
      const { error } = await admin.from("notifications").insert({
        user_id: session.user_id,
        kind: "study-plan",
        title: "Study session coming up",
        body: `${session.title} is scheduled soon. Open your planner if you need to adjust your timetable.`,
        action_url: "/tools/study-planner",
        dedupe_key: dedupeKey,
      });
      if (!error || error.code === "23505") {
        await admin.from("study_plan_sessions").update({ reminder_sent_at: now.toISOString() }).eq("id", session.id);
        studyReminderCount += error ? 0 : 1;
        const { data: preferences } = await admin
          .from("email_preferences")
          .select("study_reminders")
          .eq("user_id", session.user_id)
          .maybeSingle();
        if (preferences?.study_reminders !== false && !error) {
          try {
            const { data: authUser } = await admin.auth.admin.getUserById(session.user_id);
            const email = authUser.user?.email;
            if (email) {
              await sendStudyReminderEmail({
                actionUrl: "https://nouncompass.me/tools/study-planner",
                startsAt: session.starts_at,
                timezone: plan?.timezone ?? "Africa/Lagos",
                title: session.title,
                to: email,
              });
              await admin.from("notifications").update({ emailed_at: new Date().toISOString() }).eq("user_id", session.user_id).eq("dedupe_key", dedupeKey);
              studyEmailCount += 1;
            }
          } catch {
            // Keep the in-app reminder even if optional SMTP delivery is unavailable.
          }
        }
      }
    }
    const { data: pendingSubscribers } = await admin.from("newsletter_subscribers").select("email").eq("status", "subscribed").is("brevo_synced_at", null).limit(100);
    let subscriberSyncCount = 0;
    for (const subscriber of pendingSubscribers ?? []) {
      try {
        const result = await syncSubscriberToBrevo(subscriber.email);
        if (result.synced) {
          await admin.from("newsletter_subscribers").update({ brevo_synced_at: now.toISOString(), updated_at: now.toISOString() }).eq("email", subscriber.email);
          subscriberSyncCount += 1;
        }
      } catch {
        // Leave unsynced contacts queued for the next daily run.
      }
    }
    const details = { expiredCount, reminderCount, checkedMemberships: expiring?.length ?? 0, studyReminderCount, studyEmailCount, checkedStudySessions: studySessions?.length ?? 0, subscriberSyncCount, checkedSubscribers: pendingSubscribers?.length ?? 0, ...(await runReengagement(admin, runDate)) };
    await admin.from("cron_runs").update({ status: "success", details, completed_at: new Date().toISOString() }).eq("id", run.id);
    return NextResponse.json({ ok: true, ...details });
  } catch (error) {
    await admin.from("cron_runs").update({ status: "failed", details: { error: error instanceof Error ? error.message.slice(0, 500) : "Unknown error" }, completed_at: new Date().toISOString() }).eq("id", run.id);
    return NextResponse.json({ message: "Daily job failed." }, { status: 500 });
  }
}

type ReengagementCandidate = { user_id: string; email: string | null; display_name: string | null };

/**
 * Nudges students who signed up and never opened a tool.
 *
 * Off unless REENGAGEMENT_ENABLED is explicitly "true". This is the one block
 * in the daily job that emails people who did not ask for anything, so it does
 * not start the moment it deploys — someone turns it on after reading what it
 * sends. A failure here never fails the run: the memberships and reminders
 * above matter more than a marketing nudge.
 */
async function runReengagement(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  runDate: string,
) {
  if (process.env.REENGAGEMENT_ENABLED !== "true") {
    return { reengagementEnabled: false as const };
  }

  const graceDays = Number(process.env.REENGAGEMENT_GRACE_DAYS ?? "3");
  const cooldownDays = Number(process.env.REENGAGEMENT_COOLDOWN_DAYS ?? "14");
  const batchLimit = Number(process.env.REENGAGEMENT_BATCH_LIMIT ?? "50");

  const { data, error } = await admin.rpc("select_reengagement_candidates", {
    p_grace_days: Number.isFinite(graceDays) ? graceDays : 3,
    p_cooldown_days: Number.isFinite(cooldownDays) ? cooldownDays : 14,
    p_limit: Number.isFinite(batchLimit) ? batchLimit : 50,
  });

  if (error) {
    console.error("[cron] could not select re-engagement candidates", error.message);
    return { reengagementEnabled: true as const, reengagementError: true as const };
  }

  const candidates = (data ?? []) as ReengagementCandidate[];
  let emailed = 0;
  let failed = 0;

  for (const candidate of candidates) {
    if (!candidate.email) continue;
    const dedupeKey = `reengagement:${runDate}`;
    // The notification row is written first and its unique (user_id,
    // dedupe_key) is what stops a retried run from emailing twice. A row
    // without emailed_at means the send failed, not that it was delivered.
    const { error: insertError } = await admin.from("notifications").insert({
      user_id: candidate.user_id,
      kind: "reengagement",
      title: "Start with a Practice Exam",
      body: "You have not used the study tools yet. A Practice Exam built from your course material is the quickest first step.",
      action_url: "/dashboard/ai-practice",
      dedupe_key: dedupeKey,
    });
    if (insertError) continue;

    try {
      await sendReengagementEmail({ to: candidate.email, displayName: candidate.display_name });
      await admin
        .from("notifications")
        .update({ emailed_at: new Date().toISOString() })
        .eq("user_id", candidate.user_id)
        .eq("dedupe_key", dedupeKey);
      emailed += 1;
    } catch {
      // One bad address must not stop the rest of the batch. Without
      // emailed_at the cooldown does not start, so this student is picked up
      // again on the next run.
      failed += 1;
    }
  }

  return {
    reengagementEnabled: true as const,
    reengagementCandidates: candidates.length,
    reengagementEmailed: emailed,
    reengagementFailed: failed,
  };
}
