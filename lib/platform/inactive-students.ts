import "server-only";

import { sendInactiveStageEmail } from "@/lib/contact-mail";
import {
  operationalDatabaseError,
  type NotificationDeliveryResult,
} from "@/lib/platform/notification-delivery-core";
import { OperationalDatabaseFailure } from "@/lib/platform/reengagement";
import { deliverStageNotificationBatch } from "@/lib/platform/stage-notification-delivery";
import { type InactiveStage, type StageContext } from "@/lib/platform/stage-email-core";
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

/** Clamp a user-supplied quiet-days value to the 1–90 range the panel allows.
 * Shared by the admin page (preview) and the send actions so the previewed
 * audience and the emailed audience use the same threshold. */
export function clampQuietDays(raw: string | undefined, fallback: number): number {
  const value = Number(raw);
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.min(90, Math.round(value)));
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
  if (error) throw new OperationalDatabaseFailure(operationalDatabaseError("candidateSelection", error));
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
  if (error) throw new OperationalDatabaseFailure(operationalDatabaseError("candidateSelection", error));
  return (data ?? []) as InactiveStudent[];
}

export type StageBatchResult = NotificationDeliveryResult;

/**
 * Emails each student once with their stage's template. Identical control flow
 * to sendReengagementBatch: the notification row (with stage-specific copy) is
 * written first, and its unique (user_id, dedupe_key) is what stops a retried
 * run — cron or admin — from emailing twice on the same day. `emailed` means
 * SMTP/provider acceptance; if `emailed_at` cannot be confirmed, the separate
 * `databaseFailed` count marks cooldown persistence as unconfirmed. One bad
 * address never stops the batch.
 */
export async function sendStageBatch(
  admin: AdminClient,
  runDate: string,
  students: InactiveStudent[],
): Promise<StageBatchResult> {
  const dedupeKey = `reengagement:${runDate}`;
  const deliveries = students.map((student) => ({ ...student, userId: student.user_id }));
  return deliverStageNotificationBatch({
    environment: process.env,
    candidates: deliveries,
    database: {
      async insertNotification(student, notification) {
        const { error } = await admin.from("notifications").insert({
          user_id: student.userId,
          kind: notification.kind,
          title: notification.title,
          body: notification.body,
          action_url: notification.actionUrl,
          dedupe_key: dedupeKey,
        });
        return { error };
      },
      async markEmailed(student) {
        const { data, error } = await admin
          .from("notifications")
          .update({ emailed_at: new Date().toISOString() })
          .eq("user_id", student.userId)
          .eq("dedupe_key", dedupeKey)
          .select("user_id")
          .maybeSingle();
        return { error, persisted: Boolean(data) };
      },
    },
    sendEmail: (student) => sendInactiveStageEmail({
      to: student.email!,
      displayName: student.display_name,
      stage: student.stage,
      context: student.context,
    }),
  });
}
