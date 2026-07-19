import Link from "next/link";
import { requireUser } from "@/lib/platform/auth";
import { verifyAndActivatePayment } from "@/lib/platform/payments";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function PaymentCallbackPage({ searchParams }: { searchParams: Promise<{ status?: string; tx_ref?: string; transaction_id?: string }> }) {
  const user = await requireUser("/account/payment/callback");
  const params = await searchParams;
  const reference = params.tx_ref ?? "";
  const transactionId = params.transaction_id ?? "";
  let success = false;
  let message = "The payment could not be verified.";
  if (params.status === "successful" && /^nc_[a-z0-9_]+$/i.test(reference) && /^[a-z0-9_-]+$/i.test(transactionId)) {
    const admin = createAdminClient();
    const { data: attempt } = await admin?.from("payment_attempts").select("user_id").eq("reference", reference).maybeSingle() ?? { data: null };
    if (attempt?.user_id === user.id) {
      try { await verifyAndActivatePayment(reference, transactionId); success = true; message = "Your semester pass is active."; }
      catch (error) { message = error instanceof Error ? error.message : message; }
    }
  }
  return <main id="main-content" className="platform-auth"><section className="platform-auth-card"><span className="eyebrow">Payment verification</span><h1>{success ? "Payment confirmed" : "Verification needs attention"}</h1><p>{message}</p><div className="platform-auth-links"><Link className="button" href="/dashboard">Open dashboard</Link>{!success && <Link href="/dashboard/support">Create a support ticket</Link>}</div></section></main>;
}
