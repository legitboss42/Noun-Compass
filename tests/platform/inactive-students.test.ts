import assert from "node:assert/strict";
import test from "node:test";
import { deliverStageNotificationBatch } from "../../lib/platform/stage-notification-delivery";
import { StageEmailConfigurationError } from "../../lib/platform/stage-email-safety";

test("stage batch preflight fails before a fake notification database can insert without a dedicated unsubscribe secret", async () => {
  let inserts = 0;
  const database = {
    async insertNotification() {
      inserts += 1;
      return { error: null };
    },
    async markEmailed() {
      return { error: null, persisted: true };
    },
  };

  await assert.rejects(
    () => deliverStageNotificationBatch({
      environment: {},
      candidates: [{ userId: "student-1", email: "student@example.com", display_name: "Student", stage: "s1", context: {} }],
      database,
      sendEmail: async () => assert.fail("missing-secret delivery must not send email"),
    }),
      (error: unknown) => error instanceof StageEmailConfigurationError && error.code === "missing_unsubscribe_secret",
  );
  assert.equal(inserts, 0);
});
