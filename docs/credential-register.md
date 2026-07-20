# NounCompass Credential and Configuration Register

This register documents variable names, purpose, storage, and rotation without recording any credential value. Never paste secret values into this file, issues, commits, pull requests, screenshots, or chat.

## Storage rules

- Developer-only values belong in the ignored `.env.local` file.
- Production and Preview runtime values belong in the NounCompass Vercel project's encrypted Environment Variables store.
- Database-backup values belong only in the NounCompass GitHub repository's Actions secrets.
- Supabase SMTP credentials belong in Supabase Auth SMTP settings and, where the contact form needs them, Vercel or `.env.local`.
- Browser-safe variables with a `NEXT_PUBLIC_` prefix are intentionally included in client bundles. Their associated database access must still be protected by Row Level Security.
- Rotate a credential immediately if it appears in a commit, report, screenshot, terminal output, or chat.

## Supabase and application identity

| Variable | Sensitivity | Purpose | Approved stores | Rotation and validation |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public | Canonical application origin used for redirects and absolute URLs. | `.env.local`, Vercel | Keep aligned with Supabase Auth site URL and approved redirect URLs. |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | NounCompass Supabase Data API endpoint. | `.env.local`, Vercel | Update only when the project changes; validate the project reference before deployment. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-safe | Client key for Supabase requests governed by RLS. | `.env.local`, Vercel | Rotate in Supabase API Keys and update every runtime store; rerun RLS tests. |
| `SUPABASE_SERVICE_ROLE_KEY` | Critical secret | Server-only privileged Supabase access for protected server routes and jobs. | `.env.local`, Vercel | Never expose to client code. Rotate in Supabase, update runtime stores, then test admin and cron routes. |
| `INITIAL_SUPER_ADMIN_EMAIL` | Private configuration | Email eligible for the initial super-admin membership grant. | `.env.local`, Vercel | Use a verified, controlled mailbox. Change only through an audited ownership handover. |
| `FEATURE_ACCOUNTS` | Public configuration | Enables account registration and sign-in surfaces. | `.env.local`, Vercel | Disable during an auth incident. |
| `FEATURE_DASHBOARD` | Public configuration | Enables authenticated dashboard surfaces. | `.env.local`, Vercel | Enable only with Auth and RLS configured. |
| `FEATURE_EXAM_PREP` | Public configuration | Enables exam-prep surfaces; it does not publish draft question banks. | `.env.local`, Vercel | Keep banks in draft until editorial gates pass. |
| `FEATURE_CHECKOUT` | Public configuration | Enables paid checkout in test/local environments. Live mode is released by `FLUTTERWAVE_ENVIRONMENT=live`. | `.env.local`, Vercel | Keep Preview `false` unless running a controlled sandbox acceptance test. |
| `CHECKOUT_EMERGENCY_DISABLED` | Public configuration | Fail-closed override for every checkout environment. | `.env.local`, Vercel | Set `true` immediately during a payment incident; redeploy before investigating. |
| `FEATURE_ADMIN` | Public configuration | Enables protected administration surfaces. | `.env.local`, Vercel | Enable only with an authorized admin membership and RLS tests. |

## Brevo and support email

| Variable | Sensitivity | Purpose | Approved stores | Rotation and validation |
| --- | --- | --- | --- | --- |
| `BREVO_SMTP_HOST` | Configuration | Brevo SMTP relay hostname. | `.env.local`, Vercel, Supabase Auth SMTP | Verify against Brevo's SMTP settings. |
| `BREVO_SMTP_PORT` | Configuration | SMTP submission port. | `.env.local`, Vercel, Supabase Auth SMTP | Use the provider-supported TLS port. |
| `BREVO_SMTP_LOGIN` | Secret | Brevo SMTP account identifier. | `.env.local`, Vercel, Supabase Auth SMTP | Update all stores if regenerated. |
| `BREVO_SMTP_PASSWORD` | Critical secret | Brevo SMTP key/password. | `.env.local`, Vercel, Supabase Auth SMTP | Regenerate in Brevo if exposed, then update Supabase and Vercel. |
| `BREVO_API_KEY` | Critical secret | Server-only Brevo Contacts API key used to sync consented subscribers. | `.env.local`, Vercel | Never expose it through a `NEXT_PUBLIC_` variable. |
| `BREVO_NEWSLETTER_LIST_ID` | Configuration | Numeric Brevo list that receives consented website subscribers. | `.env.local`, Vercel | Use a dedicated NounCompass updates list. |
| `CONTACT_FORM_FROM` | Configuration | Verified sender used for support messages. | `.env.local`, Vercel | Must use a Brevo-verified sender on the authenticated domain. |
| `CONTACT_FORM_AUTOREPLY_FROM` | Configuration | Verified sender used for acknowledgement messages. | `.env.local`, Vercel | Keep aligned with the verified sender policy. |
| `CONTACT_FORM_TO` | Private configuration | Destination mailbox for support requests. | `.env.local`, Vercel | Confirm mailbox ownership and delivery after changes. |
| `CONTACT_FORM_RATE_LIMIT_WINDOW_MINUTES` | Configuration | Contact-form rate-limit window. | `.env.local`, Vercel | Tune only after reviewing abuse and false-positive logs. |
| `CONTACT_FORM_RATE_LIMIT_MAX` | Configuration | Maximum submissions in the configured window. | `.env.local`, Vercel | Keep conservative for abuse prevention. |
| `CONTACT_FORM_DUPLICATE_WINDOW_MINUTES` | Configuration | Duplicate-submission suppression window. | `.env.local`, Vercel | Test legitimate retry behavior after changes. |

## Flutterwave payment configuration

| Variable | Sensitivity | Purpose | Approved stores | Rotation and validation |
| --- | --- | --- | --- | --- |
| `FLUTTERWAVE_ENVIRONMENT` | Configuration | Requires the configured key to match `test` or `live` mode. | `.env.local`, Vercel | Keep Preview in `test`; Production may use `live` only with the matching live key and gated checkout. |
| `FLUTTERWAVE_SECRET_KEY` | Critical secret | Server-side Flutterwave Standard initialization and transaction verification. | `.env.local`, Vercel | Keep test and live keys separated by environment; rotate either key if exposed. |
| `FLUTTERWAVE_WEBHOOK_SECRET` | Critical secret | Validates Flutterwave webhook HMAC signatures. | `.env.local`, Vercel, Flutterwave Webhooks | Generate randomly, store the same value in both systems, and rotate if exposed. |
| `SEMESTER_PASS_AMOUNT_KOBO` | Configuration | Expected transaction amount in kobo. | `.env.local`, Vercel | Match product copy, server verification, refund policy, and acceptance tests. |
| `SEMESTER_PASS_DURATION_DAYS` | Configuration | Membership duration granted after verified payment. | `.env.local`, Vercel | Change only with product and legal approval. |

The NounCompass Flutterwave integration uses Flutterwave Standard. Its callback is `https://nouncompass.me/account/payment/callback` and its webhook is `https://nouncompass.me/api/webhooks/flutterwave`. Credentials belong only in approved encrypted stores; no values are recorded here.

`FLUTTERWAVE_ENVIRONMENT=live` is the explicit Production release signal and requires a matching live key plus webhook secret. `CHECKOUT_EMERGENCY_DISABLED=true` overrides both live mode and `FEATURE_CHECKOUT`. The previous Paystack businesses remain intact because deleting them is unnecessary and could destroy operational history.

## Scheduled operations and encrypted backups

| Variable or secret | Sensitivity | Purpose | Approved stores | Rotation and validation |
| --- | --- | --- | --- | --- |
| `CRON_SECRET` | Critical secret | Authenticates Vercel's request to `/api/cron/daily`. | `.env.local`, Vercel | Use at least 32 random bytes; rotate after suspected exposure and test unauthorized/authorized responses. |
| `SUPABASE_DB_URL` | Critical secret | Direct PostgreSQL connection used by the encrypted backup workflow. | GitHub Actions secret only | Obtain from Supabase database connection settings; rotate the database password if exposed. |
| `BACKUP_PASSPHRASE` | Critical secret | Encrypts and decrypts backup artifacts. | GitHub Actions secret and an owner-controlled password manager | Generate independently of database credentials. A lost passphrase makes backups unusable. |
| `RESTORE_DATABASE_URL` | Critical secret | Disposable destination used only for restore testing. | Local process environment or isolated CI secret | Never point it at production. Remove it after the restore test. |

## Existing SEO service credentials

| Variable | Sensitivity | Purpose | Approved stores | Rotation and validation |
| --- | --- | --- | --- | --- |
| `PAGESPEED_API_KEY` | Secret | PageSpeed Insights API access for audits. | `.env.local`, Vercel if runtime use is required | Restrict the key in Google Cloud and rotate if exposed. |
| `GOOGLE_CLIENT_EMAIL` | Private configuration | Google service-account identity for Search Console automation. | `.env.local`, Vercel if runtime use is required | Keep aligned with the service account granted access. |
| `GOOGLE_PRIVATE_KEY` | Critical secret | Google service-account signing key. | `.env.local`, Vercel if runtime use is required | Preserve newline formatting; revoke and replace the service-account key if exposed. |
| `GSC_SITE_URL` | Public configuration | Exact Search Console property identifier. | `.env.local`, Vercel if runtime use is required | Keep the trailing-slash form required by the configured URL-prefix property. |

## Current launch status (2026-07-19)

- Supabase project, migrations, Auth URLs, RLS defaults, and Brevo SMTP are configured on free tiers.
- The verified Brevo sender and authenticated `nouncompass.me` domain are active.
- Supabase application variables, feature flags, and a generated cron secret are stored in Vercel for Production and Preview.
- Flutterwave Standard is configured with fresh sandbox credentials in Vercel Preview and fresh live credentials in Vercel Production. Test and live webhook secrets are isolated in their matching environments.
- Flutterwave sandbox acceptance passed hosted checkout and direct server verification for a successful NGN 2,500 payment, local reference, currency, provider-signed customer and plan metadata, and transaction timestamp. Live mode additionally requires the provider customer email to match.
- The live Flutterwave API returned a hosted checkout successfully, and the controlled checkout inspection confirmed NGN 2,500 plus card, USSD, bank, bank-transfer, and eNaira options. The live webhook points to `https://nouncompass.me/api/webhooks/flutterwave`, with retries and V3 webhooks enabled.
- Vercel Production was redeployed after the live-variable update and is Ready/Current. No live charge or settlement test was made, because that would move real money and could incur provider fees.
- Live checkout was released by owner direction after sandbox acceptance and live initialization passed. No real charge was submitted during deployment validation.
- GitHub Actions holds the database URL and backup passphrase as encrypted repository secrets. The scheduled backup, encrypted artifact checksum, decryption, and disposable restore test have passed.
- The automated restore test does not expose the passphrase. The owner still needs a separate password-manager recovery copy before relying on manual, off-platform decryption.
- Authenticated sign-in, profile persistence, cross-user RLS isolation, public draft protection, payment-write denial, and admin-route denial passed with temporary users that were deleted after testing.
- Live validation passed Search Console connectivity, a 30-page crawl with no failed pages, and PageSpeed SEO and best-practices scores of 100 on mobile and desktop. Accessibility scored 100 mobile and 95 desktop; performance scored 75 mobile and 77 desktop and remains an improvement opportunity.
- Question banks remain draft; human review of all 500 questions is still required before publication.
- Legal owner approval remains required before checkout activation or policy-dependent launch decisions.

## Rotation checklist

1. Revoke or regenerate the exposed credential at its provider.
2. Update every approved store listed above without pasting the value into chat or source control.
3. Redeploy the application if Vercel variables changed.
4. Run the smallest relevant validation: Auth/RLS, email delivery, Flutterwave verification, cron authorization, backup/restore, or SEO audit.
5. Record the rotation date and result in an internal incident or operations log without recording the value.
