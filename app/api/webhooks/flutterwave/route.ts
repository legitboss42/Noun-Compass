import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { payloadHash, verifyFlutterwaveSignature } from "@/lib/platform/flutterwave";
import { revokePaymentEntitlement, verifyAndActivatePayment } from "@/lib/platform/payments";

type FlutterwaveEvent = {
  id?: string;
  type?: string;
  event?: string;
  data?: { id?: number | string; tx_ref?: string; reference?: string; status?: string };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifyFlutterwaveSignature(rawBody, request.headers.get("flutterwave-signature"), request.headers.get("verif-hash"))) {
    return NextResponse.json({ message: "Invalid signature." }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ message: "Webhook storage is unavailable." }, { status: 503 });

  let event: FlutterwaveEvent;
  try { event = JSON.parse(rawBody) as FlutterwaveEvent; }
  catch { return NextResponse.json({ message: "Invalid webhook payload." }, { status: 400 }); }

  const eventType = event.type ?? event.event ?? "unknown";
  const reference = event.data?.tx_ref ?? event.data?.reference ?? null;
  const transactionId = event.data?.id == null ? null : String(event.data.id);
  const eventKey = `flutterwave:${event.id ?? `${eventType}:${transactionId ?? reference ?? payloadHash(rawBody)}`}`;
  const hash = payloadHash(rawBody);

  const { error: insertError } = await admin.from("payment_events").insert({ event_key: eventKey, reference, event_type: eventType, payload_hash: hash });
  if (insertError?.code === "23505") return NextResponse.json({ ok: true, duplicate: true });
  if (insertError) return NextResponse.json({ message: "Could not record webhook." }, { status: 500 });

  try {
    if (eventType === "charge.completed" && event.data?.status === "successful" && reference && transactionId) await verifyAndActivatePayment(reference, transactionId);
    if (reference && eventType.includes("refund") && eventType.includes("completed")) await revokePaymentEntitlement(reference, "refunded");
    if (reference && (eventType.includes("chargeback") || eventType.includes("dispute"))) await revokePaymentEntitlement(reference, "chargeback");
    await admin.from("payment_events").update({ processed_at: new Date().toISOString() }).eq("event_key", eventKey);
    return NextResponse.json({ ok: true });
  } catch (error) {
    await admin.from("payment_events").update({ processed_at: new Date().toISOString(), processing_error: error instanceof Error ? error.message.slice(0, 500) : "Unknown webhook error" }).eq("event_key", eventKey);
    return NextResponse.json({ ok: true, queuedForReview: true });
  }
}
