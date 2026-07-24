import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateExtendedMembershipEnd,
  canRemoveSuperAdmin,
  isQuestionStatusTransitionAllowed,
  isSupportStatusTransitionAllowed,
  requireActionConfirmation,
  requireAdminReason,
} from "../../lib/platform/admin-workflows";

test("membership extension starts after a future expiry", () => {
  assert.equal(
    calculateExtendedMembershipEnd(
      "2026-08-01T00:00:00.000Z",
      10,
      new Date("2026-07-24T00:00:00.000Z"),
    ),
    "2026-08-11T00:00:00.000Z",
  );
});

test("membership extension starts now after an expired end", () => {
  assert.equal(
    calculateExtendedMembershipEnd(
      "2026-07-01T00:00:00.000Z",
      1,
      new Date("2026-07-24T00:00:00.000Z"),
    ),
    "2026-07-25T00:00:00.000Z",
  );
});

test("membership extension rejects unsafe durations", () => {
  assert.throws(() => calculateExtendedMembershipEnd(null, 0), /between 1 and 730/);
  assert.throws(() => calculateExtendedMembershipEnd(null, 731), /between 1 and 730/);
});

test("confirmation and reason fields fail closed", () => {
  assert.throws(() => requireActionConfirmation("wrong", "SUSPEND"), /SUSPEND/);
  assert.throws(() => requireAdminReason("no"), /at least 5/);
  assert.equal(requireAdminReason("Verified support request"), "Verified support request");
});

test("self-lockout and last-super-admin removal are prevented", () => {
  assert.equal(
    canRemoveSuperAdmin({
      actorId: "admin-a",
      targetId: "admin-a",
      superAdminCount: 2,
    }),
    false,
  );
  assert.equal(
    canRemoveSuperAdmin({
      actorId: "admin-a",
      targetId: "admin-b",
      superAdminCount: 1,
    }),
    false,
  );
  assert.equal(
    canRemoveSuperAdmin({
      actorId: "admin-a",
      targetId: "admin-b",
      superAdminCount: 2,
    }),
    true,
  );
});

test("question workflow only permits the configured publication sequence", () => {
  assert.equal(isQuestionStatusTransitionAllowed("draft", "review"), true);
  assert.equal(isQuestionStatusTransitionAllowed("review", "published"), true);
  assert.equal(isQuestionStatusTransitionAllowed("published", "retired"), true);
  assert.equal(isQuestionStatusTransitionAllowed("draft", "published"), false);
});

test("support status transitions permit reopen but reject invalid jumps", () => {
  assert.equal(isSupportStatusTransitionAllowed("resolved", "open"), true);
  assert.equal(isSupportStatusTransitionAllowed("closed", "open"), true);
  assert.equal(isSupportStatusTransitionAllowed("closed", "resolved"), false);
});
