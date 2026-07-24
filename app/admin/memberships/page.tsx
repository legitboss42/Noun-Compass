import Link from "next/link";
import {
  AdminConfirmationFields,
  AdminDataTable,
  AdminFeedback,
  AdminPageHeader,
  AdminPagination,
  AdminStatusBadge,
  type AdminColumn,
} from "@/components/admin/admin-ui";
import {
  extendMembership,
  grantMembership,
  setMembershipRevocation,
} from "./actions";
import { requirePermission } from "@/lib/platform/admin-auth";
import { formatAdminDate, safePage } from "@/lib/platform/admin-format";
import type { MembershipStatus } from "@/lib/platform/types";
import { createAdminClient } from "@/lib/supabase/admin";

type MembershipRow = {
  id: string;
  user_id: string;
  email: string;
  display_name: string | null;
  plan_key: string;
  plan_name: string;
  status: MembershipStatus;
  source: string;
  payment_reference: string | null;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  days_remaining: number | null;
  total_count: number;
};

const PAGE_SIZE = 25;

export const dynamic = "force-dynamic";

export default async function MembershipsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("memberships.read", "/admin/memberships");
  const params = await searchParams;
  const page = safePage(params.page);
  const status = [
    "pending",
    "active",
    "expired",
    "refunded",
    "revoked",
  ].includes(params.status ?? "")
    ? (params.status as MembershipStatus)
    : null;
  const admin = createAdminClient();
  const { data, error } = admin
    ? await admin.rpc("admin_list_memberships", {
        p_query: params.q?.trim() || null,
        p_status: status,
        p_source: ["payment", "manual"].includes(params.source ?? "")
          ? params.source
          : null,
        p_expiring_soon: params.expiring === "true",
        p_offset: (page - 1) * PAGE_SIZE,
        p_limit: PAGE_SIZE,
      })
    : { data: [], error: new Error("Database is not configured.") };
  const memberships = (data ?? []) as MembershipRow[];
  const total = memberships[0]?.total_count ?? 0;
  const buildHref = (targetPage: number) => {
    const next = new URLSearchParams();
    Object.entries(params).forEach(([key, currentValue]) => {
      if (currentValue && !["page", "error", "notice"].includes(key)) {
        next.set(key, currentValue);
      }
    });
    next.set("page", String(targetPage));
    return `/admin/memberships?${next.toString()}`;
  };

  const columns: AdminColumn<MembershipRow>[] = [
    {
      key: "user",
      header: "User",
      render: (membership) => (
        <>
          <strong>{membership.display_name || membership.email}</strong>
          <small>{membership.email}</small>
          <Link href={`/admin/users/${membership.user_id}`}>Open user</Link>
        </>
      ),
    },
    {
      key: "plan",
      header: "Plan / source",
      render: (membership) => (
        <>
          <strong>{membership.plan_name}</strong>
          <small>{membership.source === "manual" ? "Manually granted" : "Payment activated"}</small>
        </>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (membership) => (
        <>
          <AdminStatusBadge value={membership.status} />
          <small>
            {membership.days_remaining === null
              ? "No expiry recorded"
              : `${membership.days_remaining} days remaining`}
          </small>
        </>
      ),
    },
    {
      key: "period",
      header: "Access period",
      render: (membership) => (
        <>
          <strong>{formatAdminDate(membership.starts_at)}</strong>
          <small>Ends {formatAdminDate(membership.ends_at)}</small>
        </>
      ),
    },
    {
      key: "payment",
      header: "Related payment",
      render: (membership) =>
        membership.payment_reference ? (
          <Link href={`/admin/payments?q=${membership.payment_reference}`}>
            {membership.payment_reference}
          </Link>
        ) : (
          "No payment record changed"
        ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (membership) => (
        <details>
          <summary>Manage</summary>
          <div className="admin-form">
            <form className="admin-form" action={extendMembership}>
              <input type="hidden" name="membershipId" value={membership.id} />
              <label>Days to add<input name="days" type="number" min={1} max={730} defaultValue={180} required /></label>
              <AdminConfirmationFields phrase="EXTEND" />
              <button className="admin-button admin-button-small" type="submit">Extend</button>
            </form>
            <form className="admin-form" action={setMembershipRevocation}>
              <input type="hidden" name="membershipId" value={membership.id} />
              <input type="hidden" name="mode" value={membership.status === "revoked" ? "restore" : "revoke"} />
              <AdminConfirmationFields phrase={membership.status === "revoked" ? "RESTORE" : "REVOKE"} />
              <button className={`admin-button admin-button-small ${membership.status === "revoked" ? "" : "admin-button-danger"}`} type="submit">
                {membership.status === "revoked" ? "Restore" : "Revoke"}
              </button>
            </form>
          </div>
        </details>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Access operations"
        title="Memberships"
        description="Manage Semester Pass access independently from verified payment truth. Manual changes always require a reason and create an entitlement adjustment and audit record."
      />
      <AdminFeedback error={params.error || (error ? error.message : undefined)} notice={params.notice} />
      <section className="admin-panel">
        <form className="admin-filters" method="get">
          <label>
            User, email, or payment reference
            <input name="q" defaultValue={params.q ?? ""} />
          </label>
          <label>
            Status
            <select name="status" defaultValue={params.status ?? ""}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="revoked">Revoked</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          </label>
          <label>
            Source
            <select name="source" defaultValue={params.source ?? ""}>
              <option value="">All sources</option>
              <option value="payment">Payment activated</option>
              <option value="manual">Manually granted</option>
            </select>
          </label>
          <label>
            Expiry
            <select name="expiring" defaultValue={params.expiring ?? ""}>
              <option value="">Any expiry</option>
              <option value="true">Within 7 days</option>
            </select>
          </label>
          <div className="admin-filter-actions">
            <button className="admin-button" type="submit">Apply</button>
            <Link className="admin-button admin-button-secondary" href="/admin/memberships">Reset</Link>
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <details>
          <summary>Grant a manual Semester Pass</summary>
          <form className="admin-form" action={grantMembership}>
            <label>User ID<input name="userId" required /></label>
            <p className="admin-warning">
              This grants the configured Semester Pass without marking any
              payment successful.
            </p>
            <AdminConfirmationFields phrase="GRANT" />
            <button className="admin-button" type="submit">Grant access</button>
          </form>
        </details>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading"><h2>{total.toLocaleString("en-NG")} memberships</h2></div>
        <AdminDataTable
          caption="NounCompass memberships"
          columns={columns}
          rows={memberships}
          rowKey={(membership) => membership.id}
        />
        <AdminPagination page={page} pageSize={PAGE_SIZE} total={total} buildHref={buildHref} />
      </section>
    </>
  );
}
