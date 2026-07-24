import {
  AdminFeedback,
  AdminPageHeader,
} from "@/components/admin/admin-ui";
import { requirePermission } from "@/lib/platform/admin-auth";
import {
  platformSettingDefinitions,
  type PlatformSettingKey,
} from "@/lib/platform/admin-settings";
import { createAdminClient } from "@/lib/supabase/admin";
import { updatePlatformSetting } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  await requirePermission("settings.read", "/admin/settings");
  const feedback = await searchParams;
  const admin = createAdminClient();
  const { data, error } = admin
    ? await admin
        .from("platform_settings")
        .select("key,value_json,description,updated_by,updated_at")
        .order("key")
    : { data: [], error: new Error("Database is not configured.") };
  const stored = new Map(
    (data ?? []).map((setting) => [setting.key, setting.value_json]),
  );

  return (
    <>
      <AdminPageHeader
        eyebrow="Super administrator controls"
        title="Platform settings"
        description="Only explicitly whitelisted public settings can be changed here. Environment secrets, database credentials, payment keys, and SMTP passwords are never exposed."
      />
      <AdminFeedback
        error={feedback.error || (error ? error.message : undefined)}
        notice={feedback.notice}
      />
      <p className="admin-warning">
        Saving a setting records the previous value, new value, administrator,
        reason, and timestamp in the audit log.
      </p>
      <div className="admin-grid-two">
        {(Object.entries(platformSettingDefinitions) as Array<
          [
            PlatformSettingKey,
            (typeof platformSettingDefinitions)[PlatformSettingKey],
          ]
        >).map(([key, definition]) => {
          const current = stored.get(key);
          const value =
            definition.type === "boolean"
              ? String(current === true)
              : typeof current === "string"
                ? current
                : "";
          return (
            <section className="admin-panel" key={key}>
              <h2>{definition.label}</h2>
              <form className="admin-form" action={updatePlatformSetting}>
                <input type="hidden" name="key" value={key} />
                {definition.type === "textarea" ? (
                  <label>
                    Value
                    <textarea name="value" defaultValue={value} rows={5} maxLength={1000} />
                  </label>
                ) : definition.type === "boolean" ? (
                  <label>
                    Value
                    <select name="value" defaultValue={value}>
                      <option value="false">Disabled</option>
                      <option value="true">Enabled</option>
                    </select>
                  </label>
                ) : (
                  <label>
                    Value
                    <input
                      name="value"
                      type={definition.type}
                      defaultValue={value}
                      maxLength={1000}
                    />
                  </label>
                )}
                <label>
                  Reason for change
                  <textarea name="reason" minLength={5} maxLength={1000} rows={3} required />
                </label>
                <button className="admin-button" type="submit">Save setting</button>
              </form>
            </section>
          );
        })}
      </div>
    </>
  );
}
