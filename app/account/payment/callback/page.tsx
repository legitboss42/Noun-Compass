import Link from "next/link";
import { requireUser } from "@/lib/platform/auth";
import { isPaymentReference, shouldVerifyPaymentCallback } from "@/lib/platform/payment-callback";
import { verifyAndActivatePayment } from "@/lib/platform/payments";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function PaymentCallbackPage({ searchParams }: { searchParams: Promise<{ status?: string; tx_ref?: string; transaction_id?: string }> }) {
  const params = await searchParams;
  const reference = params.tx_ref ?? "";
  const transactionId = params.transaction_id ?? "";
  const returnPath = `/account/payment/callback?status=${encodeURIComponent(params.status ?? "")}&tx_ref=${encodeURIComponent(reference)}&transaction_id=${encodeURIComponent(transactionId)}`;
  const user = await requireUser(returnPath);
  let success = false;
  let accessReady = false;
  let message = "The payment could not be verified.";
  if (isPaymentReference(reference)) {
    const admin = createAdminClient();
    const { data: attempt } = await admin?.from("payment_attempts").select("user_id,status").eq("reference", reference).maybeSingle() ?? { data: null };
    if (attempt?.user_id === user.id) {
      const readMembership = async () => {
        const { data } = await admin?.from("memberships")
          .select("status")
          .eq("payment_reference", reference)
          .maybeSingle() ?? { data: null };
        return data;
      };

      let membership = await readMembership();
      success = attempt.status === "success" || membership?.status === "active";
      accessReady = membership?.status === "active";

      if (!accessReady && shouldVerifyPaymentCallback(params.status, transactionId)) {
        try {
          await verifyAndActivatePayment(reference, transactionId);
          membership = await readMembership();
          success = true;
          accessReady = membership?.status === "active";
        } catch (error) {
          const { data: refreshedAttempt } = await admin?.from("payment_attempts")
            .select("status")
            .eq("reference", reference)
            .maybeSingle() ?? { data: null };
          membership = await readMembership();
          success = refreshedAttempt?.status === "success" || membership?.status === "active";
          accessReady = membership?.status === "active";
          if (!success) message = error instanceof Error ? error.message : message;
        }
      }

      if (success) {
        message = accessReady
          ? "Your payment is confirmed and your 180-day Semester Pass is active."
          : "Your payment is confirmed. Your access is being finalized and will appear on your dashboard shortly.";
      }
    }
  }
  return <main id="main-content" className="platform-auth"><section className={`platform-auth-card payment-success-card ${success ? "payment-thank-you-card" : ""}`}>
    {success && <span className="payment-success-mark" aria-hidden="true">✓</span>}
    <span className="eyebrow">{success ? "Payment successful" : "Payment verification"}</span>
    <h1>{success ? "Thank you for your payment" : "Verification needs attention"}</h1>
    <p>{message}</p>
    {success ? <>
      <div className="payment-success-summary">
        <strong>{accessReady ? "Your Semester Pass is ready" : "Payment received"}</strong>
        <p>{accessReady
          ? "Premium practice, performance history, revision planning, and the other Semester Pass features are now available in your student workspace."
          : "You can continue to your dashboard while the final access update completes."}</p>
      </div>
      <div className="platform-auth-links payment-completion-links">
        <Link className="button" href="/dashboard">Go to your dashboard</Link>
        <Link href={`/account/payment/receipt/${reference}`}>View payment receipt</Link>
        <Link href="/dashboard/practice">Start exam practice</Link>
      </div>
    </> : <div className="platform-auth-links">
      <Link className="button" href="/dashboard">Return to dashboard</Link>
      <Link href="/dashboard/support">Create a support ticket</Link>
    </div>}
  </section></main>;
}
