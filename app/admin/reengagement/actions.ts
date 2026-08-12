"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/platform/admin-auth";
import {
  requireActionConfirmation,
  requireAdminReason,
} from "@/lib/platform/admin-workflows";
import { writeAuditLog } from "@/lib/platform/audit";
import { selectionFailureAuditMetadata } from "@/lib/platform/notification-delivery-core";
import { OperationalDatabaseFailure } from "@/lib/platform/reengagement";
import {
  clampQuietDays,
  inactiveParamsFromEnv,
  inactiveRunDate,
  selectInactiveStudents,
  sendStageBatch,
} from "@/lib/platform/inactive-students";
import type { InactiveStage } from "@/lib/platform/stage-email-core";
import { createAdminClient } from "@/lib/supabase/admin";

const value = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

function fail(message: string): never {
  redirect(`/admin/reengagement?error=${encodeURIComponent(message)}`);
}

const STAGES = ["s1", "s2", "s3", "s4"] as const;

function requireStage(raw: string): InactiveStage {
  if (!(STAGES as readonly string[]).includes(raw)) {
    throw new Error("Choose a valid stage.");
  }
  return raw as InactiveStage;
}

/**
 * Bulk send to everyone currently in one stage. Like the legacy campaign it does
 * not read REENGAGEMENT_ENABLED: super-admin + the typed SEND confirmation is the
 * deliberate enable, and this never arms the cron. Same audience/cooldown/
 * unsubscribe guarantees via the shared batch.
 */
export async function sendStageCampaign(formData: FormData) {
  const session = await requirePermission("settings.manage", "/admin/reengagement");
  let redirectTo = "/admin/reengagement";
  try {
    const stage = requireStage(value(formData, "stage"));
    requireActionConfirmation(value(formData, "confirmation"), "SEND");
    const reason = requireAdminReason(value(formData, "reason"));
    const admin = createAdminClient();
    if (!admin) throw new Error("Platform database is not configured.");

    const base = inactiveParamsFromEnv();
    const params = { ...base, quietDays: clampQuietDays(value(formData, "quiet"), base.quietDays) };
    const runDate = inactiveRunDate();
    let students;
    try {
      students = await selectInactiveStudents(admin, params, stage);
    } catch (error) {
      if (error instanceof OperationalDatabaseFailure) {
        await writeAuditLog({
          actorId: session.user.id,
          action: "reengagement.selection_failed",
          targetType: "email_campaign",
          targetId: runDate,
          reason,
          metadata: { stage, mode: "bulk", ...selectionFailureAuditMetadata(error.detail) },
        });
        throw new Error("Could not select eligible students. The operational failure was recorded.");
      }
      throw error;
    }
    if (!students.length) throw new Error("No students are eligible in that stage right now.");

    const result = await sendStageBatch(admin, runDate, students);
    await writeAuditLog({
      actorId: session.user.id,
      action: "reengagement.sent",
      targetType: "email_campaign",
      targetId: runDate,
      reason,
      metadata: {
        stage,
        mode: "bulk",
        candidates: result.candidates,
        emailed: result.emailed,
        failed: result.failed,
        deduped: result.deduped,
        database_failed: result.databaseFailed,
        errors: result.errors,
        quiet_days: params.quietDays,
        cooldown_days: params.cooldownDays,
        batch_limit: params.limit,
      },
    });

    const summary = result.failed
      ? `${stage.toUpperCase()}: ${result.emailed} emailed, ${result.failed} failed`
      : `${stage.toUpperCase()}: ${result.emailed} emailed`;
    redirectTo =
      result.databaseFailed > 0
        ? `/admin/reengagement?error=${encodeURIComponent("Email processing had a database failure. The audit log has the operational details; cooldown confirmation may be incomplete.")}`
        : result.emailed === 0
        ? `/admin/reengagement?error=${encodeURIComponent(`No emails were sent — ${result.failed} attempt(s) failed. Check the SMTP configuration.`)}`
        : `/admin/reengagement?notice=${encodeURIComponent(summary)}`;
  } catch (error) {
    fail(error instanceof Error ? error.message : "Stage send failed.");
  }
  revalidatePath("/admin/reengagement");
  redirect(redirectTo);
}

/**
 * One-off send to a single student in a stage. No typed SEND phrase (reserved
 * for bulk), but still super-admin only, still audited, and still gated by the
 * same eligibility + cooldown: the student is re-selected from the live
 * audience, so a no-longer-eligible id sends nothing.
 */
export async function sendToOneStudent(formData: FormData) {
  const session = await requirePermission("settings.manage", "/admin/reengagement");
  let redirectTo = "/admin/reengagement";
  try {
    const stage = requireStage(value(formData, "stage"));
    const userId = value(formData, "user_id");
    if (!userId) throw new Error("Missing the student to email.");
    const reason = requireAdminReason(value(formData, "reason") || "Individual re-engagement send");
    const admin = createAdminClient();
    if (!admin) throw new Error("Platform database is not configured.");

    const base = inactiveParamsFromEnv();
    const params = { ...base, quietDays: clampQuietDays(value(formData, "quiet"), base.quietDays) };
    const runDate = inactiveRunDate();
    let selectedStudents;
    try {
      selectedStudents = await selectInactiveStudents(admin, params, stage);
    } catch (error) {
      if (error instanceof OperationalDatabaseFailure) {
        await writeAuditLog({
          actorId: session.user.id,
          action: "reengagement.selection_failed",
          targetType: "email_campaign",
          targetId: runDate,
          reason,
          metadata: { stage, mode: "single", ...selectionFailureAuditMetadata(error.detail) },
        });
        throw new Error("Could not select eligible students. The operational failure was recorded.");
      }
      throw error;
    }
    const student = selectedStudents.find((s) => s.user_id === userId);
    if (!student) throw new Error("That student is no longer eligible (already emailed, opted out, or now active).");

    const result = await sendStageBatch(admin, runDate, [student]);
    await writeAuditLog({
      actorId: session.user.id,
      action: "reengagement.sent",
      targetType: "email_campaign",
      targetId: runDate,
      reason,
      metadata: {
        stage,
        mode: "single",
        user_id: userId,
        candidates: result.candidates,
        emailed: result.emailed,
        failed: result.failed,
        deduped: result.deduped,
        database_failed: result.databaseFailed,
        errors: result.errors,
      },
    });

    redirectTo =
      result.databaseFailed > 0
        ? `/admin/reengagement?error=${encodeURIComponent("Email processing had a database failure. The audit log has the operational details; cooldown confirmation may be incomplete.")}`
        : result.emailed === 1
        ? `/admin/reengagement?notice=${encodeURIComponent("Sent 1 email.")}`
        : `/admin/reengagement?error=${encodeURIComponent("The email could not be sent (already nudged today, or SMTP failed).")}`;
  } catch (error) {
    fail(error instanceof Error ? error.message : "Individual send failed.");
  }
  revalidatePath("/admin/reengagement");
  redirect(redirectTo);
}
