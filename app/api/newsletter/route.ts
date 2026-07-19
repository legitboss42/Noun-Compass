import { createAdminClient } from "@/lib/supabase/admin";
import { enforceNewsletterRateLimit, normalizeNewsletterEmail, syncSubscriberToBrevo } from "@/lib/newsletter";

export const runtime = "nodejs";

const responseHeaders = { "X-Robots-Tag": "noindex, nofollow, noarchive" };

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { email?: unknown; consent?: unknown; website?: unknown; source?: unknown };
    if (typeof payload.website === "string" && payload.website.trim()) {
      return Response.json({ message: "Thanks. Your email has been saved." }, { headers: responseHeaders });
    }
    if (payload.consent !== true) throw new Error("Please confirm that you agree to receive email updates.");

    const email = normalizeNewsletterEmail(payload.email);
    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    enforceNewsletterRateLimit(forwardedFor || email);
    const source = payload.source === "homepage" ? "homepage" : "website";
    const consentVersion = "2026-07-19";
    const admin = createAdminClient();
    let stored = false;

    if (admin) {
      const { error } = await admin.from("newsletter_subscribers").upsert({
        email,
        status: "subscribed",
        consent_source: source,
        consent_version: consentVersion,
        consented_at: new Date().toISOString(),
        unsubscribed_at: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "email" });
      if (error && error.code !== "42P01") throw new Error("We could not save your email right now.");
      stored = !error;
    }

    let synced = false;
    try {
      const brevo = await syncSubscriberToBrevo(email);
      synced = brevo.synced;
      if (synced && admin && stored) {
        await admin.from("newsletter_subscribers").update({ brevo_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("email", email);
      }
    } catch {
      // The database record is the retry source when Brevo is temporarily unavailable.
    }

    if (!stored && !synced) {
      return Response.json({ message: "Email updates are being configured. Please try again shortly." }, { status: 503, headers: responseHeaders });
    }

    return Response.json({ message: "You are on the NounCompass updates list. We will only email when there is something useful to share." }, { headers: responseHeaders });
  } catch (error) {
    return Response.json({ message: error instanceof Error ? error.message : "We could not save your email right now." }, { status: 400, headers: responseHeaders });
  }
}
