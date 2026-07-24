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
import { markPaymentForReview, reverifyPayment } from "./actions";
import { requirePermission } from "@/lib/platform/admin-auth";
import {
  formatAdminCurrency,
  formatAdminDate,
  safePage,
} from "@/lib/platform/admin-format";
import { createAdminClient } from "@/lib/supabase/admin";

type PaymentRow = {
  id: string;
  reference: string;
  provider_transaction_id: string | null;
  user_id: string;
  email: string;
  display_name: string | null;
  amount_kobo: number;
  currency: string;
  status: string;
  review_status: string;
  review_note: string | null;
  paid_at: string | null;
  membership_id: string | null;
  membership_status: string | null;
  latest_processing_error: string | null;
  created_at: string;
  total_count: number;
};

const PAGE_SIZE = 25;

export const dynamic = "force-dynamic";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("payments.read", "/admin/payments");
  const params = await searchParams;
  const page = safePage(params.page);
  const admin = createAdminClient();
  const { data, error } = admin
    ? await admin.rpc("admin_list_payments", {
        p_query: params.q?.trim() || null,
        p_status: [
          "initialized",
          "success",
          "failed",
          "abandoned",
          "refunded",
          "chargeback",
        ].includes(params.status ?? "")
          ? params.status
          : null,
        p_review_status: [
          "unreviewed",
          "manual-review",
          "reviewed",
        ].includes(params.review ?? "")
          ? params.review
          : null,
        p_from: params.from || null,
        p_to: params.to || null,
        p_activation_issue: params.activation === "missing",
        p_offset: (page - 1) * PAGE_SIZE,
        p_limit: PAGE_SIZE,
      })
    : { data: [], error: new Error("Database is not configured.") };
  const payments = (data ?? []) as PaymentRow[];
  const total = payments[0]?.total_count ?? 0;
  const buildHref = (targetPage: number) => {
    const next = new URLSearchParams();
    Object.entries(params).forEach(([key, currentValue]) => {
      if (currentValue && !["page", "error", "notice"].includes(key)) {
        next.set(key, currentValue);
      }
    });
    next.set("page", String(targetPage));
    return `/admin/payments?${next.toString()}`;
  };

  const columns: AdminColumn<PaymentRow>[] = [
    {
      key: "reference",
      header: "Transaction",
      render: (payment) => (
        <>
          <strong><Link href={`/admin/payments/${encodeURIComponent(payment.reference)}`}>{payment.reference}</Link></strong>
          <small>
            Flutterwave ID: {payment.provider_transaction_id || "Not recorded"}
          </small>
          <small>{formatAdminDate(payment.created_at)}</small>
        </>
      ),
    },
    {
      key: "user",
      header: "User",
      render: (payment) => (
        <>
          <strong>{payment.display_name || payment.email}</strong>
          <small>{payment.email}</small>
          <Link href={`/admin/users/${payment.user_id}`}>Open user</Link>
        </>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (payment) => (
        <>
          <strong>{formatAdminCurrency(payment.amount_kobo, payment.currency)}</strong>
          <small>{payment.currency}</small>
        </>
      ),
    },
    {
      key: "status",
      header: "Payment / review",
      render: (payment) => (
        <>
          <AdminStatusBadge value={payment.status} />{" "}
          <AdminStatusBadge value={payment.review_status} />
          <small>Paid: {formatAdminDate(payment.paid_at)}</small>
        </>
      ),
    },
    {
      key: "activation",
      header: "Membership activation",
      render: (payment) =>
        payment.membership_id ? (
          <>
            <AdminStatusBadge value={payment.membership_status} />
            <small>{payment.membership_id}</small>
          </>
        ) : (
          <AdminStatusBadge
            value={payment.status === "success" ? "missing" : "not applicable"}
          />
        ),
    },
    {
      key: "failure",
      header: "Recorded issue",
      render: (payment) =>
        payment.latest_processing_error ||
        payment.review_note ||
        "No issue recorded",
    },
    {
      key: "actions",
      header: "Safe actions",
      render: (payment) => (
        <details>
          <summary>Review</summary>
          <div className="admin-form">
            <Link href={`/admin/payments/${encodeURIComponent(payment.reference)}`}>
              Open payment detail
            </Link>
            <form className="admin-form" action={markPaymentForReview}>
              <input type="hidden" name="reference" value={payment.reference} />
              <AdminConfirmationFields phrase="REVIEW" />
              <button className="admin-button admin-button-secondary admin-button-small" type="submit">
                Mark for review
              </button>
            </form>
            <form className="admin-form" action={reverifyPayment}>
              <input type="hidden" name="reference" value={payment.reference} />
              <label>
                Flutterwave transaction ID
                <input name="transactionId" required />
              </label>
              <AdminConfirmationFields phrase="VERIFY" />
              <button className="admin-button admin-button-small" type="submit">
                Verify with Flutterwave
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
        eyebrow="Financial operations"
        title="Payments"
        description="Review local attempts, provider verification state, events, and membership outcomes without any control that blindly marks a payment successful."
      />
      <AdminFeedback error={params.error || (error ? error.message : undefined)} notice={params.notice} />
      <section className="admin-panel">
        <p className="admin-warning">
          Flutterwave remains the payment source of truth. Access problems are
          resolved through safe verification or a separately audited manual
          membership grant.
        </p>
        <form className="admin-filters" method="get">
          <label>
            Reference, email, user, or provider ID
            <input name="q" defaultValue={params.q ?? ""} />
          </label>
          <label>
            Status
            <select name="status" defaultValue={params.status ?? ""}>
              <option value="">All statuses</option>
              <option value="success">Successful</option>
              <option value="initialized">Pending / initialized</option>
              <option value="failed">Failed</option>
              <option value="abandoned">Cancelled / abandoned</option>
              <option value="refunded">Refunded</option>
              <option value="chargeback">Chargeback</option>
            </select>
          </label>
          <label>
            Review state
            <select name="review" defaultValue={params.review ?? ""}>
              <option value="">Any review state</option>
              <option value="unreviewed">Unreviewed</option>
              <option value="manual-review">Manual review</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </label>
          <label>
            Activation
            <select name="activation" defaultValue={params.activation ?? ""}>
              <option value="">Any outcome</option>
              <option value="missing">Successful without membership</option>
            </select>
          </label>
          <label>From<input type="date" name="from" defaultValue={params.from ?? ""} /></label>
          <label>To<input type="date" name="to" defaultValue={params.to ?? ""} /></label>
          <div className="admin-filter-actions">
            <button className="admin-button" type="submit">Apply</button>
            <Link className="admin-button admin-button-secondary" href="/admin/payments">Reset</Link>
          </div>
        </form>
      </section>
      <section className="admin-panel">
        <div className="admin-panel-heading"><h2>{total.toLocaleString("en-NG")} payment attempts</h2></div>
        <AdminDataTable
          caption="NounCompass payment attempts"
          columns={columns}
          rows={payments}
          rowKey={(payment) => payment.id}
        />
        <AdminPagination page={page} pageSize={PAGE_SIZE} total={total} buildHref={buildHref} />
      </section>
    </>
  );
}
