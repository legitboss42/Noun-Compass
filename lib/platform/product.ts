/**
 * Public product facts. Keep commercial copy, payment setup, and access rules
 * aligned by importing this definition instead of repeating price or duration.
 */
export const semesterPass = {
  key: "semester-pass",
  name: "NOUN Compass Semester Pass",
  price: { ngn: 2500, kobo: 250000, currency: "NGN" },
  durationDays: 180,
  billing: "one-time",
  renewsAutomatically: false,
  entitlements: [
    "ai-practice-higher-limits",
    "answer-explanations",
    "material-summaries",
    "practice-history",
    "study-planner-calendar-and-reminders",
  ],
  availability: {
    checkout: "when the secure payment service is configured and enabled",
    publicTools: "always available without a pass",
  },
} as const;

export type SemesterPassEntitlement = typeof semesterPass.entitlements[number];
