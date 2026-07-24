"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAuditLog } from "@/lib/platform/audit";
import { requirePermission } from "@/lib/platform/admin-auth";
import { canAssignRole } from "@/lib/platform/admin-permissions";
import {
  canRemoveSuperAdmin,
  requireActionConfirmation,
  requireAdminReason,
} from "@/lib/platform/admin-workflows";
import { userRoles, type UserRole } from "@/lib/platform/types";
import { createAdminClient } from "@/lib/supabase/admin";

const value = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim();

function fail(userId: string, message: string): never {
  redirect(`/admin/users/${userId}?error=${encodeURIComponent(message)}`);
}
export async function assignUserRole(formData: FormData) {
  const session = await requirePermission("roles.manage", "/admin/users");
  const userId = value(formData, "userId");
  const role = value(formData, "role") as UserRole;
  try {
    requireActionConfirmation(value(formData, "confirmation"), "ASSIGN");
    const reason = requireAdminReason(value(formData, "reason"));
    if (!userRoles.includes(role) || !canAssignRole(session.roles, role)) {
      throw new Error("You cannot assign that role.");
    }
    const admin = createAdminClient();
    if (!admin) throw new Error("Platform database is not configured.");
    const { data: existing } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const { error } = await admin
      .from("user_roles")
      .upsert({ user_id: userId, role }, { onConflict: "user_id,role" });
    if (error) throw error;
    await writeAuditLog({
      actorId: session.user.id,
      action: "role.assigned",
      targetType: "user",
      targetId: userId,
      reason,
      previousState: { roles: existing?.map((row) => row.role) ?? [] },
      resultingState: {
        roles: [...new Set([...(existing?.map((row) => row.role) ?? []), role])],
      },
      metadata: { assigned_role: role },
    });
  } catch (error) {
    fail(userId, error instanceof Error ? error.message : "Role could not be assigned.");
  }
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  redirect(`/admin/users/${userId}?notice=Role+assigned`);
}

export async function removeUserRole(formData: FormData) {
  const session = await requirePermission("roles.manage", "/admin/users");
  const userId = value(formData, "userId");
  const role = value(formData, "role") as UserRole;
  try {
    requireActionConfirmation(value(formData, "confirmation"), "REMOVE");
    const reason = requireAdminReason(value(formData, "reason"));
    if (!userRoles.includes(role) || role === "student") {
      throw new Error("The baseline student role cannot be removed.");
    }
    const admin = createAdminClient();
    if (!admin) throw new Error("Platform database is not configured.");
    const { data: existing } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (role === "super_admin") {
      const { count } = await admin
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "super_admin");
      if (
        !canRemoveSuperAdmin({
          actorId: session.user.id,
          targetId: userId,
          superAdminCount: count ?? 0,
        })
      ) {
        throw new Error(
          "You cannot remove your own super-admin role or the final super-admin.",
        );
      }
    }
    const { error } = await admin
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", role);
    if (error) throw error;
    await writeAuditLog({
      actorId: session.user.id,
      action: "role.removed",
      targetType: "user",
      targetId: userId,
      reason,
      previousState: { roles: existing?.map((row) => row.role) ?? [] },
      resultingState: {
        roles: (existing ?? [])
          .map((row) => row.role)
          .filter((currentRole) => currentRole !== role),
      },
      metadata: { removed_role: role },
    });
  } catch (error) {
    fail(userId, error instanceof Error ? error.message : "Role could not be removed.");
  }
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  redirect(`/admin/users/${userId}?notice=Role+removed`);
}

export async function setUserSuspension(formData: FormData) {
  const session = await requirePermission("users.manage", "/admin/users");
  const userId = value(formData, "userId");
  const suspend = value(formData, "mode") === "suspend";
  try {
    requireActionConfirmation(
      value(formData, "confirmation"),
      suspend ? "SUSPEND" : "RESTORE",
    );
    const reason = requireAdminReason(value(formData, "reason"));
    if (userId === session.user.id && suspend) {
      throw new Error("You cannot suspend your own administrator account.");
    }
    const admin = createAdminClient();
    if (!admin) throw new Error("Platform database is not configured.");
    const { data: before } = await admin.auth.admin.getUserById(userId);
    const { data, error } = await admin.auth.admin.updateUserById(userId, {
      ban_duration: suspend ? "876000h" : "none",
    });
    if (error) throw error;
    await writeAuditLog({
      actorId: session.user.id,
      action: suspend ? "user.suspended" : "user.restored",
      targetType: "user",
      targetId: userId,
      reason,
      previousState: { banned_until: before.user?.banned_until ?? null },
      resultingState: { banned_until: data.user?.banned_until ?? null },
    });
  } catch (error) {
    fail(userId, error instanceof Error ? error.message : "Account state could not be changed.");
  }
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  redirect(`/admin/users/${userId}?notice=${suspend ? "Account+suspended" : "Account+restored"}`);
}

export async function sendRecoveryEmail(formData: FormData) {
  const session = await requirePermission("users.manage", "/admin/users");
  const userId = value(formData, "userId");
  try {
    const reason = requireAdminReason(value(formData, "reason"));
    const admin = createAdminClient();
    if (!admin) throw new Error("Platform database is not configured.");
    const { data } = await admin.auth.admin.getUserById(userId);
    const email = data.user?.email;
    if (!email) throw new Error("The account has no recovery email.");
    const { error } = await admin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://nouncompass.me"}/account/reset-password/update`,
    });
    if (error) throw error;
    await writeAuditLog({
      actorId: session.user.id,
      action: "user.recovery_requested",
      targetType: "user",
      targetId: userId,
      reason,
      metadata: { email_domain: email.split("@")[1] ?? null },
    });
  } catch (error) {
    fail(userId, error instanceof Error ? error.message : "Recovery email could not be sent.");
  }
  redirect(`/admin/users/${userId}?notice=Recovery+email+requested`);
}
