import "server-only";

import { sendReengagementEmail } from "@/lib/contact-mail";
import {
  deliverNotificationBatch,
  operationalDatabaseError,
  type DeliveryError,
  type NotificationDeliveryResult,
} from "@/lib/platform/notification-delivery-core";
import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;

export type ReengagementCandidate = {
  user_id: string;
  email: string | null;
  display_name: string | null;
};

export type ReengagementParams = {
  graceDays: number;
  cooldownDays: number;
  limit: number;
};

export class OperationalDatabaseFailure extends Error {
  constructor(readonly detail: DeliveryError) {
    super("A platform database operation failed.");
    this.name = "OperationalDatabaseFailure";
  }
}

const DEFAULTS: ReengagementParams = { graceDays: 3, cooldownDays: 14, limit: 50 };

// The RPC itself clamps grace/cooldown/limit, so a finite number is enough here;
// anything unset or unparseable falls back to the documented default.
function knob(raw: string | undefined, fallback: number) {
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

/**
 * The tuning knobs the cron reads. The admin trigger reads the same ones so its
 * preview and its send show exactly the audience the automatic job would email.
 */
export function reengagementParamsFromEnv(): ReengagementParams {
  return {
    graceDays: knob(process.env.REENGAGEMENT_GRACE_DAYS, DEFAULTS.graceDays),
    cooldownDays: knob(process.env.REENGAGEMENT_COOLDOWN_DAYS, DEFAULTS.cooldownDays),
    limit: knob(process.env.REENGAGEMENT_BATCH_LIMIT, DEFAULTS.limit),
  };
}

/** The date component of the dedupe key, shared so cron and admin sends on the
 * same day collide on the notifications unique index rather than double-emailing. */
export function reengagementRunDate(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

/**
 * The audience: verified accounts that never opened a tool, still opted in, and
 * outside the cooldown. Selection lives in a security-definer RPC because it
 * spans auth.users and four activity tables. Throws on error so the caller
 * decides how it surfaces — the cron swallows it, the admin page shows it.
 */
export async function selectReengagementCandidates(
  admin: AdminClient,
  params: ReengagementParams,
): Promise<ReengagementCandidate[]> {
  const { data, error } = await admin.rpc("select_reengagement_candidates", {
    p_grace_days: params.graceDays,
    p_cooldown_days: params.cooldownDays,
    p_limit: params.limit,
  });
  if (error) throw new OperationalDatabaseFailure(operationalDatabaseError("candidateSelection", error));
  return (data ?? []) as ReengagementCandidate[];
}

export type ReengagementBatchResult = NotificationDeliveryResult;

/**
 * Emails each candidate once. The notification row is written first, and its
 * unique (user_id, dedupe_key) is what stops a retried run — whether cron or
 * admin — from emailing the same student twice on the same day. A row without
 * emailed_at means the send failed, so the cooldown never starts and the student
 * is picked up again next time. One bad address never stops the batch.
 */
export async function sendReengagementBatch(
  admin: AdminClient,
  runDate: string,
  candidates: ReengagementCandidate[],
): Promise<ReengagementBatchResult> {
  const dedupeKey = `reengagement:${runDate}`;
  const deliveries = candidates.map((candidate) => ({ ...candidate, userId: candidate.user_id }));
  return deliverNotificationBatch({
    candidates: deliveries,
    database: {
      async insertNotification(candidate, notification) {
        const { error } = await admin.from("notifications").insert({
          user_id: candidate.user_id,
          kind: notification.kind,
          title: notification.title,
          body: notification.body,
          action_url: notification.actionUrl,
          dedupe_key: dedupeKey,
        });
        return { error };
      },
      async markEmailed(candidate) {
        const { error } = await admin
          .from("notifications")
          .update({ emailed_at: new Date().toISOString() })
          .eq("user_id", candidate.user_id)
          .eq("dedupe_key", dedupeKey);
        return { error };
      },
    },
    makeNotification: () => ({
      kind: "reengagement",
      title: "Start with a Practice Exam",
      body: "You have not used the study tools yet. A Practice Exam built from your course material is the quickest first step.",
      actionUrl: "/dashboard/ai-practice",
    }),
    sendEmail: (candidate) => sendReengagementEmail({ to: candidate.email!, displayName: candidate.display_name }),
  });
}
