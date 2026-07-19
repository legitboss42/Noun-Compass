import { createAdminClient } from "@/lib/supabase/admin";
import { assertFlutterwaveCustomerIdentity, assertSemesterPassTransaction, verifyFlutterwaveTransaction } from "./flutterwave";

export async function verifyAndActivatePayment(reference: string, transactionId: string) {
  const admin = createAdminClient();
  if (!admin) throw new Error("Platform database is not configured.");

  const { data: attempt, error: attemptError } = await admin
    .from("payment_attempts")
    .select("reference,user_id,email,amount_kobo,currency,status")
    .eq("reference", reference)
    .maybeSingle();
  if (attemptError || !attempt) throw new Error("Payment reference was not created by NounCompass.");

  const verification = await verifyFlutterwaveTransaction(transactionId);
  const paidAt = assertSemesterPassTransaction(verification.data);
  if (verification.data.tx_ref !== attempt.reference) throw new Error("Payment reference mismatch.");
  assertFlutterwaveCustomerIdentity(verification.data, attempt.email);

  const { error: responseError } = await admin.from("payment_attempts").update({
    provider_response: {
      provider: "flutterwave",
      transaction_id: String(verification.data.id),
      status: verification.data.status,
      amount: verification.data.amount,
      currency: verification.data.currency,
      customer_email: verification.data.customer.email,
      customer_metadata_email: verification.data.meta?.nouncompass_customer_email,
      verified_at: new Date().toISOString(),
    },
    updated_at: new Date().toISOString(),
  }).eq("reference", reference);
  if (responseError) throw responseError;

  const { data: membership, error } = await admin.rpc("activate_semester_pass", {
    p_reference: reference,
    p_paid_at: paidAt,
  });
  if (error) throw error;
  return membership;
}

export async function revokePaymentEntitlement(reference: string, reason: "refunded" | "chargeback") {
  const admin = createAdminClient();
  if (!admin) throw new Error("Platform database is not configured.");
  const { data: attempt } = await admin.from("payment_attempts").select("user_id").eq("reference", reference).maybeSingle();
  if (!attempt) throw new Error("Unknown payment reference.");
  await admin.from("payment_attempts").update({ status: reason, updated_at: new Date().toISOString() }).eq("reference", reference);
  const { data: memberships } = await admin.from("memberships").update({ status: reason === "refunded" ? "refunded" : "revoked", ends_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("payment_reference", reference).select("id");
  await admin.from("audit_logs").insert({ action: `membership.${reason}`, entity_type: "payment", entity_id: reference, details: { user_id: attempt.user_id, memberships: memberships?.map((item) => item.id) ?? [] } });
}
