import Link from "next/link";
import { AdminPagination, AdminStatusBadge } from "@/components/admin/admin-ui";
import { requirePermission } from "@/lib/platform/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const PAGE_SIZE = 30;

type SearchParams = Promise<{
  q?: string;
  readiness?: string;
  page?: string;
}>;

export const dynamic = "force-dynamic";

export default async function QuestionCoveragePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requirePermission("questions.read", "/admin/question-coverage");
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const queryText = params.q?.trim() ?? "";
  const readiness = params.readiness ?? "";
  const admin = createAdminClient();
  if (!admin) {
    return (
      <section className="admin-panel">
        <h1>Course coverage</h1>
        <p>Coverage is unavailable because the platform database is not configured.</p>
      </section>
    );
  }

  let query = admin
    .from("question_course_coverage")
    .select(
      "course_code,course_title,level,semester,official_material_count,public_course_metadata_count,public_quiz_metadata_count,material_ready,blueprint_ready,draft_question_count,approved_question_count,published_question_count,demand_score,readiness_score,priority_score,computed_at",
      { count: "exact" },
    )
    .order("priority_score", { ascending: false })
    .order("course_code")
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (queryText) {
    query = query.or(`course_code.ilike.%${queryText}%,course_title.ilike.%${queryText}%`);
  }
  if (readiness === "material") query = query.eq("material_ready", true);
  if (readiness === "blueprint") query = query.eq("blueprint_ready", true);
  if (readiness === "published") query = query.gt("published_question_count", 0);
  if (readiness === "gap") {
    query = query.eq("material_ready", true).eq("published_question_count", 0);
  }
  const { data, count, error } = await query;

  const buildHref = (nextPage: number) => {
    const next = new URLSearchParams();
    if (queryText) next.set("q", queryText);
    if (readiness) next.set("readiness", readiness);
    next.set("page", String(nextPage));
    return `/admin/question-coverage?${next.toString()}`;
  };

  return (
    <>
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Question operations</p>
          <h1>Course coverage</h1>
          <p>Prioritise official-material readiness and reviewed question-bank gaps. Third-party data is shown only as aggregate metadata.</p>
        </div>
      </header>

      <section className="admin-panel">
        <form className="admin-filters" method="get">
          <label>
            Course code or title
            <input name="q" defaultValue={queryText} />
          </label>
          <label>
            Readiness
            <select name="readiness" defaultValue={readiness}>
              <option value="">All courses</option>
              <option value="material">Material ready</option>
              <option value="blueprint">Blueprint ready</option>
              <option value="published">Published bank</option>
              <option value="gap">Material ready, no published questions</option>
            </select>
          </label>
          <div className="admin-filter-actions">
            <button className="admin-button" type="submit">Apply</button>
            <Link className="admin-button admin-button-secondary" href="/admin/question-coverage">Reset</Link>
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <h2>{(count ?? 0).toLocaleString("en-NG")} matching courses</h2>
        </div>
        {error ? (
          <p role="alert">Coverage could not be loaded: {error.message}</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Course</th>
                  <th scope="col">Source coverage</th>
                  <th scope="col">Bank status</th>
                  <th scope="col">Scores</th>
                  <th scope="col">Computed</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((row) => (
                  <tr key={row.course_code}>
                    <td>
                      <strong>{row.course_code}</strong><br />
                      <small>{row.course_title}</small>
                    </td>
                    <td>
                      {row.official_material_count} official material(s)<br />
                      <small>{row.public_course_metadata_count} course · {row.public_quiz_metadata_count} quiz metadata pages</small>
                    </td>
                    <td>
                      <AdminStatusBadge value={row.published_question_count ? "published" : row.blueprint_ready ? "review" : "draft"} />
                      <br />
                      <small>{row.draft_question_count} draft · {row.approved_question_count} approved · {row.published_question_count} published</small>
                    </td>
                    <td>
                      Demand {Number(row.demand_score).toFixed(1)}<br />
                      <small>Readiness {Number(row.readiness_score).toFixed(1)} · Priority {Number(row.priority_score).toFixed(1)}</small>
                    </td>
                    <td><time dateTime={row.computed_at}>{new Date(row.computed_at).toLocaleDateString("en-NG")}</time></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data?.length ? <p>No real coverage records match this filter.</p> : null}
          </div>
        )}
        <AdminPagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} buildHref={buildHref} />
      </section>
    </>
  );
}
