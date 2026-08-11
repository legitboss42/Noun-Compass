import {
  AdminConfirmationFields,
  AdminEmptyState,
  AdminFeedback,
  AdminPageHeader,
  AdminStatCard,
} from "@/components/admin/admin-ui";
import { requirePermission } from "@/lib/platform/admin-auth";
import {
  reengagementParamsFromEnv,
  selectReengagementCandidates,
} from "@/lib/platform/reengagement";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendReengagementCampaign } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminReengagementPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const params = await searchParams;
  await requirePermission("settings.manage", "/admin/reengagement");
  const admin = createAdminClient();
  const knobs = reengagementParamsFromEnv();

  let candidateCount: number | null = null;
  let previewError: string | null = null;
  if (!admin) {
    previewError = "Database is not configured.";
  } else {
    try {
      const candidates = await selectReengagementCandidates(admin, knobs);
      candidateCount = candidates.length;
    } catch (error) {
      previewError = error instanceof Error ? error.message : "Could not read the audience.";
    }
  }

  const cronEnabled = process.env.REENGAGEMENT_ENABLED === "true";

  return (
    <>
      <AdminPageHeader
        eyebrow="Lifecycle email"
        title="Re-engagement nudge"
        description="Emails verified students who signed up but never opened a study tool. This is the same audience and message the daily cron uses; sending here does not turn the cron on or off."
      />
      <AdminFeedback error={params.error ?? previewError ?? undefined} notice={params.notice} />

      <section className="admin-stat-grid" aria-label="Re-engagement audience">
        <AdminStatCard
          label="Eligible right now"
          value={candidateCount ?? "—"}
          detail={`Capped at ${knobs.limit} per send · ${knobs.graceDays}-day grace · ${knobs.cooldownDays}-day cooldown`}
          unavailable={candidateCount === null}
        />
        <AdminStatCard
          label="Automatic daily cron"
          value={cronEnabled ? "On" : "Off"}
          detail={cronEnabled ? "The daily job also sends this nudge" : "REENGAGEMENT_ENABLED is not set to true"}
        />
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <span className="eyebrow">Manual send</span>
            <h2>Send to eligible students now</h2>
          </div>
        </div>
        {candidateCount && candidateCount > 0 ? (
          <form action={sendReengagementCampaign} className="admin-form">
            <p>
              This will email <strong>{candidateCount}</strong> student
              {candidateCount === 1 ? "" : "s"}. Each message carries a one-click
              unsubscribe, and anyone emailed is held for {knobs.cooldownDays} days
              before they can be emailed again.
            </p>
            <AdminConfirmationFields phrase="SEND" reasonLabel="Why are you sending this now?" />
            <button className="admin-button" type="submit">
              Send re-engagement emails
            </button>
          </form>
        ) : (
          <AdminEmptyState
            title="No one to email"
            description="No verified, inactive, opted-in students are outside the cooldown window right now."
          />
        )}
      </section>
    </>
  );
}
