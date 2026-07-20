const enabled = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
};

export function isFlutterwaveConfigurationValid(
  environment: string | undefined,
  secretKey: string | undefined,
  webhookSecret: string | undefined,
) {
  const mode = environment?.toLowerCase() ?? "test";
  if (!secretKey || !webhookSecret || !["test", "live"].includes(mode)) return false;
  const isTestKey = secretKey.startsWith("FLWSECK_TEST-");
  return mode === "test" ? isTestKey : !isTestKey;
}

export function isCheckoutReleaseEnabled(
  environment: string | undefined,
  featureFlag: string | undefined,
  emergencyDisabled: string | undefined,
) {
  if (enabled(emergencyDisabled, false)) return false;
  return environment?.toLowerCase() === "live" || enabled(featureFlag, false);
}

const flutterwaveEnvironment = process.env.FLUTTERWAVE_ENVIRONMENT ?? "test";

export const platformConfig = {
  supabaseConfigured: Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ),
  serviceRoleConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  flutterwaveConfigured: isFlutterwaveConfigurationValid(
    flutterwaveEnvironment,
    process.env.FLUTTERWAVE_SECRET_KEY,
    process.env.FLUTTERWAVE_WEBHOOK_SECRET,
  ),
  features: {
    accounts: enabled(process.env.FEATURE_ACCOUNTS, true),
    dashboard: enabled(process.env.FEATURE_DASHBOARD, true),
    examPrep: enabled(process.env.FEATURE_EXAM_PREP, true),
    checkout: isCheckoutReleaseEnabled(
      flutterwaveEnvironment,
      process.env.FEATURE_CHECKOUT,
      process.env.CHECKOUT_EMERGENCY_DISABLED,
    ),
    admin: enabled(process.env.FEATURE_ADMIN, true),
  },
  semesterPass: {
    key: "semester-pass" as const,
    amountKobo: Number(process.env.SEMESTER_PASS_AMOUNT_KOBO ?? "250000"),
    currency: "NGN" as const,
    durationDays: Number(process.env.SEMESTER_PASS_DURATION_DAYS ?? "180"),
  },
};

export function isProtectedPlatformAvailable(feature: "accounts" | "dashboard" | "admin") {
  return platformConfig.supabaseConfigured && platformConfig.features[feature];
}

export function isCheckoutAvailable() {
  return (
    platformConfig.supabaseConfigured &&
    platformConfig.serviceRoleConfigured &&
    platformConfig.flutterwaveConfigured &&
    platformConfig.features.checkout
  );
}
