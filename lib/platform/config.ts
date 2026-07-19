const enabled = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
};

export const platformConfig = {
  supabaseConfigured: Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ),
  serviceRoleConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  paystackConfigured: Boolean(process.env.PAYSTACK_SECRET_KEY),
  features: {
    accounts: enabled(process.env.FEATURE_ACCOUNTS, true),
    dashboard: enabled(process.env.FEATURE_DASHBOARD, true),
    examPrep: enabled(process.env.FEATURE_EXAM_PREP, true),
    checkout: enabled(process.env.FEATURE_CHECKOUT, false),
    admin: enabled(process.env.FEATURE_ADMIN, true),
  },
  semesterPass: {
    key: "semester-pass" as const,
    amountKobo: Number(process.env.PAYSTACK_SEMESTER_PASS_AMOUNT_KOBO ?? "250000"),
    currency: "NGN" as const,
    durationDays: Number(process.env.PAYSTACK_SEMESTER_PASS_DURATION_DAYS ?? "180"),
  },
};

export function isProtectedPlatformAvailable(feature: "accounts" | "dashboard" | "admin") {
  return platformConfig.supabaseConfigured && platformConfig.features[feature];
}

export function isCheckoutAvailable() {
  return (
    platformConfig.supabaseConfigured &&
    platformConfig.serviceRoleConfigured &&
    platformConfig.paystackConfigured &&
    platformConfig.features.checkout
  );
}
