# Monetization operations and proof status

Last reviewed locally: 2026-08-12. This document records code-level evidence only. It does not assert current provider, Vercel, AdSense, Brevo, or production-database state.

## AdSense: disabled until manual approval gates

The application has no ad placeholder or slot. The global client loader can append the asynchronous Google Auto ads script only when both public runtime values are present:

- `NEXT_PUBLIC_ADSENSE_ENABLED` is exactly `true` (case and whitespace sensitive).
- `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` matches `ca-pub-<digits>`.

The exact route allowlist is `/`, `/articles`, `/articles/*`, `/admission`, `/examinations`, `/gst`, `/portal`, `/results`, `/student-guides`, `/study-centres`, `/about`, `/contact`, `/privacy-policy`, `/terms`, `/disclaimer`, `/editorial-policy`, `/copyright-policy`, `/corrections-policy`, `/academic-integrity`, `/takedown-policy`, `/refund-policy`, `/authors`, and `/reviewers`. These are editorial or trust pages with content as their dominant purpose.

The loader rejects every query-string or hash variant before it injects, including client-only hash navigation. It excludes account, dashboard, admin, API, membership, tools, course materials, exam preparation, unsubscribe, payment/callback, support, auth, and `/fees`; the latter is excluded because the Fee Checker is interactive and account-gated. Keep both variables absent or disabled in source control and unconfigured until these owner gates are complete:

1. AdSense approval for the live URL-prefix property.
2. A Google-certified CMP configured for required visitor regions.
3. AdSense UI URL-prefix page exclusions for all private, transactional, tool, support, auth, and callback routes.
4. Confirm `public/ads.txt` remains exactly aligned with the approved publisher account before enabling.

## Flutterwave: local contract proof, no provider transaction

Automated local tests cover Standard initialization with the exact NGN 2,500 amount, `NGN` currency, local reference, callback URL, customer metadata, `semester-pass` metadata, and the 180-day entitlement product facts. They also cover successful-status/timestamp validation, amount/currency checks, test-by-default credentials, mismatched/invalid live key rejection, customer binding, callback input validation, webhook HMAC verification, and the existing payment-event uniqueness/replay and activation-lock design.

Unverified in this checkpoint: an actual Flutterwave test transaction, Flutterwave callback/webhook delivery, and a production database payment/membership row. Do not add credentials, call the provider, apply migrations, or change Vercel checkout flags without owner authorization. When authorized, use a controlled test transaction and verify the provider dashboard, server-side verification, event replay response, `payment_attempts`, `payment_events`, membership end date, and audit log without recording transaction references or secrets here.

## Re-engagement email: local preview only

Run `npx tsx scripts/marketing/reengagement-preview.mjs` to render the HTML and text preview locally; it does not send email. Local automated tests cover the rendered HTML/text, escape safety, unsubscribe body link, and RFC 8058 `List-Unsubscribe` / `List-Unsubscribe-Post` headers. The cron remains off unless `REENGAGEMENT_ENABLED` is exactly `true`; unset, uppercase, padded, or false values do not enable it.

Unverified in this checkpoint: owner review and test send, inbox rendering, Brevo transactional logs, the notification row, and daily cron execution. Keep the flag unset or non-`true` until all are reviewed, the dedicated `UNSUBSCRIBE_SECRET` is configured, and the owner explicitly approves enablement.
