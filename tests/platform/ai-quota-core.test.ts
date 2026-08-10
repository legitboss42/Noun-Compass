import assert from "node:assert/strict";
import test from "node:test";
import {
  blockedByFailures,
  globalAttemptGrace,
  quotaRejectionMessage,
  USER_ATTEMPT_GRACE,
  withinQuota,
} from "../../lib/platform/ai-quota-core";

test("a delivered request spends allowance and a failed one does not", () => {
  // One free Practice Exam a day: the student generated one, so they are done.
  assert.equal(withinQuota({ chargeable: 1, attempts: 1 }, 1), false);
  // The same student, whose only attempt failed, still has their exam.
  assert.equal(withinQuota({ chargeable: 0, attempts: 1 }, 1), true);
});

test("refunds stop once the attempt grace is gone", () => {
  const limit = 1;
  const lastAllowed = { chargeable: 0, attempts: limit + USER_ATTEMPT_GRACE - 1 };
  assert.equal(withinQuota(lastAllowed, limit), true);

  // A provider failing after it has already generated and billed its tokens
  // must not be retriable without end.
  const exhausted = { chargeable: 0, attempts: limit + USER_ATTEMPT_GRACE };
  assert.equal(withinQuota(exhausted, limit), false);
  assert.equal(blockedByFailures(exhausted, limit), true);
});

test("running out of allowance is not reported as a failure problem", () => {
  assert.equal(blockedByFailures({ chargeable: 3, attempts: 9 }, 3), false);
});

test("the platform grace scales with the platform cap", () => {
  assert.equal(globalAttemptGrace(250), 25);
  // Small caps still get usable headroom rather than a proportional sliver.
  assert.equal(globalAttemptGrace(10), 10);
});

test("each ceiling explains itself truthfully", () => {
  const base = { userCount: 0, userLimit: 3, globalCount: 0, globalLimit: 250 };

  assert.match(
    quotaRejectionMessage({ ...base, globalCount: 250 }),
    /platform-wide/,
  );
  assert.match(
    quotaRejectionMessage({ ...base, userCount: 3 }),
    /Your AI allowance/,
  );
  // Blocked purely by failures: the allowance is intact, so it must not claim
  // the student used it up.
  const failureMessage = quotaRejectionMessage(base);
  assert.match(failureMessage, /failed/);
  assert.equal(/allowance has been reached/.test(failureMessage), false);
});
