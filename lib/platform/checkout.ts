import type { SupabaseClient } from "@supabase/supabase-js";
import { platformConfig } from "./config";

type PaymentAttemptInput = {
  reference: string;
  userId: string;
  email: string;
};

type SupabaseError = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

function logCheckoutDatabaseError(stage: string, error: SupabaseError | null) {
  if (!error) return;
  console.error("Checkout database preparation failed", {
    stage,
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
  });
}

async function ensureSemesterPassPlan(admin: SupabaseClient) {
  const { error } = await admin.from("membership_plans").upsert({
    plan_key: platformConfig.semesterPass.key,
    name: "NOUN Compass Semester Pass",
    amount_kobo: platformConfig.semesterPass.amountKobo,
    currency: platformConfig.semesterPass.currency,
    duration_days: platformConfig.semesterPass.durationDays,
    active: true,
  }, { onConflict: "plan_key" });

  if (error) {
    logCheckoutDatabaseError("membership_plan_upsert", error);
    throw new Error("Could not prepare checkout.");
  }
}

async function insertPaymentAttempt(admin: SupabaseClient, input: PaymentAttemptInput) {
  return admin.from("payment_attempts").insert({
    reference: input.reference,
    user_id: input.userId,
    plan_key: platformConfig.semesterPass.key,
    email: input.email,
    amount_kobo: platformConfig.semesterPass.amountKobo,
    currency: platformConfig.semesterPass.currency,
  });
}

function couldBeMissingPlan(error: SupabaseError | null) {
  const text = `${error?.message ?? ""} ${error?.details ?? ""} ${error?.hint ?? ""}`.toLowerCase();
  return error?.code === "23503" && text.includes("membership_plans");
}

export async function prepareCheckoutPaymentAttempt(admin: SupabaseClient, input: PaymentAttemptInput) {
  const firstAttempt = await insertPaymentAttempt(admin, input);
  if (!firstAttempt.error) return;

  logCheckoutDatabaseError("payment_attempt_insert", firstAttempt.error);
  if (!couldBeMissingPlan(firstAttempt.error)) {
    throw new Error("Could not prepare checkout.");
  }

  await ensureSemesterPassPlan(admin);
  const retry = await insertPaymentAttempt(admin, input);
  if (retry.error) {
    logCheckoutDatabaseError("payment_attempt_insert_retry", retry.error);
    throw new Error("Could not prepare checkout.");
  }
}
