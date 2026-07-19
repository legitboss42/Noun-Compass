import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintReceiptButton } from "@/components/print-receipt-button";
import { requireUser } from "@/lib/platform/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function PaymentReceiptPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  if (!/^nc_[a-z0-9_]+$/i.test(reference)) notFound();
  const user = await requireUser(`/account/payment/receipt/${reference}`);
  const admin = createAdminClient();
  if (!admin) notFound();

  const [{ data: payment }, { data: membership }] = await Promise.all([
    admin.from("payment_attempts").select("reference,user_id,email,amount_kobo,currency,status,paid_at,created_at").eq("reference", reference).eq("user_id", user.id).eq("status", "success").maybeSingle(),
    admin.from("memberships").select("status,starts_at,ends_at,plan_key").eq("payment_reference", reference).eq("user_id", user.id).maybeSingle(),
  ]);
  if (!payment || !membership) notFound();

  const amount = new Intl.NumberFormat("en-NG", { style: "currency", currency: payment.currency, minimumFractionDigits: 0 }).format(payment.amount_kobo / 100);
  const paidAt = payment.paid_at ?? payment.created_at;
  const date = new Intl.DateTimeFormat("en-NG", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Lagos" }).format(new Date(paidAt));
  const accessEnd = membership.ends_at ? new Intl.DateTimeFormat("en-NG", { dateStyle: "long", timeZone: "Africa/Lagos" }).format(new Date(membership.ends_at)) : "Pending";

  return <main id="main-content" className="platform-auth receipt-page"><section className="platform-auth-card payment-receipt"><header><span className="eyebrow">NounCompass payment receipt</span><h1>Semester Pass receipt</h1><p>Keep this receipt with your Flutterwave confirmation.</p></header><dl><div><dt>Payment status</dt><dd>Confirmed</dd></div><div><dt>Amount</dt><dd>{amount}</dd></div><div><dt>Payment date</dt><dd>{date}</dd></div><div><dt>Reference</dt><dd>{payment.reference}</dd></div><div><dt>Account email</dt><dd>{payment.email}</dd></div><div><dt>Access plan</dt><dd>Semester Pass · 180 days</dd></div><div><dt>Access ends</dt><dd>{accessEnd}</dd></div></dl><p className="platform-privacy-note">NounCompass does not store your card number, PIN, CVV, or Flutterwave authentication details.</p><div className="platform-auth-links receipt-actions"><PrintReceiptButton /><Link href="/dashboard">Continue to dashboard</Link><Link href="/dashboard/practice">Open exam preparation</Link></div></section></main>;
}
