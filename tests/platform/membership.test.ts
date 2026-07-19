import assert from "node:assert/strict";
import test from "node:test";
import { calculateMembershipEnd, membershipIsActive } from "../../lib/platform/membership";

test("new membership starts from payment time", () => {
  const paidAt = new Date("2026-07-19T12:00:00Z");
  assert.equal(calculateMembershipEnd(paidAt, null).toISOString(), "2027-01-15T12:00:00.000Z");
});

test("active membership extends from its existing end", () => {
  const paidAt = new Date("2026-07-19T12:00:00Z");
  const currentEnd = new Date("2026-08-01T12:00:00Z");
  assert.equal(calculateMembershipEnd(paidAt, currentEnd).toISOString(), "2027-01-28T12:00:00.000Z");
});

test("active check requires both state and a future end", () => {
  const now = new Date("2026-07-19T12:00:00Z");
  assert.equal(membershipIsActive("active", "2026-07-20T12:00:00Z", now), true);
  assert.equal(membershipIsActive("active", "2026-07-18T12:00:00Z", now), false);
  assert.equal(membershipIsActive("refunded", "2026-07-20T12:00:00Z", now), false);
});
