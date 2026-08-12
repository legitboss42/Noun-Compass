import { createHmac, timingSafeEqual } from "node:crypto";

export const AUTH_EVENT_COOKIE = "nc_auth_event";
const MARKER_TTL_MS = 5 * 60 * 1000;

function signature(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function equal(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createEmailVerifiedMarker(secret: string, now = new Date()) {
  if (!secret) throw new Error("Auth event signing is unavailable.");
  const payload = Buffer.from(JSON.stringify({ event: "email_verified", exp: now.getTime() + MARKER_TTL_MS })).toString("base64url");
  return `${payload}.${signature(payload, secret)}`;
}

export function verifyEmailVerifiedMarker(marker: string | undefined, secret: string, now = new Date()) {
  if (!marker || !secret) return false;
  const [payload, supplied, extra] = marker.split(".");
  if (!payload || !supplied || extra || !equal(supplied, signature(payload, secret))) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { event?: string; exp?: unknown };
    return parsed.event === "email_verified" && typeof parsed.exp === "number" && Number.isFinite(parsed.exp) && parsed.exp > now.getTime();
  } catch {
    return false;
  }
}

export function authEventSecret(environment: Record<string, string | undefined>) {
  return environment.AUTH_EVENT_SECRET?.trim() || environment.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
}
