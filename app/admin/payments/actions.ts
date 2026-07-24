"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAuditLog } from "@/lib/platform/audit";
import { requirePermission } from "@/lib/platform/admin-auth";
import { requireActionConfirmation, requireAdminReason } from "@/lib/platform/admin-workflows";
import { verifyAndActivatePayment } from "@/lib/platform/payments";
import { createAdminClient } from "@/lib/supabase/admin";

const value = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim();

function fail(message: string): never {
  redirect(`/admin/payments?error=${encodeURIComponent(message)}`);
}
export async function reverifyPayment(formData: FormData) {
  const session = await requirePermission("payments.verify", "/admin/payments");
  const reference = value(formData, "reference");
  try {
    requireActionConfirmation(value(formData, "confirmation"), "VERIFY");
    const reason = requireAdminReason(value(formData, "reason"));
    const transactionId = value(formData, "transactionId");
    if (!reference || !transactionId) throw new Error("Reference and Flutterwave transaction ID are required.");
    const admin = createAdminClient();
    if (!admin) throw new Error("Platform database is not configured.");
    const { data: before } = await admin
      .from("payment_attempts")
      .select("reference,status,paid_at,review_status")
      .eq("reference", reference)
      .maybeSingle();
    if (!before) throw new Error("Payment attempt was not found.");
    const membership = await verifyAndActivatePayment(reference, transactionId);
    await admin
      .from("payment_attempts")
      .update({
        review_status: "reviewed",
        review_note: reason,
        reviewed_by: session.user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("reference", reference);
    const { data: after } = await admin
      .from("payment_attempts")
      .select("reference,status,paid_at,review_status")
      .eq("reference", reference)
      .maybeSingle();
    await writeAuditLog({
      actorId: session.user.id,
      action: "payment.reverified",
      targetType: "payment",
      targetId: reference,
      reason,
      previousState: before,
      resultingState: after,
      metadata: {
        membership_id:
          typeof membership === "object" && membership && "id" in membership
            ? String(membership.id)
            : null,
      },
    });
  } catch (error) {
    fail(error instanceof Error ? error.message : "Payment verification failed.");
  }
  revalidatePath("/admin/payments");
  redirect("/admin/payments?notice=Payment+verified+against+Flutterwave");
}

export async function markPaymentForReview(formData: FormData) {
  const session = await requirePermission("payments.verify", "/admin/payments");
  const reference = value(formData, "reference");
  try {
    requireActionConfirmation(value(formData, "confirmation"), "REVIEW");
    const reason = requireAdminReason(value(formData, "reason"));
    const admin = createAdminClient();
    if (!admin) throw new Error("Platform database is not configured.");
    const { data: before } = await admin
      .from("payment_attempts")
      .select("reference,status,review_status,review_note")
      .eq("reference", reference)
      .maybeSingle();
    if (!before) throw new Error("Payment attempt was not found.");
    const { data: after, error } = await admin
      .from("payment_attempts")
      .update({
        review_status: "manual-review",
        review_note: reason,
        reviewed_by: session.user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("reference", reference)
      .select("reference,status,review_status,review_note")
      .single();
    if (error) throw error;
    await writeAuditLog({
      actorId: session.user.id,
      action: "payment.review_flagged",
      targetType: "payment",
      targetId: reference,
      reason,
      previousState: before,
      resultingState: after,
    });
  } catch (error) {
    fail(error instanceof Error ? error.message : "Payment could not be flagged.");
  }
  revalidatePath("/admin/payments");
  redirect("/admin/payments?notice=Payment+marked+for+manual+review");
}
