"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/platform/admin-auth";
import {
  requireActionConfirmation,
  requireAdminReason,
} from "@/lib/platform/admin-workflows";
import { writeAuditLog } from "@/lib/platform/audit";
import {
  reengagementParamsFromEnv,
  reengagementRunDate,
  selectReengagementCandidates,
  sendReengagementBatch,
} from "@/lib/platform/reengagement";
import { createAdminClient } from "@/lib/supabase/admin";

const value = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

function fail(message: string): never {
  redirect(`/admin/reengagement?error=${encodeURIComponent(message)}`);
}

/**
 * Manual re-engagement send. Unlike the cron this does not read
 * REENGAGEMENT_ENABLED: the super-admin permission plus the typed SEND
 * confirmation is the deliberate enable, and sending here never arms the
 * unattended daily job. It selects the same opted-in audience through the same
 * RPC and sends through the same batch, so every message still carries a
 * working one-click unsubscribe and respects the cooldown.
 */
export async function sendReengagementCampaign(formData: FormData) {
  const session = await requirePermission("settings.manage", "/admin/reengagement");
  let redirectTo = "/admin/reengagement";
  try {
    requireActionConfirmation(value(formData, "confirmation"), "SEND");
    const reason = requireAdminReason(value(formData, "reason"));
    const admin = createAdminClient();
    if (!admin) throw new Error("Platform database is not configured.");

    const params = reengagementParamsFromEnv();
    const runDate = reengagementRunDate();
    const candidates = await selectReengagementCandidates(admin, params);
    if (!candidates.length) throw new Error("No students are eligible right now.");

    const result = await sendReengagementBatch(admin, runDate, candidates);
    await writeAuditLog({
      actorId: session.user.id,
      action: "reengagement.sent",
      targetType: "email_campaign",
      targetId: runDate,
      reason,
      metadata: {
        candidates: result.candidates,
        emailed: result.emailed,
        failed: result.failed,
        grace_days: params.graceDays,
        cooldown_days: params.cooldownDays,
        batch_limit: params.limit,
      },
    });

    const summary = result.failed
      ? `${result.emailed} emailed, ${result.failed} failed`
      : `${result.emailed} emailed`;
    redirectTo =
      result.emailed === 0
        ? `/admin/reengagement?error=${encodeURIComponent(`No emails were sent — ${result.failed} attempt(s) failed. Check the SMTP configuration.`)}`
        : `/admin/reengagement?notice=${encodeURIComponent(summary)}`;
  } catch (error) {
    fail(error instanceof Error ? error.message : "Re-engagement send failed.");
  }
  revalidatePath("/admin/reengagement");
  redirect(redirectTo);
}
