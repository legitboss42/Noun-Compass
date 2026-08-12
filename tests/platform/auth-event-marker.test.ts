import assert from "node:assert/strict";
import test from "node:test";
import { createEmailVerifiedMarker, verifyEmailVerifiedMarker } from "../../lib/platform/auth-event-marker";

test("email verification markers are short-lived and signed", () => {
  const marker = createEmailVerifiedMarker("marker-secret", new Date("2026-08-12T10:00:00Z"));
  assert.equal(verifyEmailVerifiedMarker(marker, "marker-secret", new Date("2026-08-12T10:04:59Z")), true);
  assert.equal(verifyEmailVerifiedMarker(marker, "marker-secret", new Date("2026-08-12T10:05:01Z")), false);
  assert.equal(verifyEmailVerifiedMarker(`${marker}tampered`, "marker-secret", new Date("2026-08-12T10:01:00Z")), false);
});
