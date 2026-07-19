import assert from "node:assert/strict";
import test from "node:test";
import { enforceNewsletterRateLimit, normalizeNewsletterEmail } from "../../lib/newsletter";

test("newsletter email is normalized", () => {
  assert.equal(normalizeNewsletterEmail("  Student@Example.COM "), "student@example.com");
});

test("newsletter rejects malformed addresses", () => {
  assert.throws(() => normalizeNewsletterEmail("not-an-email"), /valid email/i);
  assert.throws(() => normalizeNewsletterEmail("a@b"), /valid email/i);
});

test("newsletter signup is rate limited", () => {
  const key = `test-${Date.now()}`;
  for (let attempt = 0; attempt < 5; attempt += 1) enforceNewsletterRateLimit(key, 1000 + attempt);
  assert.throws(() => enforceNewsletterRateLimit(key, 1006), /too many/i);
});
