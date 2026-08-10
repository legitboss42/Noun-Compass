import assert from "node:assert/strict";
import test from "node:test";
import {
  isUnsubscribeScope,
  normalizeUnsubscribeEmail,
  signUnsubscribeToken,
  unsubscribeHeaders,
  unsubscribeUrl,
  UnsubscribeTokenError,
  verifyUnsubscribeToken,
} from "../../lib/platform/unsubscribe-core";

const SECRET = "test-unsubscribe-secret";

test("a token only unsubscribes the address and scope it was signed for", () => {
  const token = signUnsubscribeToken("student@example.com", "updates", SECRET);
  assert.equal(verifyUnsubscribeToken("student@example.com", "updates", token, SECRET), true);

  // The whole point of signing: a link handed to one recipient must not silence
  // anyone else, and must not escalate to stopping every email.
  assert.equal(verifyUnsubscribeToken("someone.else@example.com", "updates", token, SECRET), false);
  assert.equal(verifyUnsubscribeToken("student@example.com", "all", token, SECRET), false);
});

test("addresses are compared in their normalized form", () => {
  const token = signUnsubscribeToken("Student@Example.COM ", "updates", SECRET);
  assert.equal(verifyUnsubscribeToken("student@example.com", "updates", token, SECRET), true);
});

test("verification refuses rather than throws on junk input", () => {
  assert.equal(verifyUnsubscribeToken("student@example.com", "updates", undefined, SECRET), false);
  assert.equal(verifyUnsubscribeToken("student@example.com", "updates", "", SECRET), false);
  assert.equal(verifyUnsubscribeToken("student@example.com", "updates", "short", SECRET), false);
  assert.equal(verifyUnsubscribeToken("not-an-email", "updates", "anything", SECRET), false);

  // A missing secret must fail closed, never accept everything.
  const token = signUnsubscribeToken("student@example.com", "updates", SECRET);
  assert.equal(verifyUnsubscribeToken("student@example.com", "updates", token, ""), false);
});

test("a rotated secret invalidates old links", () => {
  const token = signUnsubscribeToken("student@example.com", "updates", SECRET);
  assert.equal(verifyUnsubscribeToken("student@example.com", "updates", token, "different-secret"), false);
});

test("invalid addresses and scopes are rejected before anything is signed", () => {
  assert.throws(() => normalizeUnsubscribeEmail("nope"), UnsubscribeTokenError);
  assert.throws(() => normalizeUnsubscribeEmail(null), UnsubscribeTokenError);
  assert.throws(() => signUnsubscribeToken("student@example.com", "updates", ""), UnsubscribeTokenError);
  assert.equal(isUnsubscribeScope("updates"), true);
  assert.equal(isUnsubscribeScope("everything"), false);
});

test("the link and the one-click header agree with each other", () => {
  const url = new URL(unsubscribeUrl("https://nouncompass.me", "student@example.com", "updates", SECRET));
  assert.equal(url.pathname, "/unsubscribe");
  assert.equal(url.searchParams.get("email"), "student@example.com");
  assert.equal(url.searchParams.get("scope"), "updates");
  assert.equal(
    verifyUnsubscribeToken("student@example.com", "updates", url.searchParams.get("token"), SECRET),
    true,
  );

  const headers = unsubscribeHeaders("https://nouncompass.me", "student@example.com", "updates", SECRET);
  // RFC 8058: the header must be bracketed and paired with the one-click POST.
  assert.match(headers["List-Unsubscribe"], /^<https:\/\/nouncompass\.me\/unsubscribe\?/);
  assert.match(headers["List-Unsubscribe"], />$/);
  assert.equal(headers["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click");
});
