export type AdSenseEnvironment = {
  NEXT_PUBLIC_ADSENSE_ENABLED?: string;
  NEXT_PUBLIC_ADSENSE_PUBLISHER_ID?: string;
};

export type AdSenseConfig =
  | { enabled: false; publisherId?: never }
  | { enabled: true; publisherId: string };

const publisherIdPattern = /^ca-pub-\d+$/;

const eligibleExactPaths = new Set([
  "/",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms",
  "/disclaimer",
  "/editorial-policy",
  "/copyright-policy",
  "/corrections-policy",
  "/academic-integrity",
  "/takedown-policy",
  "/refund-policy",
  "/authors",
  "/reviewers",
  "/admission",
  "/examinations",
  "/gst",
  "/portal",
  "/results",
  "/student-guides",
  "/study-centres",
  "/articles",
]);

/**
 * Public AdSense configuration only becomes usable after an explicit enable.
 * Keep the two values unset in source control until the manual approval gates
 * recorded in docs/monetization-operations.md are complete.
 */
export function getAdSenseConfig(environment: AdSenseEnvironment): AdSenseConfig {
  const publisherId = environment.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
  const validPublisherId = publisherId && publisherIdPattern.test(publisherId) ? publisherId : null;
  if (environment.NEXT_PUBLIC_ADSENSE_ENABLED !== "true" || !validPublisherId) {
    return { enabled: false };
  }
  return { enabled: true, publisherId: validPublisherId };
}

/**
 * Auto ads are restricted to durable, public editorial and trust pages. Query
 * strings and fragments intentionally fail closed so preview/callback variants
 * never become eligible by a broad pathname match.
 */
export function isAdSenseEligiblePath(pathname: string): boolean {
  if (!pathname.startsWith("/") || pathname.includes("?") || pathname.includes("#")) return false;
  if (eligibleExactPaths.has(pathname)) return true;
  return pathname.startsWith("/articles/") && pathname.length > "/articles/".length;
}

/**
 * The loader receives pathname, query, and hash separately from browser state.
 * Any non-canonical variant fails closed, including client-only hash navigation.
 */
export function shouldLoadAdSenseForLocation(
  config: AdSenseConfig,
  pathname: string,
  search: string,
  hash: string,
) {
  return config.enabled && !search && !hash && isAdSenseEligiblePath(pathname);
}

/** Snapshot browser location in the same effect that makes the inject decision. */
export function currentAdSenseLocation(
  pathname: string,
  location: Pick<Location, "search" | "hash">,
) {
  return { pathname, search: location.search, hash: location.hash };
}
