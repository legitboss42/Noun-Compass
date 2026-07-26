import { importTimetable, publishSchedule } from "../actions";
import {
  AdminEmptyState,
  AdminFeedback,
  AdminPageHeader,
  AdminStatusBadge,
} from "@/components/admin/admin-ui";
import { requirePermission } from "@/lib/platform/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminSchedulesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const params = await searchParams;
  await requirePermission("schedules.write", "/admin/schedules");
  const admin = createAdminClient();
  const [{ data: versions }, { data: entries }] = admin
    ? await Promise.all([
        admin
          .from("exam_schedule_versions")
          .select(
            "id,label,exam_mode,status,source_url,source_checksum,created_at,academic_terms(name,session_code)",
          )
          .order("created_at", { ascending: false })
          .limit(20),
        admin
          .from("exam_schedule_entries")
          .select(
            "id,version_id,course_code,course_title,exam_date,starts_at,venue",
          )
          .order("exam_date")
          .order("starts_at")
          .limit(2000),
      ])
    : [{ data: [] }, { data: [] }];

  return (
    <>
      <AdminPageHeader
        eyebrow="Versioned official data"
        title="Exam schedules"
        description="Import a structured copy of an official NOUN timetable, inspect every parsed row and source checksum, then publish only the reviewed version."
      />
      <AdminFeedback error={params.error} notice={params.notice} />

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <span className="eyebrow">Controlled import</span>
            <h2>Import draft CSV</h2>
          </div>
        </div>
        <form action={importTimetable} className="admin-form">
          <div className="admin-form-row">
            <label>
              Term name
              <input
                name="termName"
                placeholder="2026_2 academic term"
                required
              />
            </label>
            <label>
              Session code
              <input name="sessionCode" placeholder="2026_2" required />
            </label>
            <label>
              Version label
              <input
                name="label"
                placeholder="Final POP timetable"
                required
              />
            </label>
            <label>
              Exam mode
              <select name="examMode">
                <option value="e-exam">E-exam</option>
                <option value="pop">POP</option>
                <option value="mixed">Mixed</option>
              </select>
            </label>
          </div>
          <label>
            Official NOUN source URL
            <input
              name="sourceUrl"
              type="url"
              pattern="https://.*\.nou\.edu\.ng/.*|https://nou\.edu\.ng/.*"
              required
            />
          </label>
          <label>
            CSV content
            <textarea
              name="csv"
              rows={12}
              required
              placeholder={
                "course_code,course_title,exam_date,starts_at,venue\nGST101,Use of English,2026-10-01,08:30,Lagos"
              }
            />
          </label>
          <button className="admin-button" type="submit">
            Validate and import draft
          </button>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <span className="eyebrow">Review queue</span>
            <h2>Schedule versions and rows</h2>
          </div>
        </div>
        {versions?.length ? (
          <div className="admin-schedule-list">
            {versions.map((version) => {
              const term = version.academic_terms as unknown as {
                name: string;
                session_code: string;
              } | null;
              const versionEntries = (entries ?? []).filter(
                (entry) => entry.version_id === version.id,
              );
              return (
                <article className="admin-schedule-card" key={version.id}>
                  <header>
                    <div>
                      <strong>{version.label}</strong>
                      <small>
                        {term?.session_code} · {version.exam_mode} ·{" "}
                        {versionEntries.length} rows
                      </small>
                    </div>
                    <AdminStatusBadge value={version.status} />
                  </header>
                  <p className="admin-schedule-checksum">
                    Source checksum: {version.source_checksum.slice(0, 12)}…
                  </p>
                  <a
                    href={version.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open official source
                  </a>
                  {versionEntries.length ? (
                    <details>
                      <summary>Inspect imported timetable rows</summary>
                      <div className="admin-schedule-rows">
                        {versionEntries.map((entry) => (
                          <article key={entry.id}>
                            <strong>
                              {entry.course_code} —{" "}
                              {entry.course_title || "Untitled course"}
                            </strong>
                            <span>
                              {entry.exam_date} at{" "}
                              {String(entry.starts_at).slice(0, 5)}
                              {entry.venue ? ` · ${entry.venue}` : ""}
                            </span>
                          </article>
                        ))}
                      </div>
                    </details>
                  ) : null}
                  {version.status === "draft" ? (
                    <form action={publishSchedule}>
                      <input
                        type="hidden"
                        name="versionId"
                        value={version.id}
                      />
                      <button
                        className="admin-button admin-button-small"
                        disabled={!versionEntries.length}
                      >
                        Publish reviewed schedule
                      </button>
                    </form>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <AdminEmptyState
            title="No schedule versions"
            description="Import a checked official timetable source to create the first draft version."
          />
        )}
      </section>
    </>
  );
}
