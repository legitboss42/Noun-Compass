import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Unsubscribe links have to work for someone who is not signed in, often years
 * after the email was sent, from a client that may prefetch the URL. So the link
 * carries its own proof: the recipient plus an HMAC of it. Nothing in the token
 * is secret — it is a capability to stop email for one address, and it must not
 * become a way to unsubscribe anyone else.
 *
 * The scope is signed alongside the address so a link issued for one kind of
 * email cannot be replayed to silence another.
 */
export type UnsubscribeScope = "updates" | "reengagement" | "all";

export const UNSUBSCRIBE_SCOPES: UnsubscribeScope[] = ["updates", "reengagement", "all"];

export class UnsubscribeTokenError extends Error {}

function base64Url(value: Buffer) {
  return value.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function normalizeUnsubscribeEmail(value: unknown) {
  if (typeof value !== "string") throw new UnsubscribeTokenError("That unsubscribe link is not valid.");
  const email = value.trim().toLowerCase();
  if (email.length < 5 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new UnsubscribeTokenError("That unsubscribe link is not valid.");
  }
  return email;
}

export function isUnsubscribeScope(value: unknown): value is UnsubscribeScope {
  return typeof value === "string" && UNSUBSCRIBE_SCOPES.includes(value as UnsubscribeScope);
}

export function signUnsubscribeToken(email: string, scope: UnsubscribeScope, secret: string) {
  if (!secret) throw new UnsubscribeTokenError("Unsubscribe links are not configured.");
  const normalized = normalizeUnsubscribeEmail(email);
  return base64Url(createHmac("sha256", secret).update(`${normalized}:${scope}`).digest());
}

/**
 * Deliberately returns a boolean rather than throwing, so a caller cannot leak
 * through a distinguishable error which half of the pair was wrong.
 */
export function verifyUnsubscribeToken(
  email: string,
  scope: UnsubscribeScope,
  token: unknown,
  secret: string,
) {
  if (typeof token !== "string" || !token || !secret) return false;
  let expected: string;
  try {
    expected = signUnsubscribeToken(email, scope, secret);
  } catch {
    return false;
  }
  const supplied = Buffer.from(token, "utf8");
  const control = Buffer.from(expected, "utf8");
  return supplied.length === control.length && timingSafeEqual(supplied, control);
}

function buildUnsubscribeUrl(path: string, baseUrl: string, email: string, scope: UnsubscribeScope, secret: string) {
  const url = new URL(path, baseUrl);
  url.searchParams.set("email", normalizeUnsubscribeEmail(email));
  url.searchParams.set("scope", scope);
  url.searchParams.set("token", signUnsubscribeToken(email, scope, secret));
  return url.toString();
}

/**
 * The human-visible unsubscribe link, carried in the email body. It opens the
 * /unsubscribe confirmation page, which a signed-out recipient can use directly.
 */
export function unsubscribeUrl(baseUrl: string, email: string, scope: UnsubscribeScope, secret: string) {
  return buildUnsubscribeUrl("/unsubscribe", baseUrl, email, scope, secret);
}

/**
 * The one-click endpoint from RFC 8058. Mail clients POST to this URL without
 * ever loading a page, so it must resolve to the API route that accepts that
 * POST — not the /unsubscribe page, whose form only answers a signed-in submit.
 * Both URLs carry the same signed token, so either path stops the same email.
 */
export function unsubscribeOneClickUrl(baseUrl: string, email: string, scope: UnsubscribeScope, secret: string) {
  return buildUnsubscribeUrl("/api/unsubscribe", baseUrl, email, scope, secret);
}

export function unsubscribeHeaders(baseUrl: string, email: string, scope: UnsubscribeScope, secret: string) {
  return {
    "List-Unsubscribe": `<${unsubscribeOneClickUrl(baseUrl, email, scope, secret)}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}
