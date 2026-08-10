# Re-engagement Email Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically email verified-but-inactive signed-up users a re-engagement nudge each day, styled like the existing auth emails, with a working one-click unsubscribe.

**Architecture:** Pure, unit-tested core modules (token signing, branded email layout, re-engagement copy, campaign orchestration with injected dependencies) plus thin glue (SMTP send function, unsubscribe route, a new block in the existing daily cron) and one Supabase migration (opt-out column + a `service_role`-only candidate-selection function).

**Tech Stack:** Next.js 16 (App Router), TypeScript, Supabase (`@supabase/supabase-js`), nodemailer over Brevo SMTP, `node:crypto`, `node:test` + `tsx` for tests.

## Global Constraints

- **Test location:** every test file MUST be `tests/platform/*.test.ts` — the `test:platform` script globs only that directory; tests elsewhere never run.
- **Test style:** `import test from "node:test";` + `import assert from "node:assert/strict";`, relative imports (e.g. `../../lib/email-links`), matching `tests/platform/ai-quota-core.test.ts`.
- **Pure modules stay pure:** `lib/email-links.ts`, `lib/email-layout.ts`, `lib/platform/reengagement-email-core.ts`, `lib/platform/reengagement-core.ts` MUST NOT import `server-only`, Next runtime, nodemailer, or the Supabase client — so `tsx --test` can import them.
- **Path alias:** `@/*` → `./` (app/route code uses `@/...`; test files use relative paths).
- **Audience defaults:** grace `3` days, cooldown `14` days, batch `100`/run.
- **Brand palette (verbatim):** page `#07111f`, card `#0d1b2a`, green bar/button `#18a558`, amber highlight `#f0b429`.
- **Footer links:** use `/privacy-policy` (NOT `/privacy` — that route 404s) and `/contact`.
- **Token signing:** HMAC-SHA256; secret = `EMAIL_LINK_SECRET` ?? `SUPABASE_SERVICE_ROLE_KEY`.
- **Send path:** Brevo SMTP via existing `createTransporter()`; set `List-Unsubscribe` + `List-Unsubscribe-Post: List-Unsubscribe=One-Click`.
- **Migration filename:** `supabase/migrations/202608100002_reengagement_reminders.sql` (next index after `202608100001`).
- **CTA target:** `${NEXT_PUBLIC_SITE_URL}/dashboard/practice`.
- **Ordering trade-off:** record the notification AFTER a successful send (prefer a rare duplicate over silent non-delivery); the 14-day cooldown bounds any duplicate to at most one extra email.

## File Structure

**New**
- `lib/email-links.ts` — HMAC sign/verify for unsubscribe tokens (pure).
- `lib/email-layout.ts` — `escapeHtml` + `renderBrandedEmail` shell (pure).
- `lib/platform/reengagement-email-core.ts` — re-engagement subject/body copy (pure).
- `lib/platform/reengagement-core.ts` — `runReengagementCampaign` orchestration with injected deps (pure).
- `app/api/email/unsubscribe/route.ts` — GET/POST unsubscribe (glue).
- `supabase/migrations/202608100002_reengagement_reminders.sql` — column + RPC.
- `tests/platform/email-links.test.ts`
- `tests/platform/email-layout.test.ts`
- `tests/platform/reengagement-email-core.test.ts`
- `tests/platform/reengagement-core.test.ts`

**Modified**
- `lib/contact-mail.ts` — add `sendReengagementEmail(...)`.
- `app/api/cron/daily/route.ts` — add guarded re-engagement block + details counts.

---

## Task 1: Email link signing (`lib/email-links.ts`)

**Files:**
- Create: `lib/email-links.ts`
- Test: `tests/platform/email-links.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `signEmailToken(userId: string, purpose: string, secret?: string): string`
  - `verifyEmailToken(token: string, purpose: string, secret?: string): string | null` (returns `userId` or `null`)

- [ ] **Step 1: Write the failing test**

```ts
// tests/platform/email-links.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import { signEmailToken, verifyEmailToken } from "../../lib/email-links";

const SECRET = "unit-test-secret";

test("a signed token round-trips back to the user id", () => {
  const token = signEmailToken("user-123", "reengagement", SECRET);
  assert.equal(verifyEmailToken(token, "reengagement", SECRET), "user-123");
});

test("a tampered token is rejected", () => {
  const token = signEmailToken("user-123", "reengagement", SECRET);
  const tampered = token.slice(0, -2) + (token.endsWith("A") ? "B" : "A");
  assert.equal(verifyEmailToken(tampered, "reengagement", SECRET), null);
});

test("a token minted for another purpose is rejected", () => {
  const token = signEmailToken("user-123", "reengagement", SECRET);
  assert.equal(verifyEmailToken(token, "password-reset", SECRET), null);
});

test("a token signed with another secret is rejected", () => {
  const token = signEmailToken("user-123", "reengagement", "other-secret");
  assert.equal(verifyEmailToken(token, "reengagement", SECRET), null);
});

test("garbage and empty input return null, never throw", () => {
  assert.equal(verifyEmailToken("", "reengagement", SECRET), null);
  assert.equal(verifyEmailToken("not-a-token", "reengagement", SECRET), null);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/platform/email-links.test.ts`
Expected: FAIL (cannot find module `../../lib/email-links`).

- [ ] **Step 3: Write minimal implementation**

```ts
// lib/email-links.ts
import crypto from "node:crypto";

function resolveSecret(secret?: string): string {
  const value =
    secret ?? process.env.EMAIL_LINK_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) {
    throw new Error("Missing EMAIL_LINK_SECRET / SUPABASE_SERVICE_ROLE_KEY for email link signing.");
  }
  return value;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

export function signEmailToken(userId: string, purpose: string, secret?: string): string {
  const key = resolveSecret(secret);
  const payload = `${purpose}:${userId}`;
  const mac = crypto.createHmac("sha256", key).update(payload).digest();
  return `${base64url(payload)}.${base64url(mac)}`;
}

export function verifyEmailToken(token: string, purpose: string, secret?: string): string | null {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const key = resolveSecret(secret);
  const [payloadPart, macPart] = token.split(".", 2);
  let payload: string;
  let providedMac: Buffer;
  try {
    payload = Buffer.from(payloadPart, "base64url").toString("utf8");
    providedMac = Buffer.from(macPart, "base64url");
  } catch {
    return null;
  }
  const expectedMac = crypto.createHmac("sha256", key).update(payload).digest();
  if (providedMac.length !== expectedMac.length) return null;
  if (!crypto.timingSafeEqual(providedMac, expectedMac)) return null;

  const separator = payload.indexOf(":");
  if (separator === -1) return null;
  const tokenPurpose = payload.slice(0, separator);
  const userId = payload.slice(separator + 1);
  if (tokenPurpose !== purpose || !userId) return null;
  return userId;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/platform/email-links.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/email-links.ts tests/platform/email-links.test.ts
git commit -m "feat: add HMAC email link signing for unsubscribe tokens"
```

---

## Task 2: Branded email layout (`lib/email-layout.ts`)

**Files:**
- Create: `lib/email-layout.ts`
- Test: `tests/platform/email-layout.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `escapeHtml(value: string): string`
  - `type BrandedEmailInput = { preheader: string; eyebrow: string; headingHtml: string; bodyHtml: string; cta: { label: string; url: string }; noteHtml?: string; unsubscribeUrl?: string }`
  - `renderBrandedEmail(input: BrandedEmailInput): { html: string; text: string }`

- [ ] **Step 1: Write the failing test**

```ts
// tests/platform/email-layout.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import { escapeHtml, renderBrandedEmail } from "../../lib/email-layout";

test("escapeHtml neutralises markup characters", () => {
  assert.equal(escapeHtml("<b>&\"'"), "&lt;b&gt;&amp;&quot;&#39;");
});

test("rendered html carries no leftover Supabase template tokens", () => {
  const { html } = renderBrandedEmail({
    preheader: "Preview line here",
    eyebrow: "EYEBROW",
    headingHtml: "Heading",
    bodyHtml: "<p>Body</p>",
    cta: { label: "Go", url: "https://nouncompass.me/dashboard/practice" },
  });
  assert.equal(html.includes("{{"), false);
  assert.equal(html.includes("}}"), false);
});

test("rendered html uses the real privacy route and includes the CTA + preheader", () => {
  const { html } = renderBrandedEmail({
    preheader: "Preview line here",
    eyebrow: "EYEBROW",
    headingHtml: "Heading",
    bodyHtml: "<p>Body</p>",
    cta: { label: "Go", url: "https://nouncompass.me/dashboard/practice" },
  });
  assert.ok(html.includes("/privacy-policy"));
  assert.equal(html.includes('href="https://nouncompass.me/privacy"'), false);
  assert.ok(html.includes("https://nouncompass.me/dashboard/practice"));
  assert.ok(html.includes("Preview line here"));
});

test("an unsubscribe url appears in both html and text when supplied", () => {
  const { html, text } = renderBrandedEmail({
    preheader: "Preview",
    eyebrow: "EYEBROW",
    headingHtml: "Heading",
    bodyHtml: "<p>Body</p>",
    cta: { label: "Go", url: "https://x.test/go" },
    unsubscribeUrl: "https://x.test/u/abc",
  });
  assert.ok(html.includes("https://x.test/u/abc"));
  assert.ok(text.includes("https://x.test/u/abc"));
});

test("text alternative includes the CTA url", () => {
  const { text } = renderBrandedEmail({
    preheader: "Preview",
    eyebrow: "EYEBROW",
    headingHtml: "Heading",
    bodyHtml: "<p>Body</p>",
    cta: { label: "Go", url: "https://x.test/go" },
  });
  assert.ok(text.includes("https://x.test/go"));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/platform/email-layout.test.ts`
Expected: FAIL (cannot find module `../../lib/email-layout`).

- [ ] **Step 3: Write minimal implementation**

```ts
// lib/email-layout.ts
export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export type BrandedEmailInput = {
  preheader: string;
  eyebrow: string;
  headingHtml: string;
  bodyHtml: string;
  cta: { label: string; url: string };
  noteHtml?: string;
  unsubscribeUrl?: string;
};

function stripTags(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function renderBrandedEmail(input: BrandedEmailInput): { html: string; text: string } {
  const { preheader, eyebrow, headingHtml, bodyHtml, cta, noteHtml, unsubscribeUrl } = input;
  const ctaUrl = escapeHtml(cta.url);
  const ctaLabel = escapeHtml(cta.label);
  const eyebrowSafe = escapeHtml(eyebrow);
  const preheaderSafe = escapeHtml(preheader);

  const noteBlock = noteHtml
    ? `
          <tr>
            <td class="mobile-padding" style="padding:8px 42px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background:#12243b;border:1px solid #1f3b5b;border-radius:14px;">
                <tr>
                  <td style="padding:18px 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#b9c8d9;">
                    ${noteHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
    : "";

  const unsubBlock = unsubscribeUrl
    ? `
              <p style="margin:8px 0 0;">
                You're receiving this because you have a NounCompass account.
                <a href="${escapeHtml(unsubscribeUrl)}" target="_blank" style="color:#b7c7d8;text-decoration:underline;">Unsubscribe from these reminders</a>.
              </p>`
    : "";

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>NounCompass</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; display: block; }
    table { border-collapse: collapse !important; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background: #07111f; }
    a { color: inherit; }
    @media screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .mobile-padding { padding-left: 22px !important; padding-right: 22px !important; }
      .headline { font-size: 30px !important; line-height: 38px !important; }
      .body-copy { font-size: 16px !important; line-height: 26px !important; }
      .button { display: block !important; width: 100% !important; box-sizing: border-box !important; }
    }
  </style>
</head>
<body>
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheaderSafe}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#07111f;">
    <tr>
      <td align="center" style="padding:34px 14px;">
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0"
               style="width:600px;max-width:600px;background:#0d1b2a;border-radius:22px;overflow:hidden;box-shadow:0 18px 50px rgba(0,0,0,.28);">
          <tr><td style="height:6px;background:#18a558;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr>
            <td align="center" class="mobile-padding" style="padding:34px 42px 18px;">
              <a href="https://nouncompass.me" target="_blank" style="text-decoration:none;">
                <img src="https://nouncompass.me/images/brand/nouncompass-icon.svg" width="58" height="58" alt="NounCompass" style="width:58px;height:58px;margin:0 auto 12px;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:28px;font-weight:800;color:#ffffff;letter-spacing:.2px;">Noun<span style="color:#18a558;">Compass</span></div>
              </a>
            </td>
          </tr>
          <tr>
            <td class="mobile-padding" style="padding:12px 42px 0;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;font-weight:800;letter-spacing:1.7px;color:#65d895;">${eyebrowSafe}</div>
            </td>
          </tr>
          <tr>
            <td class="mobile-padding" style="padding:12px 42px 0;">
              <h1 class="headline" style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:40px;line-height:48px;font-weight:800;color:#ffffff;">${headingHtml}</h1>
            </td>
          </tr>
          <tr>
            <td class="mobile-padding body-copy" style="padding:22px 42px 0;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:28px;color:#d4deea;">${bodyHtml}</td>
          </tr>
          <tr>
            <td class="mobile-padding" align="center" style="padding:30px 42px 16px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" bgcolor="#18a558" style="border-radius:12px;">
                    <a class="button" href="${ctaUrl}" target="_blank" style="display:inline-block;padding:17px 28px;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:22px;font-weight:800;color:#ffffff;text-decoration:none;border-radius:12px;background:#18a558;">${ctaLabel}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>${noteBlock}
          <tr>
            <td class="mobile-padding" style="padding:24px 42px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:21px;color:#91a4b8;">
              If the button does not work, copy and paste this link into your browser:<br>
              <a href="${ctaUrl}" target="_blank" style="color:#65d895;text-decoration:underline;word-break:break-all;">${ctaUrl}</a>
            </td>
          </tr>
          <tr>
            <td align="center" class="mobile-padding" style="padding:34px 42px 12px;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;font-weight:700;color:#ffffff;margin-bottom:14px;">Follow NounCompass</div>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
                <tr>
                  <td align="center" style="padding:0 8px;"><a href="https://www.facebook.com/nouncompass/" target="_blank" aria-label="Facebook"><img src="https://nouncompass.me/images/email/social/facebook.png" width="36" height="36" alt="Facebook" style="display:block;width:36px;height:36px;border:0;border-radius:18px;"></a></td>
                  <td align="center" style="padding:0 8px;"><a href="https://www.instagram.com/NounCompass/" target="_blank" aria-label="Instagram"><img src="https://nouncompass.me/images/email/social/instagram.png" width="36" height="36" alt="Instagram" style="display:block;width:36px;height:36px;border:0;border-radius:18px;"></a></td>
                  <td align="center" style="padding:0 8px;"><a href="https://x.com/NounCompass" target="_blank" aria-label="X"><img src="https://nouncompass.me/images/email/social/x.png" width="36" height="36" alt="X" style="display:block;width:36px;height:36px;border:0;border-radius:18px;"></a></td>
                  <td align="center" style="padding:0 8px;"><a href="https://www.pinterest.com/NounCompass/" target="_blank" aria-label="Pinterest"><img src="https://nouncompass.me/images/email/social/pinterest.png" width="36" height="36" alt="Pinterest" style="display:block;width:36px;height:36px;border:0;border-radius:18px;"></a></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="mobile-padding" align="center" style="padding:20px 42px 32px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;color:#7890a6;">
              <p style="margin:0 0 8px;">
                <a href="https://nouncompass.me" target="_blank" style="color:#b7c7d8;text-decoration:none;">Visit NounCompass</a> &bull;
                <a href="https://nouncompass.me/privacy-policy" target="_blank" style="color:#b7c7d8;text-decoration:none;">Privacy Policy</a> &bull;
                <a href="https://nouncompass.me/contact" target="_blank" style="color:#b7c7d8;text-decoration:none;">Contact</a>
              </p>
              <p style="margin:0 0 8px;">© 2026 NounCompass. All rights reserved.</p>
              <p style="margin:0;">NounCompass is an independent student-support platform and is not the official website of the National Open University of Nigeria.</p>${unsubBlock}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    stripTags(headingHtml),
    "",
    stripTags(bodyHtml),
    "",
    `${cta.label}: ${cta.url}`,
    unsubscribeUrl ? `\nUnsubscribe: ${unsubscribeUrl}` : "",
    "",
    "NounCompass is an independent student-support platform and is not the official NOUN website.",
  ]
    .join("\n")
    .trim();

  return { html, text };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/platform/email-layout.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/email-layout.ts tests/platform/email-layout.test.ts
git commit -m "feat: add branded email layout from auth template shell"
```

---

## Task 3: Re-engagement copy (`lib/platform/reengagement-email-core.ts`)

**Files:**
- Create: `lib/platform/reengagement-email-core.ts`
- Test: `tests/platform/reengagement-email-core.test.ts`

**Interfaces:**
- Consumes: `renderBrandedEmail`, `escapeHtml` from `../email-layout` (Task 2).
- Produces:
  - `const REENGAGEMENT_SUBJECT: string`
  - `buildReengagementEmail(input: { displayName: string; ctaUrl: string; unsubscribeUrl: string }): { subject: string; html: string; text: string }`

- [ ] **Step 1: Write the failing test**

```ts
// tests/platform/reengagement-email-core.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import { buildReengagementEmail, REENGAGEMENT_SUBJECT } from "../../lib/platform/reengagement-email-core";

const base = {
  displayName: "Ada",
  ctaUrl: "https://nouncompass.me/dashboard/practice",
  unsubscribeUrl: "https://nouncompass.me/api/email/unsubscribe?token=abc",
};

test("subject is non-empty and matches the exported constant", () => {
  const email = buildReengagementEmail(base);
  assert.equal(email.subject, REENGAGEMENT_SUBJECT);
  assert.ok(email.subject.length > 0);
});

test("the unsubscribe url is embedded in html and text", () => {
  const email = buildReengagementEmail({ ...base, unsubscribeUrl: "https://x.test/u/abc" });
  assert.ok(email.html.includes("https://x.test/u/abc"));
  assert.ok(email.text.includes("https://x.test/u/abc"));
});

test("an empty display name falls back to a neutral greeting", () => {
  const email = buildReengagementEmail({ ...base, displayName: "  " });
  assert.ok(email.html.includes("Hi there,"));
});

test("a display name with markup is escaped", () => {
  const email = buildReengagementEmail({ ...base, displayName: "<script>" });
  assert.equal(email.html.includes("<script>"), false);
  assert.ok(email.html.includes("&lt;script&gt;"));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/platform/reengagement-email-core.test.ts`
Expected: FAIL (cannot find module).

- [ ] **Step 3: Write minimal implementation**

```ts
// lib/platform/reengagement-email-core.ts
import { escapeHtml, renderBrandedEmail } from "../email-layout";

export const REENGAGEMENT_SUBJECT =
  "You signed up for NounCompass — exams are coming, let's begin";

export function buildReengagementEmail(input: {
  displayName: string;
  ctaUrl: string;
  unsubscribeUrl: string;
}): { subject: string; html: string; text: string } {
  const trimmed = input.displayName.trim();
  const greetingName = trimmed ? escapeHtml(trimmed) : "there";

  const bodyHtml = `
    <p style="margin:0 0 14px;font-weight:700;color:#ffffff;">Hi ${greetingName}, your NounCompass account is ready — but you haven't started yet.</p>
    <p style="margin:0;">Exams are fast approaching. Jump in now to practise past questions, generate AI practice sets from your course materials, and build a study plan that keeps you on track.</p>`;

  const { html, text } = renderBrandedEmail({
    preheader: "Your exams are coming up — start practising on NounCompass today.",
    eyebrow: "PICK UP WHERE YOU LEFT OFF",
    headingHtml: `Let's get you <span style="color:#f0b429;">exam-ready</span>`,
    bodyHtml,
    cta: { label: "Start practising", url: input.ctaUrl },
    unsubscribeUrl: input.unsubscribeUrl,
  });

  return { subject: REENGAGEMENT_SUBJECT, html, text };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/platform/reengagement-email-core.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/platform/reengagement-email-core.ts tests/platform/reengagement-email-core.test.ts
git commit -m "feat: add re-engagement email copy builder"
```

---

## Task 4: Campaign orchestration (`lib/platform/reengagement-core.ts`)

**Files:**
- Create: `lib/platform/reengagement-core.ts`
- Test: `tests/platform/reengagement-core.test.ts`

**Interfaces:**
- Consumes: nothing (pure; all effects injected).
- Produces:
  - `type ReengagementCandidate = { userId: string; email: string; displayName: string }`
  - `type ReengagementDeps = { fetchCandidates: () => Promise<ReengagementCandidate[]>; buildUnsubscribeUrl: (userId: string) => string; sendEmail: (candidate: ReengagementCandidate, unsubscribeUrl: string) => Promise<void>; recordSent: (candidate: ReengagementCandidate) => Promise<void> }`
  - `type ReengagementConfig = { enabled: boolean; batchLimit: number }`
  - `type ReengagementResult = { candidates: number; emailed: number; failed: number }`
  - `runReengagementCampaign(deps: ReengagementDeps, config: ReengagementConfig): Promise<ReengagementResult>`

- [ ] **Step 1: Write the failing test**

```ts
// tests/platform/reengagement-core.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  runReengagementCampaign,
  type ReengagementCandidate,
} from "../../lib/platform/reengagement-core";

function candidate(n: number): ReengagementCandidate {
  return { userId: `u${n}`, email: `u${n}@x.test`, displayName: `U${n}` };
}

function deps(candidates: ReengagementCandidate[], overrides: Partial<{ sendEmail: (c: ReengagementCandidate) => Promise<void> }> = {}) {
  const sent: string[] = [];
  const recorded: string[] = [];
  return {
    sent,
    recorded,
    fetchCandidates: async () => candidates,
    buildUnsubscribeUrl: (userId: string) => `https://x.test/u/${userId}`,
    sendEmail: async (c: ReengagementCandidate) => {
      if (overrides.sendEmail) return overrides.sendEmail(c);
      sent.push(c.userId);
    },
    recordSent: async (c: ReengagementCandidate) => {
      recorded.push(c.userId);
    },
  };
}

test("disabled config sends nothing and never fetches", async () => {
  let fetched = false;
  const result = await runReengagementCampaign(
    {
      fetchCandidates: async () => {
        fetched = true;
        return [candidate(1)];
      },
      buildUnsubscribeUrl: () => "x",
      sendEmail: async () => {},
      recordSent: async () => {},
    },
    { enabled: false, batchLimit: 100 },
  );
  assert.equal(fetched, false);
  assert.deepEqual(result, { candidates: 0, emailed: 0, failed: 0 });
});

test("the batch limit caps how many are emailed", async () => {
  const d = deps([candidate(1), candidate(2), candidate(3), candidate(4), candidate(5)]);
  const result = await runReengagementCampaign(d, { enabled: true, batchLimit: 3 });
  assert.equal(result.candidates, 3);
  assert.equal(result.emailed, 3);
  assert.deepEqual(d.sent, ["u1", "u2", "u3"]);
});

test("a send failure is isolated and does not record or abort", async () => {
  const d = deps([candidate(1), candidate(2), candidate(3)], {
    sendEmail: async (c) => {
      if (c.userId === "u2") throw new Error("smtp down");
    },
  });
  const result = await runReengagementCampaign(d, { enabled: true, batchLimit: 100 });
  assert.equal(result.emailed, 2);
  assert.equal(result.failed, 1);
  assert.deepEqual(d.recorded, ["u1", "u3"]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/platform/reengagement-core.test.ts`
Expected: FAIL (cannot find module).

- [ ] **Step 3: Write minimal implementation**

```ts
// lib/platform/reengagement-core.ts
export type ReengagementCandidate = {
  userId: string;
  email: string;
  displayName: string;
};

export type ReengagementDeps = {
  fetchCandidates: () => Promise<ReengagementCandidate[]>;
  buildUnsubscribeUrl: (userId: string) => string;
  sendEmail: (candidate: ReengagementCandidate, unsubscribeUrl: string) => Promise<void>;
  recordSent: (candidate: ReengagementCandidate) => Promise<void>;
};

export type ReengagementConfig = {
  enabled: boolean;
  batchLimit: number;
};

export type ReengagementResult = {
  candidates: number;
  emailed: number;
  failed: number;
};

export async function runReengagementCampaign(
  deps: ReengagementDeps,
  config: ReengagementConfig,
): Promise<ReengagementResult> {
  if (!config.enabled) return { candidates: 0, emailed: 0, failed: 0 };

  const all = await deps.fetchCandidates();
  const batch = all.slice(0, Math.max(0, config.batchLimit));

  let emailed = 0;
  let failed = 0;
  for (const candidate of batch) {
    try {
      const unsubscribeUrl = deps.buildUnsubscribeUrl(candidate.userId);
      await deps.sendEmail(candidate, unsubscribeUrl);
      await deps.recordSent(candidate);
      emailed += 1;
    } catch {
      failed += 1;
    }
  }

  return { candidates: batch.length, emailed, failed };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/platform/reengagement-core.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/platform/reengagement-core.ts tests/platform/reengagement-core.test.ts
git commit -m "feat: add re-engagement campaign orchestration core"
```

---

## Task 5: Migration — opt-out column + candidate RPC

**Files:**
- Create: `supabase/migrations/202608100002_reengagement_reminders.sql`

**Interfaces:**
- Produces: `public.email_preferences.reengagement_reminders boolean` and
  `public.select_reengagement_candidates(integer, integer, integer)` returning `(user_id uuid, email text, display_name text)`.

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/202608100002_reengagement_reminders.sql

-- Opt-out flag for the inactive-user re-engagement nudge. Defaults true so existing
-- users are reachable (consistent with the other reminder flags); the unsubscribe link
-- flips it to false.
alter table public.email_preferences
  add column if not exists reengagement_reminders boolean not null default true;

-- Returns verified, inactive, opted-in users who have not been nudged within the cooldown.
-- security definer so the daily cron (service_role) can read auth.users; locked to service_role.
create or replace function public.select_reengagement_candidates(
  p_grace_days integer,
  p_cooldown_days integer,
  p_limit integer
)
returns table (user_id uuid, email text, display_name text)
language sql
security definer
set search_path = public
as $$
  select u.id, u.email, coalesce(p.display_name, '')
  from auth.users u
  join public.email_preferences ep on ep.user_id = u.id
  left join public.profiles p on p.id = u.id
  where u.email_confirmed_at is not null
    and u.created_at <= now() - make_interval(days => p_grace_days)
    and ep.reengagement_reminders = true
    and not exists (select 1 from public.user_tool_activity a where a.user_id = u.id)
    and not exists (select 1 from public.practice_sessions s where s.user_id = u.id)
    and not exists (select 1 from public.ai_practice_sessions s where s.user_id = u.id)
    and not exists (select 1 from public.study_plans sp where sp.user_id = u.id)
    and not exists (
      select 1 from public.notifications n
      where n.user_id = u.id
        and n.kind = 'reengagement'
        and n.emailed_at is not null
        and n.emailed_at >= now() - make_interval(days => p_cooldown_days)
    )
  order by u.created_at asc
  limit p_limit;
$$;

revoke all on function public.select_reengagement_candidates(integer, integer, integer)
  from public, anon, authenticated;
grant execute on function public.select_reengagement_candidates(integer, integer, integer)
  to service_role;
```

- [ ] **Step 2: Verify it parses / applies (if a local Supabase DB is configured)**

If `LOCAL_DATABASE_URL` points at a running local Postgres:
Run: `psql "$LOCAL_DATABASE_URL" -f supabase/migrations/202608100002_reengagement_reminders.sql`
Expected: `ALTER TABLE`, `CREATE FUNCTION`, `REVOKE`, `GRANT` with no errors.

Then sanity-check the function signature and that it executes:
Run: `psql "$LOCAL_DATABASE_URL" -c "select * from public.select_reengagement_candidates(3, 14, 5);"`
Expected: returns 0+ rows, no error.

If no local DB is available, skip — the migration applies on deploy (`supabase db push` / hosted migration run). Note this in the commit body.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/202608100002_reengagement_reminders.sql
git commit -m "feat: add reengagement_reminders column and candidate selection RPC"
```

---

## Task 6: SMTP send function (`lib/contact-mail.ts`)

**Files:**
- Modify: `lib/contact-mail.ts`

**Interfaces:**
- Consumes: `buildReengagementEmail` from `@/lib/platform/reengagement-email-core` (Task 3); existing `createTransporter()`.
- Produces: `sendReengagementEmail(input: { to: string; displayName: string; ctaUrl: string; unsubscribeUrl: string }): Promise<void>`

- [ ] **Step 1: Add the import at the top of `lib/contact-mail.ts`**

Add after the existing imports (currently `crypto` and `nodemailer`):

```ts
import { buildReengagementEmail } from "@/lib/platform/reengagement-email-core";
```

- [ ] **Step 2: Append the send function at the end of `lib/contact-mail.ts`**

```ts
export async function sendReengagementEmail({
  to,
  displayName,
  ctaUrl,
  unsubscribeUrl,
}: {
  to: string;
  displayName: string;
  ctaUrl: string;
  unsubscribeUrl: string;
}) {
  const transporter = createTransporter();
  const fromAddress =
    process.env.CONTACT_FORM_AUTOREPLY_FROM ??
    process.env.CONTACT_FORM_FROM ??
    "NounCompass Support <support@nouncompass.me>";
  const supportInbox = process.env.CONTACT_FORM_TO ?? "support@nouncompass.me";
  const { subject, html, text } = buildReengagementEmail({ displayName, ctaUrl, unsubscribeUrl });

  await transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    text,
    html,
    headers: {
      "List-Unsubscribe": `<mailto:${supportInbox}?subject=unsubscribe>, <${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors referencing `contact-mail.ts` or `reengagement-email-core`.

- [ ] **Step 4: Commit**

```bash
git add lib/contact-mail.ts
git commit -m "feat: add sendReengagementEmail over Brevo SMTP with one-click unsubscribe headers"
```

---

## Task 7: Unsubscribe route (`app/api/email/unsubscribe/route.ts`)

**Files:**
- Create: `app/api/email/unsubscribe/route.ts`

**Interfaces:**
- Consumes: `verifyEmailToken` from `@/lib/email-links` (Task 1); `createAdminClient` from `@/lib/supabase/admin`; the `reengagement_reminders` column (Task 5).
- Produces: HTTP `GET` and `POST` handlers.

- [ ] **Step 1: Write the route**

```ts
// app/api/email/unsubscribe/route.ts
import { NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/email-links";
import { createAdminClient } from "@/lib/supabase/admin";

const PURPOSE = "reengagement";

async function applyUnsubscribe(token: string | null): Promise<boolean> {
  if (!token) return false;
  const userId = verifyEmailToken(token, PURPOSE);
  if (!userId) return false;
  const admin = createAdminClient();
  if (!admin) return false;
  const { error } = await admin
    .from("email_preferences")
    .update({ reengagement_reminders: false, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  return !error;
}

function confirmationPage(message: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NounCompass</title></head>
<body style="margin:0;background:#07111f;font-family:Arial,Helvetica,sans-serif;color:#d4deea;">
  <div style="max-width:520px;margin:0 auto;padding:56px 24px;text-align:center;">
    <div style="font-size:22px;font-weight:800;color:#ffffff;margin-bottom:18px;">Noun<span style="color:#18a558;">Compass</span></div>
    <p style="font-size:16px;line-height:26px;">${message}</p>
    <p style="margin-top:24px;"><a href="https://nouncompass.me" style="color:#65d895;">Return to NounCompass</a></p>
  </div>
</body></html>`;
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const ok = await applyUnsubscribe(token);
  const message = ok
    ? "You've been unsubscribed from NounCompass study reminder emails. You can still sign in and use the platform any time."
    : "This unsubscribe link is invalid or has expired. If you keep receiving emails, contact support@nouncompass.me.";
  return new NextResponse(confirmationPage(message), {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  await applyUnsubscribe(token);
  return new NextResponse(null, { status: 200 });
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors referencing `app/api/email/unsubscribe/route.ts`.

- [ ] **Step 3: Manual smoke test (dev server)**

Run: `npm run dev`, then in another shell mint a token and visit the URL. In a Node REPL / scratch:
```bash
node -e "process.env.EMAIL_LINK_SECRET='dev'; const {signEmailToken}=require('./lib/email-links.ts')" 2>/dev/null || echo "use the app cron path in real env"
```
Practical check: with the app running, a GET to `/api/email/unsubscribe?token=<invalid>` returns the branded "invalid or expired" page (HTTP 200). A valid token (produced by the cron in a real environment) flips `email_preferences.reengagement_reminders` to `false`. Verify in Supabase after the first real send.

- [ ] **Step 4: Commit**

```bash
git add app/api/email/unsubscribe/route.ts
git commit -m "feat: add signed unsubscribe route for re-engagement emails"
```

---

## Task 8: Cron integration (`app/api/cron/daily/route.ts`)

**Files:**
- Modify: `app/api/cron/daily/route.ts`

**Interfaces:**
- Consumes: `runReengagementCampaign` (Task 4), `sendReengagementEmail` (Task 6), `signEmailToken` (Task 1), `select_reengagement_candidates` RPC (Task 5); existing `admin` client and `runDate`.
- Produces: three new keys in `cron_runs.details`: `reengagementCandidates`, `reengagementEmailed`, `reengagementFailed`.

- [ ] **Step 1: Add imports at the top of `app/api/cron/daily/route.ts`**

Add alongside the existing imports:

```ts
import { sendReengagementEmail } from "@/lib/contact-mail";
import { signEmailToken } from "@/lib/email-links";
import { runReengagementCampaign } from "@/lib/platform/reengagement-core";
```

(`sendStudyReminderEmail` is already imported from `@/lib/contact-mail`; extend that import or add a second one.)

- [ ] **Step 2: Add the re-engagement block**

Insert immediately AFTER the `pendingSubscribers` sync loop and BEFORE the `const details = {...}` line:

```ts
    // Re-engagement nudges for verified, inactive, opted-in users.
    const reengagementEnabled = process.env.REENGAGEMENT_ENABLED !== "false";
    const graceDays = Number(process.env.REENGAGEMENT_GRACE_DAYS ?? "3");
    const cooldownDays = Number(process.env.REENGAGEMENT_COOLDOWN_DAYS ?? "14");
    const reengagementBatchLimit = Number(process.env.REENGAGEMENT_BATCH_LIMIT ?? "100");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nouncompass.me";

    const reengagement = await runReengagementCampaign(
      {
        fetchCandidates: async () => {
          const { data } = await admin.rpc("select_reengagement_candidates", {
            p_grace_days: graceDays,
            p_cooldown_days: cooldownDays,
            p_limit: reengagementBatchLimit,
          });
          return (data ?? []).map(
            (row: { user_id: string; email: string; display_name: string | null }) => ({
              userId: row.user_id,
              email: row.email,
              displayName: row.display_name ?? "",
            }),
          );
        },
        buildUnsubscribeUrl: (userId) =>
          `${siteUrl}/api/email/unsubscribe?token=${encodeURIComponent(
            signEmailToken(userId, "reengagement"),
          )}`,
        sendEmail: (candidate, unsubscribeUrl) =>
          sendReengagementEmail({
            to: candidate.email,
            displayName: candidate.displayName,
            ctaUrl: `${siteUrl}/dashboard/practice`,
            unsubscribeUrl,
          }),
        recordSent: async (candidate) => {
          const dedupeKey = `reengagement:${runDate}`;
          const { error } = await admin.from("notifications").insert({
            user_id: candidate.userId,
            kind: "reengagement",
            title: "Start your NounCompass prep",
            body: "You signed up but haven't started yet. Exams are approaching — jump in and practise.",
            action_url: "/dashboard/practice",
            dedupe_key: dedupeKey,
          });
          if (!error || error.code === "23505") {
            await admin
              .from("notifications")
              .update({ emailed_at: new Date().toISOString() })
              .eq("user_id", candidate.userId)
              .eq("dedupe_key", dedupeKey);
          }
        },
      },
      { enabled: reengagementEnabled, batchLimit: reengagementBatchLimit },
    );
```

- [ ] **Step 3: Add the counts to the `details` object**

Change the existing `const details = { ... }` to also include:

```ts
      reengagementCandidates: reengagement.candidates,
      reengagementEmailed: reengagement.emailed,
      reengagementFailed: reengagement.failed,
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 5: Run the full platform test suite**

Run: `npm run test:platform`
Expected: all tests pass, including the four new files from Tasks 1–4.

- [ ] **Step 6: Manual end-to-end (staging or with REENGAGEMENT_BATCH_LIMIT=1)**

With the migration applied and env set (`CRON_SECRET`, `BREVO_SMTP_*`, `NEXT_PUBLIC_SITE_URL`, `SUPABASE_SERVICE_ROLE_KEY`), trigger the cron:
Run: `curl -sS -H "authorization: Bearer $CRON_SECRET" "$NEXT_PUBLIC_SITE_URL/api/cron/daily"`
Expected: JSON includes `reengagementCandidates`, `reengagementEmailed`, `reengagementFailed`. Confirm a test inactive account receives the email, the styling matches the auth email, and the unsubscribe link flips `reengagement_reminders` to `false` (and that user is not returned on the next run).

- [ ] **Step 7: Commit**

```bash
git add app/api/cron/daily/route.ts
git commit -m "feat: send daily re-engagement emails to inactive users from cron"
```

---

## Self-Review

**Spec coverage**
- Audience rules (verified / grace / opted-in / no-activity / cooldown) → Task 5 RPC. ✓
- `reengagement_reminders` default-true column → Task 5. ✓
- In-app Brevo SMTP send → Task 6. ✓
- Daily cron trigger, repeatable-with-cooldown → Tasks 5 + 8. ✓
- Reuse auth-email template shell, `{{ }}` stripped, `/privacy-policy` fix → Task 2. ✓
- One-click unsubscribe (link + List-Unsubscribe headers) → Tasks 1, 6, 7. ✓
- Batch cap under Brevo daily limit → Tasks 4 + 8 (default 100). ✓
- Tests all under `tests/platform/` → Tasks 1–4. ✓
- Config knobs (`REENGAGEMENT_*`, `EMAIL_LINK_SECRET`) → Tasks 1, 8. ✓
- Per-send error isolation, idempotent dedupe → Tasks 4 + 8. ✓

**Placeholder scan:** No TODO/TBD; every code step has full content. ✓

**Type consistency:** `ReengagementCandidate { userId, email, displayName }` used identically in Tasks 4 and 8; `buildReengagementEmail({ displayName, ctaUrl, unsubscribeUrl })` signature identical in Tasks 3 and 6; `signEmailToken`/`verifyEmailToken` signatures identical in Tasks 1, 7, 8; RPC param names `p_grace_days/p_cooldown_days/p_limit` identical in Tasks 5 and 8. ✓

**Known trade-offs (intentional):**
- Record-after-send can, if a DB insert fails right after SMTP success, allow one duplicate on a later day; the cooldown caps blast radius. Documented in Global Constraints.
- The RPC `select_reengagement_candidates` is validated by manual SQL/end-to-end (Tasks 5–8), not a unit test — it is pure SQL over live tables and cannot run under `tsx --test`.
