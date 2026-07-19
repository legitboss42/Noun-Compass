import { NextResponse } from "next/server";
import { syncSubscriberToBrevo } from "@/lib/newsletter";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected || request.headers.get("authorization") !== `Bearer ${expected}`) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  const admin = createAdminClient(); if (!admin) return NextResponse.json({ message: "Database unavailable." }, { status: 503 });
  const runDate = new Date().toISOString().slice(0, 10);
  const { data: run, error: runError } = await admin.from("cron_runs").insert({ job_key: "daily-platform-operations", run_date: runDate, status: "running" }).select("id").single();
  if (runError?.code === "23505") return NextResponse.json({ ok: true, duplicate: true });
  if (!run) return NextResponse.json({ message: "Could not start job." }, { status: 500 });
  try {
    const now = new Date();
    const { data: expiring } = await admin.from("memberships").select("id,user_id,ends_at,status").eq("status", "active").not("ends_at", "is", null).lte("ends_at", new Date(now.getTime() + 7 * 86400000).toISOString());
    let expiredCount = 0; let reminderCount = 0;
    for (const membership of expiring ?? []) {
      const end = new Date(membership.ends_at);
      if (end <= now) {
        await admin.from("memberships").update({ status: "expired", updated_at: now.toISOString() }).eq("id", membership.id).eq("status", "active");
        await admin.from("audit_logs").insert({ action: "membership.expired", entity_type: "membership", entity_id: membership.id, details: { ends_at: membership.ends_at } });
        expiredCount += 1;
      } else {
        const days = Math.ceil((end.getTime() - now.getTime()) / 86400000);
        if ([1, 3, 7].includes(days)) {
          const { error } = await admin.from("notifications").insert({ user_id: membership.user_id, kind: "membership", title: `Semester pass ends in ${days} day${days === 1 ? "" : "s"}`, body: "Renew only if you still need premium preparation. Core NounCompass tools remain free.", action_url: "/membership", dedupe_key: `membership-expiry:${membership.id}:${days}` });
          if (!error) reminderCount += 1;
        }
      }
    }
    const { data: pendingSubscribers } = await admin.from("newsletter_subscribers").select("email").eq("status", "subscribed").is("brevo_synced_at", null).limit(100);
    let subscriberSyncCount = 0;
    for (const subscriber of pendingSubscribers ?? []) {
      try {
        const result = await syncSubscriberToBrevo(subscriber.email);
        if (result.synced) {
          await admin.from("newsletter_subscribers").update({ brevo_synced_at: now.toISOString(), updated_at: now.toISOString() }).eq("email", subscriber.email);
          subscriberSyncCount += 1;
        }
      } catch {
        // Leave unsynced contacts queued for the next daily run.
      }
    }
    const details = { expiredCount, reminderCount, checkedMemberships: expiring?.length ?? 0, subscriberSyncCount, checkedSubscribers: pendingSubscribers?.length ?? 0 };
    await admin.from("cron_runs").update({ status: "success", details, completed_at: new Date().toISOString() }).eq("id", run.id);
    return NextResponse.json({ ok: true, ...details });
  } catch (error) {
    await admin.from("cron_runs").update({ status: "failed", details: { error: error instanceof Error ? error.message.slice(0, 500) : "Unknown error" }, completed_at: new Date().toISOString() }).eq("id", run.id);
    return NextResponse.json({ message: "Daily job failed." }, { status: 500 });
  }
}
