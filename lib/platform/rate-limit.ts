type RateLimitBucket = {
  attempts: Map<string, number[]>;
};

declare global {
  var __nounCompassRateLimits: Record<string, RateLimitBucket> | undefined;
}

function getBucket(name: string) {
  globalThis.__nounCompassRateLimits ??= {};
  globalThis.__nounCompassRateLimits[name] ??= { attempts: new Map() };
  return globalThis.__nounCompassRateLimits[name];
}

export type RateLimitResult =
  | { limited: false }
  | { limited: true; retryAfterSeconds: number };

export function enforceRateLimit({
  key,
  limit,
  now = Date.now(),
  windowMs,
  bucket = "default",
}: {
  key: string;
  limit: number;
  now?: number;
  windowMs: number;
  bucket?: string;
}): RateLimitResult {
  const store = getBucket(bucket);
  const attempts = (store.attempts.get(key) ?? []).filter((timestamp) => now - timestamp < windowMs);

  if (attempts.length >= limit) {
    const oldest = Math.min(...attempts);
    return {
      limited: true,
      retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
    };
  }

  attempts.push(now);
  store.attempts.set(key, attempts);
  return { limited: false };
}

export function rateLimitHeaders(result: RateLimitResult) {
  const headers: Record<string, string> = {};
  if (result.limited) headers["Retry-After"] = String(result.retryAfterSeconds);
  return headers;
}
