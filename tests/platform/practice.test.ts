import assert from "node:assert/strict";
import test from "node:test";
import { scoreSession, selectQuestionSet, timedMockExpiresAt } from "../../lib/platform/practice";

test("selectQuestionSet limits and does not mutate its input", () => {
  const questions = [1, 2, 3, 4];
  const selected = selectQuestionSet(questions, 2, () => 0);
  assert.deepEqual(questions, [1, 2, 3, 4]);
  assert.equal(selected.length, 2);
});

test("timed mocks expire after forty minutes", () => {
  assert.equal(timedMockExpiresAt("2026-07-19T10:00:00.000Z").toISOString(), "2026-07-19T10:40:00.000Z");
});

test("scores unanswered questions against the full session total", () => {
  assert.equal(scoreSession(8, 10), 80);
  assert.equal(scoreSession(0, 0), 0);
});

