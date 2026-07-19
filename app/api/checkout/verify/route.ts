import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/platform/auth";
import { verifyAndActivatePayment } from "@/lib/platform/payments";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Sign in to verify payment." }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const reference = params.get("reference")?.trim();
  const transactionId = params.get("transactionId")?.trim();
  if (!reference || !/^nc_[a-z0-9_]+$/i.test(reference)) return NextResponse.json({ message: "Invalid payment reference." }, { status: 400 });
  if (!transactionId || !/^[a-z0-9_-]+$/i.test(transactionId)) return NextResponse.json({ message: "Invalid transaction identifier." }, { status: 400 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ message: "Payment verification is not configured." }, { status: 503 });
  const { data: attempt } = await admin.from("payment_attempts").select("user_id").eq("reference", reference).maybeSingle();
  if (!attempt || attempt.user_id !== user.id) return NextResponse.json({ message: "Payment reference does not belong to this account." }, { status: 403 });

  try {
    const membership = await verifyAndActivatePayment(reference, transactionId);
    return NextResponse.json({ ok: true, membership });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Payment verification failed." }, { status: 400 });
  }
}
