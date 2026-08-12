"use server";

import { redirect } from "next/navigation";
import { normalizeNewsletterEmail, syncSubscriberToBrevo } from "@/lib/newsletter";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { safeInternalReturnPath } from "@/lib/platform/return-path";

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

async function subscribeSignupEmail(email: string) {
  const normalizedEmail = normalizeNewsletterEmail(email);
  const admin = createAdminClient();
  const now = new Date().toISOString();

  if (admin) {
    await admin.from("newsletter_subscribers").upsert(
      {
        email: normalizedEmail,
        status: "subscribed",
        consent_source: "account-sign-up",
        consent_version: "2026-07-19",
        consented_at: now,
        unsubscribed_at: null,
        updated_at: now,
      },
      { onConflict: "email" },
    );
  }

  try {
    const brevo = await syncSubscriberToBrevo(normalizedEmail);
    if (brevo.synced && admin) {
      await admin
        .from("newsletter_subscribers")
        .update({ brevo_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("email", normalizedEmail);
    }
  } catch {
    // The database record is enough for the daily sync job to retry later.
  }
}

export async function signIn(formData: FormData) {
  const email = text(formData, "email").toLowerCase();
  const password = text(formData, "password");
  const next = safeInternalReturnPath(text(formData, "next"), "/dashboard");
  const supabase = await createClient();
  if (!supabase) redirect("/account/sign-in?error=Accounts+are+not+configured+yet");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/account/sign-in?error=${encodeURIComponent("Email or password was not accepted.")}`);
  redirect(next);
}

export async function signUp(formData: FormData) {
  const displayName = text(formData, "displayName").slice(0, 100);
  const email = text(formData, "email").toLowerCase();
  const password = text(formData, "password");
  const newsletterConsent = formData.get("newsletterConsent") === "yes";
  const next = safeInternalReturnPath(text(formData, "next"), "/dashboard/profile");
  if (password.length < 10) redirect("/account/sign-up?error=Use+a+password+with+at+least+10+characters");
  const supabase = await createClient();
  if (!supabase) redirect("/account/sign-up?error=Accounts+are+not+configured+yet");
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://nouncompass.me"}/account/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) redirect(`/account/sign-up?error=${encodeURIComponent("We could not create the account. Check the details and try again.")}`);
  if (newsletterConsent) await subscribeSignupEmail(email);
  redirect(`/account/sign-in?notice=Check+your+email+to+verify+the+account&next=${encodeURIComponent(next)}`);
}

export async function requestPasswordReset(formData: FormData) {
  const email = text(formData, "email").toLowerCase();
  const supabase = await createClient();
  if (supabase) {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://nouncompass.me"}/account/reset-password/update`,
    });
  }
  redirect("/account/sign-in?notice=If+the+address+has+an+account,+a+reset+email+has+been+sent");
}

export async function updatePassword(formData: FormData) {
  const password = text(formData, "password");
  if (password.length < 10) redirect("/account/reset-password/update?error=Use+at+least+10+characters");
  const supabase = await createClient();
  if (!supabase) redirect("/account/sign-in?error=Accounts+are+not+configured");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect("/account/reset-password/update?error=The+password+could+not+be+updated");
  redirect("/dashboard?notice=Password+updated");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  redirect("/");
}
