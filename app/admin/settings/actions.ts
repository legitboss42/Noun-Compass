"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAuditLog } from "@/lib/platform/audit";
import { requirePermission } from "@/lib/platform/admin-auth";
import { requireAdminReason } from "@/lib/platform/admin-workflows";
import {
  isPlatformSettingKey,
  parsePlatformSettingValue,
  platformSettingDefinitions,
} from "@/lib/platform/admin-settings";
import { createAdminClient } from "@/lib/supabase/admin";

const value = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim();

export async function updatePlatformSetting(formData: FormData) {
  const session = await requirePermission("settings.manage", "/admin/settings");
  const key = value(formData, "key");
  try {
    const reason = requireAdminReason(value(formData, "reason"));
    if (!isPlatformSettingKey(key)) throw new Error("That setting is not allowed.");
    const settingValue = parsePlatformSettingValue(key, value(formData, "value"));
    const admin = createAdminClient();
    if (!admin) throw new Error("Platform database is not configured.");
    const { data: before } = await admin
      .from("platform_settings")
      .select("key,value_json,updated_at")
      .eq("key", key)
      .maybeSingle();
    const { data: after, error } = await admin
      .from("platform_settings")
      .upsert(
        {
          key,
          value_json: settingValue,
          description: platformSettingDefinitions[key].label,
          updated_by: session.user.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      )
      .select("key,value_json,updated_at")
      .single();
    if (error) throw error;
    await writeAuditLog({
      actorId: session.user.id,
      action: "setting.updated",
      targetType: "platform_setting",
      targetId: key,
      reason,
      previousState: before,
      resultingState: after,
    });
  } catch (error) {
    redirect(`/admin/settings?error=${encodeURIComponent(error instanceof Error ? error.message : "Setting could not be updated.")}`);
  }
  revalidatePath("/admin/settings");
  redirect("/admin/settings?notice=Setting+updated");
}
