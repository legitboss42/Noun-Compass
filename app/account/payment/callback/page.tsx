import Link from "next/link";
import { requireUser } from "@/lib/platform/auth";
import { verifyAndActivatePayment } from "@/lib/platform/payments";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function PaymentCallbackPage({ searchParams }: { searchParams: Promise<{ status?: string; tx_ref?: string; transaction_id?: string }> }) {
  const params = await searchParams;
  const reference = params.tx_ref ?? "";
  const transactionId = params.transaction_id ?? "";
  const returnPath = `/account/payment/callback?status=${encodeURIComponent(params.status ?? "")}&tx_ref=${encodeURIComponent(reference)}&transaction_id=${encodeURIComponent(transactionId)}`;
  const user = await requireUser(returnPath);
  let success = false;
  let message = "The payment could not be verified.";
  if (params.status === "successful" && /^nc_[a-z0-9_]+$/i.test(reference) && /^[a-z0-9_-]+$/i.test(transactionId)) {
    const admin = createAdminClient();
    const { data: attempt } = await admin?.from("payment_attempts").select("user_id").eq("reference", reference).maybeSingle() ?? { data: null };
    if (attempt?.user_id === user.id) {
      try { await verifyAndActivatePayment(reference, transactionId); success = true; message = "Your payment has been confirmed and your 180-day Semester Pass is active."; }
      catch (error) { message = error instanceof Error ? error.message : message; }
    }
  }
  return <main id="main-content" className="platform-auth"><section className="platform-auth-card payment-success-card"><span className="eyebrow">Payment verification</span><h1>{success ? "Your Semester Pass is ready" : "Verification needs attention"}</h1><p>{message}</p>{success ? <><div className="payment-success-summary"><strong>Next steps</strong><p>Your receipt is ready, your access is attached to this account, and you can continue to the student dashboard or exam preparation.</p></div><div className="platform-auth-links"><Link className="button" href={`/account/payment/receipt/${reference}`}>View receipt</Link><Link href="/dashboard">Continue to dashboard</Link><Link href="/dashboard/practice">Open exam preparation</Link><Link href="/account/sign-in">Account sign-in</Link></div></> : <div className="platform-auth-links"><Link className="button" href="/dashboard">Return to dashboard</Link><Link href="/dashboard/support">Create a support ticket</Link></div>}</section></main>;
}
