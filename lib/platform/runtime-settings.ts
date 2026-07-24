import "server-only";

import type { PlatformSettingKey } from "./admin-settings";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getBooleanPlatformSetting(
  key: PlatformSettingKey,
  fallback: boolean,
) {
  const admin = createAdminClient();
  if (!admin) return fallback;
  const { data, error } = await admin
    .from("platform_settings")
    .select("value_json")
    .eq("key", key)
    .maybeSingle();
  if (error || typeof data?.value_json !== "boolean") return fallback;
  return data.value_json;
}
