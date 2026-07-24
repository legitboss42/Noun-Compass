import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AdminConfirmationFields,
  AdminFeedback,
  AdminPageHeader,
  AdminStatusBadge,
} from "@/components/admin/admin-ui";
import { requirePermission } from "@/lib/platform/admin-auth";
import {
  formatAdminCurrency,
  formatAdminDate,
} from "@/lib/platform/admin-format";
import { createAdminClient } from "@/lib/supabase/admin";
import { markPaymentForReview, reverifyPayment } from "../actions";

export const dynamic = "force-dynamic";

export default async function PaymentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  await requirePermission("payments.read", "/admin/payments");
  const reference = decodeURIComponent((await params).reference);
  const feedback = await searchParams;
  const admin = createAdminClient();
  if (!admin) throw new Error("Platform database is not configured.");
  const { data: payment } = await admin
    .from("payment_attempts")
    .select(
      "id,reference,user_id,plan_key,email,amount_kobo,currency,status,provider_response,paid_at,created_at,updated_at,review_status,review_note,reviewed_by,reviewed_at",
    )
    .eq("reference", reference)
    .maybeSingle();
  if (!payment) notFound();
  const [{ data: events }, { data: memberships }, { data: audit }] =
    await Promise.all([
      admin
        .from("payment_events")
        .select("id,event_key,event_type,payload_hash,received_at,processed_at,processing_error")
        .eq("reference", reference)
        .order("received_at", { ascending: false }),
      admin
        .from("memberships")
        .select("id,status,source,starts_at,ends_at,created_at")
        .eq("payment_reference", reference),
      admin
        .from("audit_logs")
        .select("id,action,reason,created_at")
        .eq("entity_type", "payment")
        .eq("entity_id", reference)
        .order("created_at", { ascending: false }),
    ]);
  const provider =
    payment.provider_response &&
    typeof payment.provider_response === "object" &&
    !Array.isArray(payment.provider_response)
      ? (payment.provider_response as Record<string, unknown>)
      : {};

  return (
    <>
      <AdminPageHeader
        eyebrow="Payment review"
        title={reference}
        description="Local attempt, safe provider-verification summary, webhook events, membership outcome, and audit history."
        actions={
          <Link className="admin-button admin-button-secondary" href="/admin/payments">
            Back to payments
          </Link>
        }
      />
      <AdminFeedback error={feedback.error} notice={feedback.notice} />
      <p className="admin-warning">
        This screen cannot mark a payment successful. Flutterwave verification
        remains the source of truth, and manual access uses the separate
        membership-adjustment workflow.
      </p>
      <div className="admin-grid-two">
        <section className="admin-panel">
          <h2>Local payment attempt</h2>
          <dl className="admin-detail-list">
            <div><dt>Status</dt><dd><AdminStatusBadge value={payment.status} /></dd></div>
            <div><dt>Review</dt><dd><AdminStatusBadge value={payment.review_status} /></dd></div>
            <div><dt>User</dt><dd><Link href={`/admin/users/${payment.user_id}`}>{payment.email}</Link></dd></div>
            <div><dt>Plan</dt><dd>{payment.plan_key}</dd></div>
            <div><dt>Amount</dt><dd>{formatAdminCurrency(payment.amount_kobo, payment.currency)}</dd></div>
            <div><dt>Paid at</dt><dd>{formatAdminDate(payment.paid_at)}</dd></div>
            <div><dt>Created</dt><dd>{formatAdminDate(payment.created_at)}</dd></div>
            <div><dt>Review note</dt><dd>{payment.review_note || "No review note"}</dd></div>
          </dl>
        </section>
        <section className="admin-panel">
          <h2>Provider verification summary</h2>
          <dl className="admin-detail-list">
            <div><dt>Provider</dt><dd>{String(provider.provider ?? "Not verified")}</dd></div>
            <div><dt>Transaction ID</dt><dd>{String(provider.transaction_id ?? "Not recorded")}</dd></div>
            <div><dt>Provider status</dt><dd>{String(provider.status ?? "Not recorded")}</dd></div>
            <div><dt>Provider amount</dt><dd>{String(provider.amount ?? "Not recorded")}</dd></div>
            <div><dt>Provider currency</dt><dd>{String(provider.currency ?? "Not recorded")}</dd></div>
            <div><dt>Verified</dt><dd>{formatAdminDate(typeof provider.verified_at === "string" ? provider.verified_at : null)}</dd></div>
          </dl>
          <p>Customer identity values and complete provider payloads are deliberately not rendered.</p>
        </section>
      </div>

      <div className="admin-grid-two">
        <section className="admin-panel">
          <h2>Safe verification action</h2>
          <form className="admin-form" action={reverifyPayment}>
            <input type="hidden" name="reference" value={reference} />
            <label>
              Flutterwave transaction ID
              <input name="transactionId" required />
            </label>
            <AdminConfirmationFields phrase="VERIFY" />
            <button className="admin-button" type="submit">Verify with Flutterwave</button>
          </form>
        </section>
        <section className="admin-panel">
          <h2>Manual review</h2>
          <form className="admin-form" action={markPaymentForReview}>
            <input type="hidden" name="reference" value={reference} />
            <AdminConfirmationFields phrase="REVIEW" />
            <button className="admin-button admin-button-secondary" type="submit">Mark for review</button>
          </form>
        </section>
      </div>

      <section className="admin-panel">
        <h2>Webhook and payment events</h2>
        <div className="admin-timeline">
          {(events ?? []).map((event) => (
            <article key={event.id}>
              <strong>{event.event_type}</strong>
              <span>{event.processing_error || "Processed without a recorded error"}</span>
              <small>
                Received {formatAdminDate(event.received_at)} · processed{" "}
                {formatAdminDate(event.processed_at)} · payload hash{" "}
                {event.payload_hash.slice(0, 12)}…
              </small>
            </article>
          ))}
          {!events?.length ? <p>No webhook events are linked to this reference.</p> : null}
        </div>
      </section>

      <div className="admin-grid-two">
        <section className="admin-panel">
          <h2>Membership activation result</h2>
          {(memberships ?? []).map((membership) => (
            <p key={membership.id}>
              <strong>{membership.id}</strong>{" "}
              <AdminStatusBadge value={membership.status} />
              <small>
                {membership.source} · {formatAdminDate(membership.starts_at)} to{" "}
                {formatAdminDate(membership.ends_at)}
              </small>
            </p>
          ))}
          {!memberships?.length ? <p>No membership was activated from this payment.</p> : null}
        </section>
        <section className="admin-panel">
          <h2>Audit history</h2>
          <div className="admin-timeline">
            {(audit ?? []).map((entry) => (
              <article key={entry.id}>
                <strong>{entry.action}</strong>
                <span>{entry.reason || "No reason recorded"}</span>
                <small>{formatAdminDate(entry.created_at)}</small>
              </article>
            ))}
            {!audit?.length ? <p>No administrator actions are linked to this payment.</p> : null}
          </div>
        </section>
      </div>
    </>
  );
}
