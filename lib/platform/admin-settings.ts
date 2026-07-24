export const platformSettingDefinitions = {
  platform_name: { label: "Public platform name", type: "text" },
  support_email: { label: "Support email", type: "email" },
  contact_email: { label: "Contact email", type: "email" },
  current_academic_term: { label: "Current academic term", type: "text" },
  maintenance_notice: { label: "Maintenance notice", type: "textarea" },
  membership_plan_visible: { label: "Membership plan visible", type: "boolean" },
  checkout_available: { label: "Checkout available", type: "boolean" },
  diagnostic_available: { label: "Diagnostic available", type: "boolean" },
  question_reports_available: { label: "Question reports available", type: "boolean" },
  newsletter_available: { label: "Newsletter available", type: "boolean" },
  public_announcement: { label: "Public announcement", type: "textarea" },
} as const;

export type PlatformSettingKey = keyof typeof platformSettingDefinitions;

export function isPlatformSettingKey(key: string): key is PlatformSettingKey {
  return key in platformSettingDefinitions;
}
export function parsePlatformSettingValue(
  key: PlatformSettingKey,
  rawValue: string,
) {
  const definition = platformSettingDefinitions[key];
  if (definition.type === "boolean") return rawValue === "true";
  const value = rawValue.trim().slice(0, 1000);
  if (
    definition.type === "email" &&
    value &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  ) {
    throw new Error("Enter a valid email address.");
  }
  return value;
}
