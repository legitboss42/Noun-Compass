import assert from "node:assert/strict";
import test from "node:test";
import { enforceRateLimit, rateLimitHeaders } from "../../lib/platform/rate-limit";

test("rate limiter allows requests below the configured limit", () => {
  const key = `allow-${Date.now()}`;

  assert.deepEqual(
    enforceRateLimit({ bucket: "test-allow", key, limit: 2, windowMs: 1000, now: 1000 }),
    { limited: false },
  );
  assert.deepEqual(
    enforceRateLimit({ bucket: "test-allow", key, limit: 2, windowMs: 1000, now: 1001 }),
    { limited: false },
  );
});

test("rate limiter blocks requests once the window limit is reached", () => {
  const key = `block-${Date.now()}`;

  enforceRateLimit({ bucket: "test-block", key, limit: 2, windowMs: 1000, now: 2000 });
  enforceRateLimit({ bucket: "test-block", key, limit: 2, windowMs: 1000, now: 2001 });

  const result = enforceRateLimit({ bucket: "test-block", key, limit: 2, windowMs: 1000, now: 2002 });
  assert.equal(result.limited, true);
  assert.deepEqual(rateLimitHeaders(result), { "Retry-After": "1" });
});

test("rate limiter expires old attempts outside the window", () => {
  const key = `expire-${Date.now()}`;

  enforceRateLimit({ bucket: "test-expire", key, limit: 1, windowMs: 1000, now: 3000 });

  assert.deepEqual(
    enforceRateLimit({ bucket: "test-expire", key, limit: 1, windowMs: 1000, now: 4001 }),
    { limited: false },
  );
});
