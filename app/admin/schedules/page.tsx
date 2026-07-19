import { importTimetable, publishSchedule } from "../actions";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminSchedulesPage({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string }> }) {
  const params = await searchParams;
  const admin = createAdminClient();
  const [{ data: versions }, { data: entries }] = admin ? await Promise.all([
    admin.from("exam_schedule_versions").select("id,label,exam_mode,status,source_url,source_checksum,created_at,academic_terms(name,session_code)").order("created_at", { ascending: false }).limit(20),
    admin.from("exam_schedule_entries").select("id,version_id,course_code,course_title,exam_date,starts_at,venue").order("exam_date").order("starts_at").limit(2000),
  ]) : [{ data: [] }, { data: [] }];

  return <>
    <header className="platform-heading"><div><span className="eyebrow">Versioned official data</span><h1>Exam schedules</h1><p>Import a structured copy of an official NOUN timetable, inspect the parsed rows and source checksum, then let an academic reviewer publish the approved version.</p></div></header>
    {params.error && <p className="form-message form-message-error">{params.error}</p>}
    {params.notice && <p className="form-message form-message-success">{params.notice}</p>}
    <section className="platform-panel"><h2>Import draft CSV</h2><form action={importTimetable} className="platform-form"><div className="platform-form-grid"><label>Term name<input name="termName" placeholder="2026_2 academic term" required /></label><label>Session code<input name="sessionCode" placeholder="2026_2" required /></label><label>Version label<input name="label" placeholder="Final POP timetable" required /></label><label>Exam mode<select name="examMode"><option value="e-exam">E-exam</option><option value="pop">POP</option><option value="mixed">Mixed</option></select></label></div><label>Official NOUN source URL<input name="sourceUrl" type="url" pattern="https://.*\.nou\.edu\.ng/.*|https://nou\.edu\.ng/.*" required /></label><label>CSV content<textarea name="csv" rows={12} required placeholder={'course_code,course_title,exam_date,starts_at,venue\nGST101,Use of English,2026-10-01,08:30,Lagos'} /></label><button className="button" type="submit">Validate and import draft</button></form></section>
    <section className="platform-panel"><h2>Schedule versions and row review</h2><div className="platform-ticket-list">{versions?.map((version) => {
      const term = version.academic_terms as unknown as { name: string; session_code: string } | null;
      const versionEntries = (entries ?? []).filter((entry) => entry.version_id === version.id);
      return <article key={version.id}><div><strong>{version.label}</strong><span>{version.status}</span></div><small>{term?.session_code} · {version.exam_mode} · {versionEntries.length} rows · checksum {version.source_checksum.slice(0, 12)}…</small><p><a href={version.source_url} target="_blank" rel="noopener noreferrer">Open official source</a></p>{versionEntries.length ? <details><summary>Inspect imported timetable rows</summary><div className="platform-ticket-list">{versionEntries.map((entry) => <article key={entry.id}><div><strong>{entry.course_code} — {entry.course_title || "Untitled course"}</strong><span>{entry.exam_date}</span></div><small>{String(entry.starts_at).slice(0, 5)}{entry.venue ? ` · ${entry.venue}` : ""}</small></article>)}</div></details> : null}{version.status === "draft" && <form action={publishSchedule}><input type="hidden" name="versionId" value={version.id} /><button disabled={!versionEntries.length}>Publish reviewed schedule</button></form>}</article>;
    })}</div></section>
  </>;
}
