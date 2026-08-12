import assert from "node:assert/strict";
import test from "node:test";
import { requireDedicatedReengagementUnsubscribeSecret } from "../../lib/platform/reengagement-safety";

test("direct lifecycle sends reject a service-role fallback", () => {
  assert.throws(
    () => requireDedicatedReengagementUnsubscribeSecret({ SUPABASE_SERVICE_ROLE_KEY: "service-role-only" }),
    /UNSUBSCRIBE_SECRET/,
  );
  assert.equal(requireDedicatedReengagementUnsubscribeSecret({ UNSUBSCRIBE_SECRET: "dedicated-secret" }), "dedicated-secret");
});
