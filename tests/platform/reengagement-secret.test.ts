import assert from "node:assert/strict";
import test from "node:test";
import { hasDedicatedReengagementUnsubscribeSecret } from "../../lib/platform/reengagement-safety";

test("re-engagement needs its dedicated unsubscribe secret before it can send", () => {
  assert.equal(hasDedicatedReengagementUnsubscribeSecret({}), false);
  assert.equal(hasDedicatedReengagementUnsubscribeSecret({ UNSUBSCRIBE_SECRET: "shared-secret" }), true);
});
