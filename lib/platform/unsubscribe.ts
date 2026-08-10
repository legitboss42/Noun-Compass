import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  normalizeUnsubscribeEmail,
  unsubscribeHeaders,
  unsubscribeUrl,
  verifyUnsubscribeToken,
  type UnsubscribeScope,
} from "./unsubscribe-core";

/**
 * Signing key for unsubscribe links. Falls back to the service-role key so an
 * unconfigured deploy still produces working links rather than silently sending
 * mail nobody can opt out of — but a dedicated secret is preferred, because
 * rotating the service role would otherwise invalidate every link already sent.
 */
function unsubscribeSecret() {
  return process.env.UNSUBSCRIBE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

export function siteBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://nouncompass.me";
}

export function unsubscribeLinkFor(email: string, scope: UnsubscribeScope = "updates") {
  return unsubscribeUrl(siteBaseUrl(), email, scope, unsubscribeSecret());
}

export function unsubscribeHeadersFor(email: string, scope: UnsubscribeScope = "updates") {
  return unsubscribeHeaders(siteBaseUrl(), email, scope, unsubscribeSecret());
}

export function unsubscribeLinkIsValid(email: string, scope: UnsubscribeScope, token: unknown) {
  return verifyUnsubscribeToken(email, scope, token, unsubscribeSecret());
}

export type UnsubscribeOutcome = {
  email: string;
  scope: UnsubscribeScope;
  /** True when at least one consent record was found and cleared. */
  applied: boolean;
};

/**
 * Marketing consent lives in two places: newsletter_subscribers for addresses
 * that signed up without an account, and email_preferences for registered
 * students. A single address can be in both, so an unsubscribe clears both
 * rather than whichever one happens to be checked first.
 *
 * Nothing here reveals whether the address is registered: the caller returns the
 * same confirmation either way, so the endpoint cannot be used to test which
 * emails have accounts.
 */
export async function applyUnsubscribe(rawEmail: string, scope: UnsubscribeScope): Promise<UnsubscribeOutcome> {
  const email = normalizeUnsubscribeEmail(rawEmail);
  const admin = createAdminClient();
  if (!admin) return { email, scope, applied: false };
  const now = new Date().toISOString();
  let applied = false;

  const { data: subscriber } = await admin
    .from("newsletter_subscribers")
    .update({ status: "unsubscribed", unsubscribed_at: now, updated_at: now })
    .eq("email", email)
    .eq("status", "subscribed")
    .select("id");
  if (subscriber?.length) applied = true;

  const userId = await findUserIdByEmail(admin, email);
  if (userId) {
    // "updates" stops marketing only. "all" also stops the optional study and
    // deadline reminders, which a student may reasonably read as "stop
    // emailing me" — account and payment mail stays, since it is not marketing.
    const preferences = scope === "all"
      ? {
          product_updates: false,
          study_reminders: false,
          deadline_reminders: false,
          revision_reminders: false,
          membership_reminders: false,
          updated_at: now,
        }
      : { product_updates: false, updated_at: now };
    const { error } = await admin
      .from("email_preferences")
      .upsert({ user_id: userId, ...preferences }, { onConflict: "user_id" });
    if (!error) applied = true;
  }

  return { email, scope, applied };
}

async function findUserIdByEmail(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  email: string,
) {
  // The admin API pages rather than filters, so this walks a bounded number of
  // pages. The list is small today and the alternative is exposing auth.users.
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data?.users?.length) return null;
    const match = data.users.find((user) => user.email?.toLowerCase() === email);
    if (match) return match.id;
    if (data.users.length < 200) return null;
  }
  return null;
}
