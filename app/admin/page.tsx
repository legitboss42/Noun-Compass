import Link from "next/link";
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminStatCard,
  AdminStatusBadge,
} from "@/components/admin/admin-ui";
import { requirePermission } from "@/lib/platform/admin-auth";
import { hasAdminPermission } from "@/lib/platform/admin-permissions";
import {
  formatAdminCurrency,
  formatAdminDate,
} from "@/lib/platform/admin-format";
import { createAdminClient } from "@/lib/supabase/admin";

type RecentSignup = { id: string; email: string; created_at: string };
type RecentPayment = {
  reference: string;
  email: string;
  amount_kobo: number;
  currency: string;
  status: string;
  created_at: string;
};
type RecentSupport = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  updated_at: string;
};
type OverviewMetrics = {
  total_users: number;
  users_today: number;
  users_this_week: number;
  active_memberships: number;
  memberships_expiring_7d: number;
  successful_payments: number;
  failed_or_pending_payments: number;
  verified_revenue_kobo: number;
  open_support_tickets: number;
  unresolved_question_reports: number;
  total_question_banks: number;
  published_questions: number;
  recent_signups: RecentSignup[];
  recent_payments: RecentPayment[];
  recent_support: RecentSupport[];
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await requirePermission("overview.read", "/admin");
  const canReadUsers = hasAdminPermission(session.roles, "users.read");
  const canReadMemberships = hasAdminPermission(session.roles, "memberships.read");
  const canReadPayments = hasAdminPermission(session.roles, "payments.read");
  const canReadSupport = hasAdminPermission(session.roles, "support.read");
  const canReadQuestions = hasAdminPermission(session.roles, "questions.read");
  const admin = createAdminClient();
  const { data, error } = admin
    ? await admin.rpc("admin_overview_metrics")
    : { data: null, error: new Error("Database is not configured.") };
  const metrics = data as OverviewMetrics | null;

  return (
    <>
      <AdminPageHeader
        eyebrow="Operations overview"
        title="NounCompass administration"
        description="Live operational health and work queues from the protected production database, limited to the current administrator's permissions."
        actions={
          <>
            {canReadUsers ? (
              <Link className="admin-button admin-button-secondary" href="/admin/users">
                View users
              </Link>
            ) : null}
            {canReadSupport ? (
              <Link className="admin-button" href="/admin/support">
                Open support
              </Link>
            ) : null}
            {canReadQuestions ? (
              <Link className="admin-button" href="/admin/questions">
                Review questions
              </Link>
            ) : null}
          </>
        }
      />
      {error || !metrics ? (
        <section className="admin-panel" role="alert">
          <h2>Live metrics unavailable</h2>
          <p>
            No placeholder values are shown. Confirm the service-role
            configuration and admin metric migrations.
          </p>
        </section>
      ) : (
        <>
          <section className="admin-stat-grid" aria-label="Permitted platform metrics">
            {canReadUsers ? (
              <AdminStatCard
                label="Total users"
                value={metrics.total_users}
                detail={`${metrics.users_today} today · ${metrics.users_this_week} this week`}
                href="/admin/users"
              />
            ) : null}
            {canReadMemberships ? (
              <AdminStatCard
                label="Active memberships"
                value={metrics.active_memberships}
                detail={`${metrics.memberships_expiring_7d} expire within 7 days`}
                href="/admin/memberships"
              />
            ) : null}
            {canReadPayments ? (
              <>
                <AdminStatCard
                  label="Verified revenue"
                  value={formatAdminCurrency(metrics.verified_revenue_kobo)}
                  detail={`${metrics.successful_payments} successful payments`}
                  href="/admin/payments"
                />
                <AdminStatCard
                  label="Payments needing attention"
                  value={metrics.failed_or_pending_payments}
                  detail="Failed, abandoned, or still initialized"
                  href="/admin/payments"
                />
              </>
            ) : null}
            {canReadSupport ? (
              <AdminStatCard
                label="Open support tickets"
                value={metrics.open_support_tickets}
                detail="Open, in progress, or awaiting the student"
                href="/admin/support"
              />
            ) : null}
            {canReadQuestions ? (
              <>
                <AdminStatCard
                  label="Unresolved question reports"
                  value={metrics.unresolved_question_reports}
                  detail="Open or currently under review"
                  href="/admin/questions"
                />
                <AdminStatCard
                  label="Question banks"
                  value={metrics.total_question_banks}
                  detail={`${metrics.published_questions} published questions`}
                  href="/admin/questions"
                />
              </>
            ) : null}
            <AdminStatCard
              label="Data source"
              value="Live"
              detail="Production Supabase aggregate queries"
            />
          </section>

          {canReadUsers || canReadPayments ? (
            <section className="admin-grid-two">
              {canReadUsers ? (
                <div className="admin-panel">
                  <div className="admin-panel-heading">
                    <h2>Recent signups</h2>
                    <Link href="/admin/users">All users</Link>
                  </div>
                  {metrics.recent_signups.length ? (
                    <div className="platform-ticket-list">
                      {metrics.recent_signups.map((user) => (
                        <article key={user.id}>
                          <div>
                            <strong>{user.email}</strong>
                            <Link href={`/admin/users/${user.id}`}>Open user</Link>
                          </div>
                          <small>{formatAdminDate(user.created_at)}</small>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <AdminEmptyState
                      title="No users yet"
                      description="New authenticated accounts will appear here."
                    />
                  )}
                </div>
              ) : null}

              {canReadPayments ? (
                <div className="admin-panel">
                  <div className="admin-panel-heading">
                    <h2>Recent payments</h2>
                    <Link href="/admin/payments">Review payments</Link>
                  </div>
                  {metrics.recent_payments.length ? (
                    <div className="platform-ticket-list">
                      {metrics.recent_payments.map((payment) => (
                        <article key={payment.reference}>
                          <div>
                            <strong>{payment.email}</strong>
                            <AdminStatusBadge value={payment.status} />
                          </div>
                          <small>
                            {formatAdminCurrency(payment.amount_kobo, payment.currency)} ·{" "}
                            {formatAdminDate(payment.created_at)}
                          </small>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <AdminEmptyState
                      title="No payment attempts"
                      description="Checkout attempts will appear here without changing provider truth."
                    />
                  )}
                </div>
              ) : null}
            </section>
          ) : null}

          {canReadSupport ? (
            <section className="admin-panel">
              <div className="admin-panel-heading">
                <h2>Recent support work</h2>
                <Link href="/admin/support">Open support queue</Link>
              </div>
              {metrics.recent_support.length ? (
                <div className="platform-ticket-list">
                  {metrics.recent_support.map((ticket) => (
                    <article key={ticket.id}>
                      <div>
                        <strong>{ticket.subject}</strong>
                        <span>
                          <AdminStatusBadge value={ticket.priority} />{" "}
                          <AdminStatusBadge value={ticket.status} />
                        </span>
                      </div>
                      <small>
                        Updated {formatAdminDate(ticket.updated_at)} ·{" "}
                        <Link href={`/admin/support/${ticket.id}`}>Open ticket</Link>
                      </small>
                    </article>
                  ))}
                </div>
              ) : (
                <AdminEmptyState
                  title="No support activity"
                  description="The live support queue is currently clear."
                />
              )}
            </section>
          ) : null}
        </>
      )}
    </>
  );
}
