import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { payloadHash, verifyPaystackSignature } from "@/lib/platform/paystack";
import { revokePaymentEntitlement, verifyAndActivatePayment } from "@/lib/platform/payments";

type PaystackEvent = { event?: string; data?: { reference?: string; id?: number | string; transaction?: { reference?: string } } };

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifyPaystackSignature(rawBody, request.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ message: "Invalid signature." }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ message: "Webhook storage is unavailable." }, { status: 503 });
  const event = JSON.parse(rawBody) as PaystackEvent;
  const reference = event.data?.reference ?? event.data?.transaction?.reference ?? null;
  const eventKey = `${event.event ?? "unknown"}:${event.data?.id ?? reference ?? payloadHash(rawBody)}`;
  const hash = payloadHash(rawBody);

  const { error: insertError } = await admin.from("payment_events").insert({
    event_key: eventKey,
    reference,
    event_type: event.event ?? "unknown",
    payload_hash: hash,
  });
  if (insertError?.code === "23505") return NextResponse.json({ ok: true, duplicate: true });
  if (insertError) return NextResponse.json({ message: "Could not record webhook." }, { status: 500 });

  try {
    if (event.event === "charge.success" && reference) await verifyAndActivatePayment(reference);
    if (reference && event.event?.includes("refund") && ["refund.processed", "refund.success"].includes(event.event)) await revokePaymentEntitlement(reference, "refunded");
    if (reference && event.event?.includes("dispute")) await revokePaymentEntitlement(reference, "chargeback");
    await admin.from("payment_events").update({ processed_at: new Date().toISOString() }).eq("event_key", eventKey);
    return NextResponse.json({ ok: true });
  } catch (error) {
    await admin.from("payment_events").update({
      processed_at: new Date().toISOString(),
      processing_error: error instanceof Error ? error.message.slice(0, 500) : "Unknown webhook error",
    }).eq("event_key", eventKey);
    return NextResponse.json({ ok: true, queuedForReview: true });
  }
}
