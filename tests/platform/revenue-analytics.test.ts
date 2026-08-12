import assert from "node:assert/strict";
import test from "node:test";
import { buildRevenueEvent, shouldTrackRevenueEvent } from "../../lib/platform/revenue-analytics";

test("revenue events retain only the allowed non-PII fields", () => {
  assert.deepEqual(
    buildRevenueEvent("checkout_failed", {
      ctaSource: "membership-card",
      authState: "signed-in",
      plan: "semester-pass",
      failureCategory: "provider-unavailable",
      email: "student@example.com",
      reference: "nc_secret",
      courseCode: "GST107",
      unused: undefined,
    }),
    {
      cta_source: "membership-card",
      auth_state: "signed-in",
      plan: "semester-pass",
      failure_category: "provider-unavailable",
    },
  );
});

test("practice events retain numeric study statistics and success events dedupe on refresh", () => {
  assert.deepEqual(
    buildRevenueEvent("ai_practice_completed", { score: 85, total: 20, correct: 17, email: "student@example.com" }),
    { score: 85, total: 20, correct: 17 },
  );
  const seen = new Set<string>();
  assert.equal(shouldTrackRevenueEvent("payment_verified", "payment:complete", seen), true);
  assert.equal(shouldTrackRevenueEvent("payment_verified", "payment:complete", seen), false);
  assert.equal(shouldTrackRevenueEvent("checkout_failed", "payment:complete", seen), true);
});
