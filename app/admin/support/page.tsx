import Link from "next/link";
import {
  AdminDataTable,
  AdminFeedback,
  AdminPageHeader,
  AdminPagination,
  AdminStatusBadge,
  type AdminColumn,
} from "@/components/admin/admin-ui";
import { requirePermission } from "@/lib/platform/admin-auth";
import { formatAdminDate, safePage } from "@/lib/platform/admin-format";
import { createAdminClient } from "@/lib/supabase/admin";

type SupportRow = {
  id: string;
  ticket_number: string;
  user_id: string;
  email: string;
  display_name: string | null;
  subject: string;
  category: string;
  priority: string;
  status: string;
  assigned_to: string | null;
  assigned_email: string | null;
  last_response_at: string | null;
  created_at: string;
  updated_at: string;
  total_count: number;
};

const PAGE_SIZE = 25;

export const dynamic = "force-dynamic";

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await requirePermission("support.read", "/admin/support");
  const params = await searchParams;
  const page = safePage(params.page);
  const admin = createAdminClient();
  const { data, error } = admin
    ? await admin.rpc("admin_list_support_tickets", {
        p_query: params.q?.trim() || null,
        p_status: [
          "open",
          "in-progress",
          "waiting-on-student",
          "resolved",
          "closed",
        ].includes(params.status ?? "")
          ? params.status
          : null,
        p_priority: ["low", "normal", "high", "urgent"].includes(
          params.priority ?? "",
        )
          ? params.priority
          : null,
        p_category: [
          "account",
          "membership",
          "payment",
          "academic-content",
          "technical",
          "other",
        ].includes(params.category ?? "")
          ? params.category
          : null,
        p_assignment: ["unassigned", "mine"].includes(params.assignment ?? "")
          ? params.assignment
          : null,
        p_assigned_user: session.user.id,
        p_offset: (page - 1) * PAGE_SIZE,
        p_limit: PAGE_SIZE,
      })
    : { data: [], error: new Error("Database is not configured.") };
  const tickets = (data ?? []) as SupportRow[];
  const total = tickets[0]?.total_count ?? 0;
  const buildHref = (targetPage: number) => {
    const next = new URLSearchParams();
    Object.entries(params).forEach(([key, currentValue]) => {
      if (currentValue && !["page", "error", "notice"].includes(key)) {
        next.set(key, currentValue);
      }
    });
    next.set("page", String(targetPage));
    return `/admin/support?${next.toString()}`;
  };
  const columns: AdminColumn<SupportRow>[] = [
    {
      key: "ticket",
      header: "Ticket",
      render: (ticket) => (
        <>
          <strong>{ticket.ticket_number}</strong>
          <small>{ticket.subject}</small>
        </>
      ),
    },
    {
      key: "user",
      header: "Student",
      render: (ticket) => (
        <>
          <strong>{ticket.display_name || ticket.email}</strong>
          <small>{ticket.email}</small>
        </>
      ),
    },
    {
      key: "category",
      header: "Category / priority",
      render: (ticket) => (
        <>
          <strong>{ticket.category.replaceAll("-", " ")}</strong>
          <AdminStatusBadge value={ticket.priority} />
        </>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (ticket) => <AdminStatusBadge value={ticket.status} />,
    },
    {
      key: "assigned",
      header: "Assigned staff",
      render: (ticket) => ticket.assigned_email || "Unassigned",
    },
    {
      key: "activity",
      header: "Activity",
      render: (ticket) => (
        <>
          <strong>Updated {formatAdminDate(ticket.updated_at)}</strong>
          <small>Last message {formatAdminDate(ticket.last_response_at)}</small>
        </>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (ticket) => (
        <Link
          className="admin-button admin-button-secondary admin-button-small"
          href={`/admin/support/${ticket.id}`}
        >
          Open
        </Link>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Student support operations"
        title="Support"
        description="Prioritise, assign, answer, and resolve student tickets. Internal notes are restricted to staff and never included in student-facing ticket queries."
      />
      <AdminFeedback
        error={params.error || (error ? error.message : undefined)}
        notice={params.notice}
      />
      <section className="admin-panel">
        <form className="admin-filters" method="get">
          <label>
            Ticket, subject, or email
            <input name="q" defaultValue={params.q ?? ""} />
          </label>
          <label>
            Status
            <select name="status" defaultValue={params.status ?? ""}>
              <option value="">All statuses</option>
              <option value="open">Open</option>
              <option value="in-progress">In progress</option>
              <option value="waiting-on-student">Waiting on student</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </label>
          <label>
            Priority
            <select name="priority" defaultValue={params.priority ?? ""}>
              <option value="">All priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label>
            Category
            <select name="category" defaultValue={params.category ?? ""}>
              <option value="">All categories</option>
              <option value="account">Account</option>
              <option value="membership">Membership</option>
              <option value="payment">Payment</option>
              <option value="academic-content">Academic content</option>
              <option value="technical">Technical</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            Assignment
            <select name="assignment" defaultValue={params.assignment ?? ""}>
              <option value="">Any assignment</option>
              <option value="unassigned">Unassigned</option>
              <option value="mine">Assigned to me</option>
            </select>
          </label>
          <div className="admin-filter-actions">
            <button className="admin-button" type="submit">
              Apply
            </button>
            <Link
              className="admin-button admin-button-secondary"
              href="/admin/support"
            >
              Reset
            </Link>
          </div>
        </form>
      </section>
      <section className="admin-panel">
        <div className="admin-panel-heading">
          <h2>{total.toLocaleString("en-NG")} matching tickets</h2>
        </div>
        <AdminDataTable
          caption="NounCompass support tickets"
          columns={columns}
          rows={tickets}
          rowKey={(ticket) => ticket.id}
        />
        <AdminPagination
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          buildHref={buildHref}
        />
      </section>
    </>
  );
}
