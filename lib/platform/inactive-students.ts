import "server-only";

import { sendInactiveStageEmail } from "@/lib/contact-mail";
import { stageNotification, type InactiveStage, type StageContext } from "@/lib/platform/stage-email-core";
import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;

export type InactiveStudent = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  stage: InactiveStage;
  last_activity_at: string | null;
  context: StageContext;
};

export type InactiveParams = { quietDays: number; cooldownDays: number; limit: number };

// Quiet window defaults to 7 days per the design; cooldown/limit reuse the
// reengagement knobs so the cron and this panel agree.
const DEFAULTS: InactiveParams = { quietDays: 7, cooldownDays: 14, limit: 50 };

function knob(raw: string | undefined, fallback: number) {
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export function inactiveParamsFromEnv(): InactiveParams {
  return {
    quietDays: knob(process.env.REENGAGEMENT_QUIET_DAYS, DEFAULTS.quietDays),
    cooldownDays: knob(process.env.REENGAGEMENT_COOLDOWN_DAYS, DEFAULTS.cooldownDays),
    limit: knob(process.env.REENGAGEMENT_BATCH_LIMIT, DEFAULTS.limit),
  };
}

/** Shared with the reengagement dedupe key so a cron send and an admin send on
 * the same day collide on notifications(user_id, dedupe_key) instead of
 * double-emailing. */
export function inactiveRunDate(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

const STAGES: InactiveStage[] = ["s1", "s2", "s3", "s4"];

export async function countInactiveByStage(
  admin: AdminClient,
  params: InactiveParams,
): Promise<Record<InactiveStage, number>> {
  const { data, error } = await admin.rpc("count_inactive_students_by_stage", {
    p_quiet_days: params.quietDays,
    p_cooldown_days: params.cooldownDays,
  });
  if (error) throw new Error(error.message);
  const counts: Record<InactiveStage, number> = { s1: 0, s2: 0, s3: 0, s4: 0 };
  for (const row of (data ?? []) as { stage: string; count: number | string }[]) {
    if ((STAGES as string[]).includes(row.stage)) {
      counts[row.stage as InactiveStage] = Number(row.count) || 0;
    }
  }
  return counts;
}

export async function selectInactiveStudents(
  admin: AdminClient,
  params: InactiveParams,
  stage?: InactiveStage,
): Promise<InactiveStudent[]> {
  const { data, error } = await admin.rpc("select_inactive_students_by_stage", {
    p_quiet_days: params.quietDays,
    p_cooldown_days: params.cooldownDays,
    p_limit: params.limit,
    p_stage: stage ?? null,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as InactiveStudent[];
}

export type StageBatchResult = { candidates: number; emailed: number; failed: number };

/**
 * Emails each student once with their stage's template. Identical control flow
 * to sendReengagementBatch: the notification row (with stage-specific copy) is
 * written first, and its unique (user_id, dedupe_key) is what stops a retried
 * run — cron or admin — from emailing twice on the same day. emailed_at is set
 * only after SMTP succeeds, so a failure leaves the student eligible next time.
 * One bad address never stops the batch.
 */
export async function sendStageBatch(
  admin: AdminClient,
  runDate: string,
  students: InactiveStudent[],
): Promise<StageBatchResult> {
  const dedupeKey = `reengagement:${runDate}`;
  let emailed = 0;
  let failed = 0;

  for (const student of students) {
    if (!student.email) continue;
    const note = stageNotification(student.stage, student.context);
    const { error: insertError } = await admin.from("notifications").insert({
      user_id: student.user_id,
      kind: "reengagement",
      title: note.title,
      body: note.body,
      action_url: note.actionUrl,
      dedupe_key: dedupeKey,
    });
    if (insertError) continue;

    try {
      await sendInactiveStageEmail({
        to: student.email,
        displayName: student.display_name,
        stage: student.stage,
        context: student.context,
      });
      await admin
        .from("notifications")
        .update({ emailed_at: new Date().toISOString() })
        .eq("user_id", student.user_id)
        .eq("dedupe_key", dedupeKey);
      emailed += 1;
    } catch {
      failed += 1;
    }
  }

  return { candidates: students.length, emailed, failed };
}
