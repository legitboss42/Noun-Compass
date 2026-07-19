# NounCompass Platform Operations

Variable ownership, storage, sensitivity, and rotation are documented in [the credential register](./credential-register.md). That register intentionally contains no values.

## External setup required

1. Create the Supabase project and run migrations in `supabase/migrations` in filename order.
2. Configure Supabase custom SMTP with the existing Brevo sender and set the production redirect URLs.
3. Add the Supabase public URL/publishable key and server-only service-role key to Vercel.
4. Set `INITIAL_SUPER_ADMIN_EMAIL` to the verified owner account.
5. Configure Paystack test keys. Keep `FEATURE_CHECKOUT=false` until every payment acceptance test and policy gate passes.
6. Add a random `CRON_SECRET` of at least 16 characters. Vercel invokes `/api/cron/daily` once daily.
7. Add `SUPABASE_DB_URL` and `BACKUP_PASSPHRASE` to GitHub Actions secrets and manually run the encrypted backup workflow once before relying on its schedule.

## Launch setup status (2026-07-19)

- Complete: Supabase organization/project on the Free plan, both SQL migrations, Auth redirect URLs, email confirmation, and automatic RLS defaults.
- Complete: Supabase custom SMTP using the verified Brevo sender and authenticated `nouncompass.me` domain.
- Complete: Supabase runtime variables, platform feature flags, and `CRON_SECRET` stored in Vercel Production and Preview environments.
- Enforced: `FEATURE_CHECKOUT=false`; live checkout is not enabled.
- Pending: Paystack test-mode keys and acceptance tests.
- Pending: GitHub encrypted-backup secrets and a disposable restore test.
- Pending: authenticated E2E, RLS/security, accessibility, and live SEO validation after deployment.
- Non-delegable: human review of 500 questions and legal owner approval.

## Restore an encrypted backup

Download the Actions artifact through an authorized GitHub account, then decrypt and restore outside the repository:

```powershell
$env:BACKUP_PASSPHRASE = "retrieve-from-password-manager"
openssl enc -d -aes-256-cbc -pbkdf2 -in nouncompass-TIMESTAMP.sql.gz.enc -out nouncompass.sql.gz -pass env:BACKUP_PASSPHRASE
gzip -d nouncompass.sql.gz
psql $env:RESTORE_DATABASE_URL -f nouncompass.sql
```

Test restoration against a non-production database. Never commit database URLs, passphrases, dumps, Paystack keys, or Supabase service-role keys.

## Release gates

- A question bank cannot be published until it has 100 published questions and 15 published sample questions.
- A schedule cannot be published without at least one validated row, an official source URL, checksum, and reviewer action.
- Payment activation requires a locally created reference plus Paystack verification of status, amount, currency, email, and paid timestamp.
- Protected routes and API responses must remain `noindex` and outside the sitemap.
