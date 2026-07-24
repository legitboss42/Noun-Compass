import Link from "next/link";
import { AdminMetricBars } from "@/components/admin/admin-metric-bars";
import {
  AdminPageHeader,
  AdminStatCard,
} from "@/components/admin/admin-ui";
import { requirePermission } from "@/lib/platform/admin-auth";
import { formatAdminCurrency } from "@/lib/platform/admin-format";
import { createAdminClient } from "@/lib/supabase/admin";

type MetricDatum = { label: string | number; value: number };
type AnalyticsData = {
  range: { from: string; to: string };
  users: {
    signups: number;
    active_users: number;
    premium_users: number;
    free_users: number;
    signups_by_day: MetricDatum[];
    profiles_by_level: MetricDatum[];
    profiles_by_programme: MetricDatum[];
  };
  revenue: {
    verified_revenue_kobo: number;
    successful_transactions: number;
    failed_transactions: number;
    payment_conversion_percent: number | null;
    membership_activations: number;
    memberships_expiring_7d: number;
  };
  practice: {
    sessions_started: number;
    sessions_completed: number;
    average_score: number | null;
    usage_by_mode: MetricDatum[];
    most_attempted_courses: MetricDatum[];
    most_reported_questions: MetricDatum[];
  };
  support: {
    open_tickets: number;
    average_resolution_hours: number | null;
    by_category: MetricDatum[];
    by_priority: MetricDatum[];
  };
};

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("analytics.read", "/admin/analytics");
  const params = await searchParams;
  const todayDate = new Date();
  const defaultFromDate = new Date(todayDate);
  defaultFromDate.setUTCDate(defaultFromDate.getUTCDate() - 29);
  const today = todayDate.toISOString().slice(0, 10);
  const defaultFrom = defaultFromDate.toISOString().slice(0, 10);
  const from = datePattern.test(params.from ?? "") ? params.from! : defaultFrom;
  const to = datePattern.test(params.to ?? "") ? params.to! : today;
  const admin = createAdminClient();
  const { data, error } = admin
    ? await admin.rpc("admin_analytics", { p_from: from, p_to: to })
    : { data: null, error: new Error("Database is not configured.") };
  const analytics = data as AnalyticsData | null;

  return (
    <>
      <AdminPageHeader
        eyebrow="Database-backed reporting"
        title="Analytics"
        description="Operational analytics are calculated from NounCompass accounts, verified payments, memberships, practice sessions, question reports, and support records."
      />
      <section className="admin-panel">
        <form className="admin-filters" method="get">
          <label>
            From
            <input type="date" name="from" defaultValue={from} max={to} />
          </label>
          <label>
            To
            <input type="date" name="to" defaultValue={to} min={from} max={today} />
          </label>
          <div className="admin-filter-actions">
            <button className="admin-button" type="submit">Apply range</button>
            <Link className="admin-button admin-button-secondary" href="/admin/analytics">Last 30 days</Link>
          </div>
        </form>
      </section>
      {error || !analytics ? (
        <section className="admin-panel" role="alert">
          <h2>Analytics unavailable</h2>
          <p>No placeholder figures are shown. {error?.message}</p>
        </section>
      ) : (
        <>
          <section className="admin-stat-grid" aria-label="User and revenue analytics">
            <AdminStatCard label="New users" value={analytics.users.signups} detail={`${from} to ${to}`} />
            <AdminStatCard label="Active practice users" value={analytics.users.active_users} detail="Distinct users with practice sessions in range" />
            <AdminStatCard label="Premium users" value={analytics.users.premium_users} detail={`${analytics.users.free_users} free accounts currently`} />
            <AdminStatCard label="Verified revenue" value={formatAdminCurrency(analytics.revenue.verified_revenue_kobo)} detail={`${analytics.revenue.successful_transactions} successful transactions`} />
            <AdminStatCard label="Payment conversion" value={analytics.revenue.payment_conversion_percent === null ? "Unavailable" : `${analytics.revenue.payment_conversion_percent}%`} detail="Successful attempts divided by attempts in range" unavailable={analytics.revenue.payment_conversion_percent === null} />
            <AdminStatCard label="Membership activations" value={analytics.revenue.membership_activations} detail={`${analytics.revenue.memberships_expiring_7d} expire within 7 days`} />
            <AdminStatCard label="Practice sessions" value={analytics.practice.sessions_started} detail={`${analytics.practice.sessions_completed} completed`} />
            <AdminStatCard label="Average score" value={analytics.practice.average_score === null ? "Unavailable" : `${analytics.practice.average_score}%`} detail="Completed sessions in range" unavailable={analytics.practice.average_score === null} />
            <AdminStatCard label="Open support tickets" value={analytics.support.open_tickets} detail="Current unresolved queue" />
            <AdminStatCard label="Average resolution" value={analytics.support.average_resolution_hours === null ? "Unavailable" : `${analytics.support.average_resolution_hours} hours`} detail="Resolved or closed tickets updated in range" unavailable={analytics.support.average_resolution_hours === null} />
            <AdminStatCard label="Failed payments" value={analytics.revenue.failed_transactions} detail="Failed or abandoned in range" />
            <AdminStatCard label="Data range" value={`${analytics.range.from} – ${analytics.range.to}`} detail="Inclusive Lagos reporting dates" />
          </section>
          <div className="admin-grid-two">
            <AdminMetricBars title="Signups by day" description="Daily authenticated account registrations." data={analytics.users.signups_by_day} />
            <AdminMetricBars title="Profiles by level" description="Current profile distribution, independent of the selected date range." data={analytics.users.profiles_by_level} />
            <AdminMetricBars title="Profiles by programme" description="Top programme values entered in student profiles." data={analytics.users.profiles_by_programme} />
            <AdminMetricBars title="Practice by mode" description="Diagnostic, practice, and timed-mock usage in range." data={analytics.practice.usage_by_mode} />
            <AdminMetricBars title="Most attempted courses" description="Courses with the most practice sessions in range." data={analytics.practice.most_attempted_courses} />
            <AdminMetricBars title="Most reported questions" description="Question IDs receiving the most student reports in range." data={analytics.practice.most_reported_questions} />
            <AdminMetricBars title="Tickets by category" description="Support tickets created in range." data={analytics.support.by_category} />
            <AdminMetricBars title="Tickets by priority" description="Support priority distribution for tickets created in range." data={analytics.support.by_priority} />
          </div>
        </>
      )}
    </>
  );
}
