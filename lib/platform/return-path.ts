const UNSAFE_ESCAPE = /(?:\\|%5c|%2f)/i;

/** Returns a local app path only; untrusted auth redirects must never leave it. */
export function safeInternalReturnPath(value: unknown, fallback = "/dashboard") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  let decoded = value;
  for (let count = 0; count < 3; count += 1) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch {
      return fallback;
    }
  }
  if (!decoded.startsWith("/") || decoded.startsWith("//") || UNSAFE_ESCAPE.test(value) || decoded.includes("\\") || /^[a-z][a-z0-9+.-]*:/i.test(decoded)) return fallback;
  return value;
}
