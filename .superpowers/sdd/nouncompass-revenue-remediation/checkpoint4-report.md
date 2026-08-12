# Checkpoint 4 revenue remediation report

Status: code and local verification complete on 2026-08-12; external and production proof remains deliberately unperformed.

No external or production mutation is authorized for this checkpoint: no AdSense application or enablement, CMP configuration, provider call, email send, migration, environment change, deployment, or push.

## Local evidence

- AdSense red/green: `npx tsx --test tests/platform/adsense.test.ts` first failed because the new pure policy module did not exist; after implementation, 3 tests passed. The contract requires exact `true`, a `ca-pub-<digits>` publisher ID, and an explicit information/trust allowlist. It rejects private, transactional, tool, query, fragment, and absolute-URL input.
- Flutterwave red/green: `npx tsx --test tests/platform/flutterwave.test.ts` first failed because the initialization-payload and credential-mode functions did not exist; after implementation, 11 tests passed. The pure request uses NGN 2,500, `semester-pass` metadata, and a 180-day product description. Credential validation defaults to test and rejects malformed, mismatched, or unsupported modes before an HTTP request can be made.
- Re-engagement red/green: `npx tsx --test tests/platform/reengagement-send-safety.test.ts` first failed because the strict cron predicate did not exist; after implementation, 2 tests passed. Only exact lowercase `true` enables the cron.
- Email preview: `npx tsx scripts/marketing/reengagement-preview.mjs` rendered `tmp/reengagement-preview.html` and `.txt`; output explicitly said that nothing was sent. A local check confirmed HTML/text include the re-engagement unsubscribe link and no unfilled template tokens. Related email, unsubscribe-header, and send-safety tests passed (14 tests).
- Typecheck: `npx tsc --noEmit` passed.
- Targeted final verification: `npx tsx --test tests/platform/adsense.test.ts tests/platform/flutterwave.test.ts tests/platform/reengagement-email.test.ts tests/platform/reengagement-send-safety.test.ts tests/platform/unsubscribe-core.test.ts` passed with 28 tests, 0 failures. `npx tsc --noEmit` and `git diff --check` also passed. A full platform-suite run earlier in this checkpoint passed with 158 tests, 0 failures; the final targeted rerun is the fresh post-change evidence.

## Manual gates still required

1. AdSense owner approval, certified CMP setup, AdSense UI URL-prefix exclusions, publisher/`ads.txt` review, and explicit Production environment enablement.
2. Owner-authorized controlled Flutterwave test transaction and verification of provider dashboard, callback/webhook, replay behavior, payment event/attempt, membership end date, and audit record. No provider transaction or database row was inspected here.
3. Owner review and one-address email test send; verify inbox rendering, Brevo transactional logs, `notifications` handoff row, and cron result before explicitly setting `REENGAGEMENT_ENABLED=true`.

## Review fix round 1 (2026-08-12)

- AdSense route enforcement now takes pathname, query, and hash separately. The globally mounted loader reads `useSearchParams()` and listens for `hashchange`, so a query or hash variant cannot inject or retain the script after client navigation. The exact allowlist is documented in `docs/monetization-operations.md`; `/fees` was removed because its primary experience is the authenticated interactive Fee Checker.
- Flutterwave configuration now imports the same strict `isFlutterwaveSecretKeyValid` predicate used at the request boundary. Environment values must be exact `test` or `live`; test mode accepts test-key prefixes only, live mode accepts the live-key pattern only, and checkout/emergency flags are exact lowercase `true` checks.
- Red/green evidence: new location and strict-config tests failed against the previous behavior (missing loader decision helper, `/fees` eligible, and permissive config validation) before the minimal implementation. Final targeted verification is recorded after this change.
- Final fix-round verification: `npx tsx --test tests/platform/adsense.test.ts tests/platform/config.test.ts tests/platform/flutterwave.test.ts` passed with 20 tests and 0 failures; `npx tsc --noEmit` and `git diff --check` passed.
