import assert from "node:assert/strict";
import test from "node:test";
import { isReengagementCronEnabled, requireDedicatedReengagementUnsubscribeSecret } from "../../lib/platform/reengagement-safety";

test("re-engagement cron remains off unless the flag is exactly lowercase true", () => {
  for (const value of [undefined, "", "false", "TRUE", " true", "true "]) {
    assert.equal(isReengagementCronEnabled(value), false, String(value));
  }
  assert.equal(isReengagementCronEnabled("true"), true);
});

test("direct lifecycle sends reject a service-role fallback", () => {
  assert.throws(
    () => requireDedicatedReengagementUnsubscribeSecret({ SUPABASE_SERVICE_ROLE_KEY: "service-role-only" }),
    /UNSUBSCRIBE_SECRET/,
  );
  assert.equal(requireDedicatedReengagementUnsubscribeSecret({ UNSUBSCRIBE_SECRET: "dedicated-secret" }), "dedicated-secret");
});
