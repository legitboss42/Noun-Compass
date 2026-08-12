import assert from "node:assert/strict";
import test from "node:test";
import { semesterPass } from "../../lib/platform/product";

test("semester pass has one truthful, typed commercial definition", () => {
  assert.equal(semesterPass.price.ngn, 2500);
  assert.equal(semesterPass.price.kobo, 250000);
  assert.equal(semesterPass.durationDays, 180);
  assert.equal(semesterPass.billing, "one-time");
  assert.equal(semesterPass.renewsAutomatically, false);
  assert.deepEqual(semesterPass.entitlements, [
    "ai-practice-higher-limits",
    "answer-explanations",
    "material-summaries",
    "practice-history",
    "study-planner-calendar-and-reminders",
  ]);
});
