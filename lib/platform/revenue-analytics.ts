export const revenueEvents = [
  "membership_viewed",
  "membership_cta_clicked",
  "signup_started",
  "signup_submitted",
  "email_verified",
  "checkout_started",
  "checkout_failed",
  "payment_verified",
  "membership_activated",
  "ai_practice_started",
  "ai_practice_completed",
] as const;

export type RevenueEvent = typeof revenueEvents[number];
type AuthState = "signed-in" | "signed-out";
type RevenueInput = {
  [key: string]: unknown;
  ctaSource?: string;
  authState?: AuthState;
  plan?: "semester-pass";
  failureCategory?: string;
  score?: number;
  total?: number;
  correct?: number;
};

export function buildRevenueEvent(event: RevenueEvent, input: RevenueInput = {}) {
  const payload: Record<string, string | number> = {};
  if (input.ctaSource) payload.cta_source = input.ctaSource;
  if (input.authState) payload.auth_state = input.authState;
  if (input.plan) payload.plan = input.plan;
  if (input.failureCategory) payload.failure_category = input.failureCategory;
  if (event.startsWith("ai_practice_")) {
    for (const [key, value] of Object.entries({ score: input.score, total: input.total, correct: input.correct })) {
      if (typeof value === "number" && Number.isFinite(value)) payload[key] = value;
    }
  }
  return payload;
}

const SUCCESS_EVENTS = new Set<RevenueEvent>(["email_verified", "payment_verified", "membership_activated", "ai_practice_completed"]);

export function shouldTrackRevenueEvent(event: RevenueEvent, key: string | undefined, seen: Set<string>) {
  if (!SUCCESS_EVENTS.has(event) || !key) return true;
  const storageKey = `nouncompass:revenue:${event}:${key}`;
  if (seen.has(storageKey)) return false;
  seen.add(storageKey);
  if (typeof window !== "undefined" && window.sessionStorage.getItem(storageKey)) return false;
  if (typeof window !== "undefined") window.sessionStorage.setItem(storageKey, "1");
  return true;
}

export function trackRevenueEvent(event: RevenueEvent, input: RevenueInput = {}, dedupeKey?: string) {
  const seen = new Set<string>();
  if (!shouldTrackRevenueEvent(event, dedupeKey, seen)) return false;
  const payload = buildRevenueEvent(event, input);
  if (window.gtag) window.gtag("event", event, payload);
  else {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push(["event", event, payload]);
  }
  return true;
}

declare global { interface Window { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] } }
