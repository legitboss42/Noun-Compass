"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAuditLog } from "@/lib/platform/audit";
import { requirePermission } from "@/lib/platform/admin-auth";
import {
  calculateExtendedMembershipEnd,
  requireActionConfirmation,
  requireAdminReason,
} from "@/lib/platform/admin-workflows";
import { platformConfig } from "@/lib/platform/config";
import { createAdminClient } from "@/lib/supabase/admin";

const value = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim();

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}
export async function grantMembership(formData: FormData) {
  const session = await requirePermission(
    "memberships.manage",
    "/admin/memberships",
  );
  const userId = value(formData, "userId");
  try {
    requireActionConfirmation(value(formData, "confirmation"), "GRANT");
    const reason = requireAdminReason(value(formData, "reason"));
    const admin = createAdminClient();
    if (!admin) throw new Error("Platform database is not configured.");
    const { data: plan } = await admin
      .from("membership_plans")
      .select("plan_key,duration_days,active")
      .eq("plan_key", platformConfig.semesterPass.key)
      .maybeSingle();
    if (!plan?.active) throw new Error("The Semester Pass plan is not active.");
    const { data: current } = await admin
      .from("memberships")
      .select("ends_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("ends_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const now = new Date();
    const endsAt = calculateExtendedMembershipEnd(
      current?.ends_at ?? null,
      plan.duration_days,
      now,
    );
    const { data: membership, error } = await admin
      .from("memberships")
      .insert({
        user_id: userId,
        plan_key: plan.plan_key,
        payment_reference: null,
        status: "active",
        starts_at: now.toISOString(),
        ends_at: endsAt,
        source: "manual",
        granted_by: session.user.id,
      })
      .select("id,status,starts_at,ends_at,source")
      .single();
    if (error || !membership) throw error ?? new Error("Membership was not created.");
    await admin.from("entitlement_adjustments").insert({
      user_id: userId,
      membership_id: membership.id,
      previous_ends_at: current?.ends_at ?? null,
      new_ends_at: endsAt,
      reason,
      created_by: session.user.id,
    });
    await writeAuditLog({
      actorId: session.user.id,
      action: "membership.granted",
      targetType: "membership",
      targetId: membership.id,
      reason,
      previousState: { active_ends_at: current?.ends_at ?? null },
      resultingState: membership,
      metadata: { user_id: userId, source: "manual" },
    });
  } catch (error) {
    fail("/admin/memberships", error instanceof Error ? error.message : "Membership could not be granted.");
  }
  revalidatePath("/admin/memberships");
  revalidatePath(`/admin/users/${userId}`);
  redirect("/admin/memberships?notice=Semester+Pass+granted");
}

export async function extendMembership(formData: FormData) {
  const session = await requirePermission(
    "memberships.manage",
    "/admin/memberships",
  );
  const membershipId = value(formData, "membershipId");
  try {
    requireActionConfirmation(value(formData, "confirmation"), "EXTEND");
    const reason = requireAdminReason(value(formData, "reason"));
    const days = Number(value(formData, "days"));
    const admin = createAdminClient();
    if (!admin) throw new Error("Platform database is not configured.");
    const { data: current } = await admin
      .from("memberships")
      .select("id,user_id,status,ends_at")
      .eq("id", membershipId)
      .maybeSingle();
    if (!current) throw new Error("Membership was not found.");
    const newEnd = calculateExtendedMembershipEnd(current.ends_at, days);
    const { data: updated, error } = await admin
      .from("memberships")
      .update({
        status: "active",
        ends_at: newEnd,
        revoked_at: null,
        revocation_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", membershipId)
      .select("id,status,ends_at")
      .single();
    if (error) throw error;
    await admin.from("entitlement_adjustments").insert({
      user_id: current.user_id,
      membership_id: membershipId,
      previous_ends_at: current.ends_at,
      new_ends_at: newEnd,
      reason,
      created_by: session.user.id,
    });
    await writeAuditLog({
      actorId: session.user.id,
      action: "membership.extended",
      targetType: "membership",
      targetId: membershipId,
      reason,
      previousState: current,
      resultingState: updated,
      metadata: { days },
    });
  } catch (error) {
    fail("/admin/memberships", error instanceof Error ? error.message : "Membership could not be extended.");
  }
  revalidatePath("/admin/memberships");
  redirect("/admin/memberships?notice=Membership+extended");
}

export async function setMembershipRevocation(formData: FormData) {
  const session = await requirePermission(
    "memberships.manage",
    "/admin/memberships",
  );
  const membershipId = value(formData, "membershipId");
  const restore = value(formData, "mode") === "restore";
  try {
    requireActionConfirmation(
      value(formData, "confirmation"),
      restore ? "RESTORE" : "REVOKE",
    );
    const reason = requireAdminReason(value(formData, "reason"));
    const admin = createAdminClient();
    if (!admin) throw new Error("Platform database is not configured.");
    const { data: current } = await admin
      .from("memberships")
      .select("id,user_id,status,ends_at,revoked_at,revocation_reason,plan_key")
      .eq("id", membershipId)
      .maybeSingle();
    if (!current) throw new Error("Membership was not found.");
    const now = new Date();
    let endsAt = now.toISOString();
    if (restore) {
      const { data: plan } = await admin
        .from("membership_plans")
        .select("duration_days")
        .eq("plan_key", current.plan_key)
        .maybeSingle();
      endsAt = calculateExtendedMembershipEnd(
        current.ends_at,
        plan?.duration_days ?? platformConfig.semesterPass.durationDays,
        now,
      );
    }
    const next = restore
      ? {
          status: "active",
          ends_at: endsAt,
          revoked_at: null,
          revocation_reason: null,
          updated_at: now.toISOString(),
        }
      : {
          status: "revoked",
          ends_at: endsAt,
          revoked_at: now.toISOString(),
          revocation_reason: reason,
          updated_at: now.toISOString(),
        };
    const { data: updated, error } = await admin
      .from("memberships")
      .update(next)
      .eq("id", membershipId)
      .select("id,status,ends_at,revoked_at,revocation_reason")
      .single();
    if (error) throw error;
    await admin.from("entitlement_adjustments").insert({
      user_id: current.user_id,
      membership_id: membershipId,
      previous_ends_at: current.ends_at,
      new_ends_at: endsAt,
      reason,
      created_by: session.user.id,
    });
    await writeAuditLog({
      actorId: session.user.id,
      action: restore ? "membership.restored" : "membership.revoked",
      targetType: "membership",
      targetId: membershipId,
      reason,
      previousState: current,
      resultingState: updated,
    });
  } catch (error) {
    fail("/admin/memberships", error instanceof Error ? error.message : "Membership state could not be changed.");
  }
  revalidatePath("/admin/memberships");
  redirect(`/admin/memberships?notice=${restore ? "Membership+restored" : "Membership+revoked"}`);
}
