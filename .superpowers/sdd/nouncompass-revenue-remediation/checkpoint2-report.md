# Checkpoint 2 - Product, checkout, and revenue remediation

## Scope completed

- Added one typed Semester Pass definition: NGN 2,500 / 250,000 kobo, 180 days, one-time billing, no automatic renewal, concrete entitlements, and availability language.
- Routed payment setup, membership duration, homepage, membership offer/schema/metadata, and active policy copy to this source where applicable.
- Corrected stale public copy that implied past-question banks, reviewed banks, or future mock-exam banks. Historical competitor research remains untouched.
- Made the purchase control auth-aware. Signed-out visitors receive only `Sign in to buy` with `/membership` as the return route; the client does not POST checkout and sign-in has no automatic checkout step.
- Added a safe internal return-path helper and applied it to sign-in, sign-up verification email redirects, and the auth callback. It rejects protocol-relative, absolute, backslash, and encoded escape attempts.
- Added the typed, allow-listed revenue event map and client helper. It strips unknown/undefined values, excludes PII and identifiers, and session-deduplicates success events.
- Instrumented membership view/click, sign-up start/submit, email verification, checkout start/failure, payment verification/activation, and AI Practice start/completion.
- Clarified signup and privacy copy: lifecycle study/inactivity reminders are account preferences with an unsubscribe path; newsletter/product marketing is separate explicit consent.
- Made lifecycle re-engagement fail closed without a dedicated `UNSUBSCRIBE_SECRET`. `REENGAGEMENT_ENABLED` remains an exact `"true"` gate and ordinary page rendering does not require the secret.

## Test-first evidence

The following new behavior tests were written and run red before their implementation files existed:

- `tests/platform/product-config.test.ts`
- `tests/platform/return-path.test.ts`
- `tests/platform/revenue-analytics.test.ts`
- `tests/platform/reengagement-secret.test.ts`

## Verification

- Targeted platform tests: 19 passed.
- TypeScript: `npx tsc --noEmit` passed before the final analytics queue-only adjustment; the bounded post-adjustment rerun exceeded 120 seconds without output, so the coordinator should perform the next full compiler pass.
- Full platform suite: `npm run test:platform` passed (140 tests).

## Production gates and non-actions

- No article MDX, sitemap, AdSense configuration, production service setting, migration, deployment, or outbound email was changed or invoked.
- Before enabling re-engagement in Production: set a dedicated `UNSUBSCRIBE_SECRET`, confirm the owner-reviewed single-recipient test path, then explicitly set `REENGAGEMENT_ENABLED=true`.

## Review fix round 1

- The dedicated `UNSUBSCRIBE_SECRET` check now runs inside `sendReengagementEmail` and `sendInactiveStageEmail`, before transporter creation. This covers cron, admin, and `reengagement-preview.mjs --send`; render-only previews never call the sender.
- Email-verification analytics no longer accepts a query parameter. The auth callback creates a five-minute signed, HttpOnly, SameSite=Lax marker cookie and redirects to the clean return path. A same-origin POST endpoint validates and clears it before the browser emits the event.
- Flutterwave, the membership hero, payment callback, and receipt now use `semesterPass.durationDays` and the shared price facts rather than hard-coded plan duration/price claims.
- The signed-out `Sign in to buy` link records the allow-listed membership CTA event before navigation.
- Review-round verification: focused tests passed (7 tests) and `npx tsc --noEmit` passed.
