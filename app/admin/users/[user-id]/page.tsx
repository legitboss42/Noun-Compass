import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AdminConfirmationFields,
  AdminDataTable,
  AdminFeedback,
  AdminPageHeader,
  AdminStatusBadge,
  type AdminColumn,
} from "@/components/admin/admin-ui";
import { grantMembership } from "@/app/admin/memberships/actions";
import {
  assignUserRole,
  removeUserRole,
  sendRecoveryEmail,
  setUserSuspension,
} from "../actions";
import { requirePermission } from "@/lib/platform/admin-auth";
import { hasAdminPermission } from "@/lib/platform/admin-permissions";
import { formatAdminCurrency, formatAdminDate } from "@/lib/platform/admin-format";
import { userRoles, type UserRole } from "@/lib/platform/types";
import { createAdminClient } from "@/lib/supabase/admin";

type MembershipRow = {
  id: string;
  plan_key: string;
  status: string;
  source: string;
  starts_at: string | null;
  ends_at: string | null;
  payment_reference: string | null;
};

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ "user-id": string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const session = await requirePermission("users.read", "/admin/users");
  const userId = (await params)["user-id"];
  const messages = await searchParams;
  const admin = createAdminClient();
  if (!admin) {
    return (
      <section className="admin-panel" role="alert">
        <h1>Database unavailable</h1>
        <p>The service-role server configuration is required for this page.</p>
      </section>
    );
  }
  const { data: authData, error: authError } =
    await admin.auth.admin.getUserById(userId);
  if (authError || !authData.user) notFound();
  const user = authData.user;

  const [
    profileResult,
    roleResult,
    membershipsResult,
    paymentsResult,
    practiceCountResult,
    completedCountResult,
    supportResult,
    reportsResult,
    bookmarkCountResult,
    auditResult,
  ] = await Promise.all([
    admin.from("profiles").select("*").eq("id", userId).maybeSingle(),
    admin.from("user_roles").select("role,created_at").eq("user_id", userId),
    admin
      .from("memberships")
      .select("id,plan_key,status,source,starts_at,ends_at,payment_reference")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    admin
      .from("payment_attempts")
      .select("reference,amount_kobo,currency,status,paid_at,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    admin
      .from("practice_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    admin
      .from("practice_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed"),
    admin
      .from("support_tickets")
      .select("id,subject,status,priority,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    admin
      .from("question_reports")
      .select("id,question_id,report_type,status,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    admin
      .from("question_bookmarks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    admin
      .from("audit_logs")
      .select("id,actor_id,action,entity_type,entity_id,reason,created_at")
      .eq("entity_id", userId)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const roles = (roleResult.data ?? []).map((row) => row.role as UserRole);
  const memberships = (membershipsResult.data ?? []) as MembershipRow[];
  const suspended = Boolean(
    user.banned_until && new Date(user.banned_until) > new Date(),
  );
  const canManageUsers = hasAdminPermission(session.roles, "users.manage");
  const canManageRoles = hasAdminPermission(session.roles, "roles.manage");
  const canManageMemberships = hasAdminPermission(
    session.roles,
    "memberships.manage",
  );
  const providerList = Array.isArray(user.app_metadata.providers)
    ? user.app_metadata.providers.join(", ")
    : user.app_metadata.provider ?? "email";

  const membershipColumns: AdminColumn<MembershipRow>[] = [
    {
      key: "plan",
      header: "Plan",
      render: (membership) => (
        <>
          <strong>{membership.plan_key}</strong>
          <small>{membership.source}</small>
        </>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (membership) => <AdminStatusBadge value={membership.status} />,
    },
    {
      key: "period",
      header: "Access period",
      render: (membership) => (
        <>
          <strong>{formatAdminDate(membership.starts_at)}</strong>
          <small>to {formatAdminDate(membership.ends_at)}</small>
        </>
      ),
    },
    {
      key: "payment",
      header: "Payment",
      render: (membership) =>
        membership.payment_reference ? (
          <Link href={`/admin/payments?q=${membership.payment_reference}`}>
            {membership.payment_reference}
          </Link>
        ) : (
          "Manual grant"
        ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="User record"
        title={profileResult.data?.display_name || user.email || "User"}
        description="Authentication, profile, access, payment, practice, support, content-report, and audit context for one account."
        actions={
          <Link className="admin-button admin-button-secondary" href="/admin/users">
            Back to users
          </Link>
        }
      />
      <AdminFeedback error={messages.error} notice={messages.notice} />
      <section className="admin-grid-two">
        <div className="admin-panel">
          <h2>Identity and authentication</h2>
          <dl className="admin-detail-list">
            <div><dt>User ID</dt><dd>{user.id}</dd></div>
            <div><dt>Email</dt><dd>{user.email ?? "Not available"}</dd></div>
            <div><dt>Email confirmation</dt><dd>{formatAdminDate(user.email_confirmed_at)}</dd></div>
            <div><dt>Provider</dt><dd>{providerList}</dd></div>
            <div><dt>Signed up</dt><dd>{formatAdminDate(user.created_at)}</dd></div>
            <div><dt>Last sign-in</dt><dd>{formatAdminDate(user.last_sign_in_at)}</dd></div>
            <div><dt>Account status</dt><dd><AdminStatusBadge value={suspended ? "suspended" : "active"} /></dd></div>
          </dl>
        </div>
        <div className="admin-panel">
          <h2>Student profile</h2>
          <dl className="admin-detail-list">
            <div><dt>Display name</dt><dd>{profileResult.data?.display_name || "Not provided"}</dd></div>
            <div><dt>Programme</dt><dd>{profileResult.data?.programme || "Not provided"}</dd></div>
            <div><dt>Level</dt><dd>{profileResult.data?.level || "Not provided"}</dd></div>
            <div><dt>Study centre</dt><dd>{profileResult.data?.study_centre || "Not provided"}</dd></div>
            <div><dt>Exam mode</dt><dd>{profileResult.data?.exam_mode || "Not provided"}</dd></div>
            <div><dt>Faculty</dt><dd>Not collected by the current profile schema</dd></div>
            <div><dt>Phone</dt><dd>Not collected by the current profile schema</dd></div>
          </dl>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading"><h2>Roles</h2></div>
        <div className="admin-table-actions">
          {roles.map((role) => <AdminStatusBadge key={role} value={role} />)}
        </div>
        {canManageRoles ? (
          <div className="admin-grid-two">
            <form className="admin-form" action={assignUserRole}>
              <h3>Assign a role</h3>
              <input type="hidden" name="userId" value={userId} />
              <label>
                Role
                <select name="role" required>
                  {userRoles.filter((role) => !roles.includes(role)).map((role) => (
                    <option key={role} value={role}>{role.replaceAll("_", " ")}</option>
                  ))}
                </select>
              </label>
              <AdminConfirmationFields phrase="ASSIGN" />
              <button className="admin-button" type="submit">Assign role</button>
            </form>
            <div>
              <h3>Remove an elevated role</h3>
              {roles.filter((role) => role !== "student").map((role) => (
                <form className="admin-form" action={removeUserRole} key={role}>
                  <input type="hidden" name="userId" value={userId} />
                  <input type="hidden" name="role" value={role} />
                  <p>Remove <strong>{role.replaceAll("_", " ")}</strong>.</p>
                  <AdminConfirmationFields phrase="REMOVE" />
                  <button className="admin-button admin-button-danger" type="submit">Remove role</button>
                </form>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <h2>Membership history</h2>
          {canManageMemberships ? (
            <Link href="/admin/memberships">Open membership operations</Link>
          ) : null}
        </div>
        <AdminDataTable
          caption="User memberships"
          columns={membershipColumns}
          rows={memberships}
          rowKey={(membership) => membership.id}
          emptyTitle="No memberships"
          emptyDescription="This user has not received paid or manual premium access."
        />
        {canManageMemberships ? (
          <details>
            <summary>Grant a manual Semester Pass</summary>
            <form className="admin-form" action={grantMembership}>
              <input type="hidden" name="userId" value={userId} />
              <p>This creates an audited manual grant. It does not change payment records.</p>
              <AdminConfirmationFields phrase="GRANT" />
              <button className="admin-button" type="submit">Grant Semester Pass</button>
            </form>
          </details>
        ) : null}
      </section>

      <section className="admin-grid-two">
        <div className="admin-panel">
          <h2>Payments</h2>
          {paymentsResult.data?.length ? paymentsResult.data.map((payment) => (
            <article key={payment.reference}>
              <strong>{formatAdminCurrency(payment.amount_kobo, payment.currency)}</strong>
              <AdminStatusBadge value={payment.status} />
              <small>{formatAdminDate(payment.paid_at || payment.created_at)}</small>
              <Link href={`/admin/payments?q=${payment.reference}`}>Open payment</Link>
            </article>
          )) : <p>No payment attempts.</p>}
        </div>
        <div className="admin-panel">
          <h2>Learning activity</h2>
          <dl className="admin-detail-list">
            <div><dt>Practice sessions</dt><dd>{practiceCountResult.count ?? 0}</dd></div>
            <div><dt>Completed sessions</dt><dd>{completedCountResult.count ?? 0}</dd></div>
            <div><dt>Bookmarks</dt><dd>{bookmarkCountResult.count ?? 0}</dd></div>
            <div><dt>Question reports</dt><dd>{reportsResult.data?.length ?? 0} recent</dd></div>
          </dl>
        </div>
      </section>

      <section className="admin-grid-two">
        <div className="admin-panel">
          <h2>Support history</h2>
          {supportResult.data?.length ? supportResult.data.map((ticket) => (
            <article key={ticket.id}>
              <strong>{ticket.subject}</strong>
              <AdminStatusBadge value={ticket.priority} />{" "}
              <AdminStatusBadge value={ticket.status} />
              <small>{formatAdminDate(ticket.created_at)}</small>
              <Link href={`/admin/support/${ticket.id}`}>Open ticket</Link>
            </article>
          )) : <p>No support tickets.</p>}
        </div>
        <div className="admin-panel">
          <h2>Audit history involving this user</h2>
          {auditResult.data?.length ? auditResult.data.map((entry) => (
            <article key={entry.id}>
              <strong>{entry.action}</strong>
              <small>{entry.entity_type} · {formatAdminDate(entry.created_at)}</small>
              {entry.reason ? <p>{entry.reason}</p> : null}
            </article>
          )) : <p>No audit entries involve this user yet.</p>}
        </div>
      </section>

      {canManageUsers ? (
        <section className="admin-grid-two">
          <div className="admin-panel">
            <h2>Account access</h2>
            <form className="admin-form" action={setUserSuspension}>
              <input type="hidden" name="userId" value={userId} />
              <input type="hidden" name="mode" value={suspended ? "restore" : "suspend"} />
              <p className="admin-warning">
                {suspended
                  ? "Restoring removes the Supabase Auth ban."
                  : "Suspending blocks sign-in without deleting the account or its history."}
              </p>
              <AdminConfirmationFields phrase={suspended ? "RESTORE" : "SUSPEND"} />
              <button className={`admin-button ${suspended ? "" : "admin-button-danger"}`} type="submit">
                {suspended ? "Restore account" : "Suspend account"}
              </button>
            </form>
          </div>
          <div className="admin-panel">
            <h2>Password recovery</h2>
            <form className="admin-form" action={sendRecoveryEmail}>
              <input type="hidden" name="userId" value={userId} />
              <p>Supabase sends a recovery link to the verified account email. No password is visible to administrators.</p>
              <label>Reason<textarea name="reason" minLength={5} maxLength={1000} required rows={3} /></label>
              <button className="admin-button admin-button-secondary" type="submit">Send recovery email</button>
            </form>
          </div>
        </section>
      ) : null}
    </>
  );
}
