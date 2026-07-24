import Link from "next/link";
import {
  AdminDataTable,
  AdminPageHeader,
  AdminPagination,
  type AdminColumn,
} from "@/components/admin/admin-ui";
import { requirePermission } from "@/lib/platform/admin-auth";
import { formatAdminDate, safePage } from "@/lib/platform/admin-format";
import { createAdminClient } from "@/lib/supabase/admin";

type AuditRow = {
  id: number;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  reason: string | null;
  previous_state: unknown;
  resulting_state: unknown;
  details: unknown;
  created_at: string;
};

const PAGE_SIZE = 40;

export const dynamic = "force-dynamic";

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("audit.read", "/admin/audit-log");
  const params = await searchParams;
  const page = safePage(params.page);
  const admin = createAdminClient();
  let query = admin
    ?.from("audit_logs")
    .select(
      "id,actor_id,action,entity_type,entity_id,reason,previous_state,resulting_state,details,created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (params.action?.trim()) query = query?.ilike("action", `%${params.action.trim()}%`);
  if (params.entity?.trim()) query = query?.eq("entity_type", params.entity.trim());
  const { data, count, error } = query
    ? await query
    : { data: [], count: 0, error: new Error("Database is not configured.") };
  const rows = (data ?? []) as AuditRow[];
  const actorEmails = new Map<string, string>();
  if (admin) {
    const { data: directory } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    directory.users.forEach((actor) => {
      actorEmails.set(actor.id, actor.email || actor.id);
    });
  }
  const columns: AdminColumn<AuditRow>[] = [
    {
      key: "event",
      header: "Action",
      render: (row) => (
        <>
          <strong>{row.action}</strong>
          <small>{formatAdminDate(row.created_at)}</small>
        </>
      ),
    },
    {
      key: "actor",
      header: "Administrator",
      render: (row) =>
        row.actor_id ? actorEmails.get(row.actor_id) || row.actor_id : "System",
    },
    {
      key: "target",
      header: "Target",
      render: (row) => (
        <>
          <strong>{row.entity_type}</strong>
          <small>{row.entity_id || "No target ID"}</small>
        </>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      render: (row) => row.reason || "No reason required for this event",
    },
    {
      key: "state",
      header: "Safe state record",
      render: (row) => (
        <details>
          <summary>Inspect</summary>
          <pre>{JSON.stringify({
            previous: row.previous_state,
            resulting: row.resulting_state,
            metadata: row.details,
          }, null, 2)}</pre>
        </details>
      ),
    },
  ];
  const buildHref = (targetPage: number) => {
    const next = new URLSearchParams();
    if (params.action) next.set("action", params.action);
    if (params.entity) next.set("entity", params.entity);
    next.set("page", String(targetPage));
    return `/admin/audit-log?${next.toString()}`;
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Accountability trail"
        title="Audit log"
        description="Review sensitive administrator actions and their safe before-and-after state. Secrets and full payment payloads are excluded by the audit logger."
      />
      {error ? <p className="admin-feedback admin-feedback-error" role="alert">{error.message}</p> : null}
      <section className="admin-panel">
        <form className="admin-filters" method="get">
          <label>
            Action contains
            <input name="action" defaultValue={params.action ?? ""} />
          </label>
          <label>
            Target type
            <input name="entity" defaultValue={params.entity ?? ""} />
          </label>
          <div className="admin-filter-actions">
            <button className="admin-button" type="submit">Apply</button>
            <Link className="admin-button admin-button-secondary" href="/admin/audit-log">Reset</Link>
          </div>
        </form>
      </section>
      <section className="admin-panel">
        <div className="admin-panel-heading">
          <h2>{(count ?? 0).toLocaleString("en-NG")} audit entries</h2>
        </div>
        <AdminDataTable
          caption="Administrator audit log"
          columns={columns}
          rows={rows}
          rowKey={(row) => String(row.id)}
        />
        <AdminPagination
          page={page}
          pageSize={PAGE_SIZE}
          total={count ?? 0}
          buildHref={buildHref}
        />
      </section>
    </>
  );
}
