import {
  AdminConfirmationFields,
  AdminDataTable,
  AdminEmptyState,
  AdminFeedback,
  AdminPageHeader,
  AdminStatCard,
  type AdminColumn,
} from "@/components/admin/admin-ui";
import { requirePermission } from "@/lib/platform/admin-auth";
import { formatAdminDate } from "@/lib/platform/admin-format";
import {
  clampQuietDays,
  countInactiveByStage,
  inactiveParamsFromEnv,
  selectInactiveStudents,
  type InactiveStudent,
} from "@/lib/platform/inactive-students";
import { STAGE_META, type InactiveStage } from "@/lib/platform/stage-email-core";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendStageCampaign, sendToOneStudent } from "./actions";

export const dynamic = "force-dynamic";

const STAGE_ORDER: InactiveStage[] = ["s1", "s2", "s3", "s4"];

function whereStopped(student: InactiveStudent) {
  const label = STAGE_META[student.stage].label;
  const course = student.context?.course_title?.trim();
  return student.stage === "s4" && course ? `${label} — ${course}` : label;
}

export default async function AdminReengagementPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string; quiet?: string }>;
}) {
  const params = await searchParams;
  await requirePermission("settings.manage", "/admin/reengagement");
  const admin = createAdminClient();
  const base = inactiveParamsFromEnv();
  const quietDays = clampQuietDays(params.quiet, base.quietDays);
  const knobs = { ...base, quietDays };

  let counts: Record<InactiveStage, number> | null = null;
  const listsByStage: Partial<Record<InactiveStage, InactiveStudent[]>> = {};
  let previewError: string | null = null;

  if (!admin) {
    previewError = "Database is not configured.";
  } else {
    try {
      counts = await countInactiveByStage(admin, knobs);
      for (const stage of STAGE_ORDER) {
        if (counts[stage] > 0) {
          listsByStage[stage] = await selectInactiveStudents(admin, knobs, stage);
        }
      }
    } catch (error) {
      previewError = error instanceof Error ? error.message : "Could not read the audience.";
    }
  }

  const cronEnabled = process.env.REENGAGEMENT_ENABLED === "true";

  const columns = (stage: InactiveStage, quietDays: number): AdminColumn<InactiveStudent>[] => [
    {
      key: "student",
      header: "Student",
      render: (s) => (
        <>
          <strong>{s.display_name || s.email || "Unknown"}</strong>
          <small>{s.email ?? "No email on file"}</small>
        </>
      ),
    },
    { key: "stopped", header: "Where they stopped", render: (s) => whereStopped(s) },
    {
      key: "last",
      header: "Last active",
      render: (s) => (s.last_activity_at ? formatAdminDate(s.last_activity_at) : "No activity yet"),
    },
    {
      key: "send",
      header: "Action",
      render: (s) =>
        s.email ? (
          <form action={sendToOneStudent}>
            <input type="hidden" name="stage" value={stage} />
            <input type="hidden" name="user_id" value={s.user_id} />
            <input type="hidden" name="reason" value={`Individual ${stage.toUpperCase()} re-engagement`} />
            <input type="hidden" name="quiet" value={quietDays} />
            <button className="admin-button admin-button-small" type="submit">Send</button>
          </form>
        ) : (
          <span>—</span>
        ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Lifecycle email"
        title="Inactive students"
        description={`Students who signed up, went quiet for ${quietDays}+ days, and are grouped by the furthest step they reached. Sending here carries a one-click unsubscribe and a ${knobs.cooldownDays}-day cooldown, and never turns the daily cron on or off.`}
      />
      <AdminFeedback error={params.error ?? previewError ?? undefined} notice={params.notice} />

      <section className="admin-panel">
        <form className="admin-filters" method="get">
          <label>
            Quiet for at least (days)
            <input name="quiet" type="number" min={1} max={90} defaultValue={quietDays} />
          </label>
          <div className="admin-filter-actions">
            <button className="admin-button" type="submit">Apply</button>
          </div>
        </form>
      </section>

      <section className="admin-stat-grid" aria-label="Inactive stages">
        {STAGE_ORDER.map((stage) => (
          <AdminStatCard
            key={stage}
            label={STAGE_META[stage].label}
            value={counts ? counts[stage] : "—"}
            detail={STAGE_META[stage].blurb}
            unavailable={counts === null}
          />
        ))}
        <AdminStatCard
          label="Automatic daily cron"
          value={cronEnabled ? "On" : "Off"}
          detail={cronEnabled ? "The daily job also nudges never-started students" : "REENGAGEMENT_ENABLED is not set to true"}
        />
      </section>

      {STAGE_ORDER.map((stage) => {
        const rows = listsByStage[stage] ?? [];
        const count = counts ? counts[stage] : 0;
        if (!count) return null;
        const capped = count > rows.length;
        return (
          <section className="admin-panel" key={stage} aria-label={STAGE_META[stage].label}>
            <div className="admin-panel-heading">
              <div>
                <span className="eyebrow">{stage.toUpperCase()}</span>
                <h2>{STAGE_META[stage].label} · {count}</h2>
              </div>
            </div>

            <form action={sendStageCampaign} className="admin-form">
              <input type="hidden" name="stage" value={stage} />
              <input type="hidden" name="quiet" value={quietDays} />
              <p>
                This emails the <strong>{rows.length}</strong> eligible student
                {rows.length === 1 ? "" : "s"} shown below
                {capped ? ` (of ${count} in this stage; capped at ${knobs.limit} per send)` : ""}.
                Each carries a one-click unsubscribe and a {knobs.cooldownDays}-day hold.
              </p>
              <AdminConfirmationFields phrase="SEND" reasonLabel={`Why send to ${STAGE_META[stage].label}?`} />
              <button className="admin-button" type="submit">Send to all of {stage.toUpperCase()}</button>
            </form>

            <AdminDataTable
              caption={`${STAGE_META[stage].label} — inactive students`}
              columns={columns(stage, quietDays)}
              rows={rows}
              rowKey={(s) => s.user_id}
              emptyTitle="No one to email"
              emptyDescription="No eligible students in this stage right now."
            />
          </section>
        );
      })}

      {counts && STAGE_ORDER.every((stage) => counts![stage] === 0) ? (
        <AdminEmptyState
          title="No inactive students"
          description="No verified, opted-in students are quiet and outside the cooldown window at this threshold."
        />
      ) : null}
    </>
  );
}
