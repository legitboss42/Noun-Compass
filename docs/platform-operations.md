# NounCompass Platform Operations

Variable ownership, storage, sensitivity, and rotation are documented in [the credential register](./credential-register.md). That register intentionally contains no values.

## External setup required

1. Create the Supabase project and run migrations in `supabase/migrations` in filename order.
2. Configure Supabase custom SMTP with the existing Brevo sender and set the production redirect URLs.
3. Add the Supabase public URL/publishable key and server-only service-role key to Vercel.
4. Set `INITIAL_SUPER_ADMIN_EMAIL` to the verified owner account.
5. Configure Flutterwave sandbox credentials and signed webhooks. Keep `FEATURE_CHECKOUT=false` until every payment acceptance test and policy gate passes.
6. Add a random `CRON_SECRET` of at least 16 characters. Vercel invokes `/api/cron/daily` once daily.
7. Add `SUPABASE_DB_URL` and `BACKUP_PASSPHRASE` to GitHub Actions secrets and manually run the encrypted backup workflow once before relying on its schedule.

## Launch setup status (2026-07-19)

- Complete: Supabase organization/project on the Free plan, all three SQL migrations, Auth redirect URLs, email confirmation, automatic RLS defaults, and explicit least-privilege grants.
- Complete: Supabase custom SMTP using the verified Brevo sender and authenticated `nouncompass.me` domain.
- Complete: Supabase runtime variables, platform feature flags, and `CRON_SECRET` stored in Vercel Production and Preview environments.
- Complete: Flutterwave Standard replaced Paystack in application code, with fresh test credentials and a signed test webhook at `/api/webhooks/flutterwave`.
- Complete: Flutterwave sandbox hosted checkout and server verification passed for successful status, the exact NGN 2,500 amount, currency, local reference, provider-signed customer and plan metadata, and transaction timestamp. Live mode also requires an exact provider customer-email match.
- Complete: Flutterwave live credentials and a fresh live webhook secret are isolated in Vercel Production; sandbox credentials remain isolated in Preview. The live webhook URL is configured with retries and V3 webhooks enabled.
- Complete: live API initialization returned a Flutterwave-hosted checkout, and controlled inspection confirmed NGN 2,500 and the expected payment options. The post-configuration Production deployment is Ready/Current.
- Pending by design: no live settlement was submitted because a real transaction would move money and may incur Flutterwave fees. This does not weaken the completed sandbox transaction and server-verification acceptance test.
- Enforced: `FEATURE_CHECKOUT=false`; public live checkout is not enabled.
- Preserved: existing Paystack businesses remain intact; deleting provider history is unnecessary for the code migration.
- Complete: GitHub encrypted-backup secrets, encrypted artifact plus checksum, and an isolated PostgreSQL restore test using the latest successful backup.
- Complete: authenticated E2E covered sign-in, semester profile persistence, checkout-disabled state, and student denial from the admin surface. Temporary accounts were removed after testing.
- Complete: RLS checks covered own-profile access, cross-user isolation, anonymous and student draft-bank denial, public plan visibility, payment-attempt write denial, and membership-RPC denial.
- Complete: the live launch validator confirmed Search Console access, 95 sitemap URLs, healthy robots/sitemap responses, no failures in the 30-page crawl, PageSpeed SEO/best-practices scores of 100, and accessibility scores of 100 mobile and 95 desktop.
- Improve after launch: PageSpeed performance measured 75 mobile and 77 desktop. This is not blocking the gated free launch, but Core Web Vitals work should continue before increasing ad density.
- Non-delegable: human review of 500 questions and legal owner approval.

## Restore an encrypted backup

For the routine recovery test, manually run **Test encrypted Supabase restore** in GitHub Actions. It downloads the latest successful encrypted backup, validates its checksum, decrypts it with the repository secret, builds a disposable PostgreSQL schema from the committed migrations, restores the data, verifies launch-critical records, and destroys the test database with the runner.

For a manual off-platform restore, retrieve the passphrase from the owner-controlled password manager, download the Actions artifact through an authorized GitHub account, and use:

```powershell
$env:BACKUP_PASSPHRASE = "retrieve-from-password-manager"
openssl enc -d -aes-256-cbc -pbkdf2 -in nouncompass-TIMESTAMP.sql.gz.enc -out nouncompass.sql.gz -pass env:BACKUP_PASSPHRASE
gzip -d nouncompass.sql.gz
psql $env:RESTORE_DATABASE_URL -f nouncompass.sql
```

Never point `RESTORE_DATABASE_URL` at production. Never commit database URLs, passphrases, dumps, Flutterwave keys, or Supabase service-role keys.

## Release gates

- A question bank cannot be published until it has 100 published questions and 15 published sample questions.
- A schedule cannot be published without at least one validated row, an official source URL, checksum, and reviewer action.
- Payment activation requires a locally created reference plus Flutterwave verification of provider transaction ID, status, amount, currency, email, and transaction timestamp.
- Protected routes and API responses must remain `noindex` and outside the sitemap.
