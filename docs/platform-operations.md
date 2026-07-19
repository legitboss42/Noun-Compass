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

- A question bank cannot be released until it has at least 100 individually approved questions, including 15 approved sample questions, and every current question version has four options, exactly one correct answer, a source reference, and an explanation.
- A schedule cannot be published without at least one validated row, an official source URL, checksum, and reviewer action.
- Payment activation requires a locally created reference plus Flutterwave verification of provider transaction ID, status, amount, currency, email, and transaction timestamp.
- A successful verified callback shows the thank-you page and links to an authenticated receipt. The receipt is generated only from the account-owned successful payment and membership records and can be printed or saved as PDF by the browser.
- Protected routes and API responses must remain `noindex` and outside the sitemap.

## Exam-preparation content workflow

The student experience is now wired for randomized multiple-choice practice, a 40-minute timed mock, answer review with explanations, recent-score history, and five-box due revision. Course pages and the dashboard use only released banks and published timetable versions.

Editors can create a single question or bulk-import draft questions from [`/templates/question-import-template.csv`](/templates/question-import-template.csv). The CSV headers are:

```text
course_code,topic,learning_objective,difficulty,sample,source_unit,source_page,prompt,option_a,option_b,option_c,option_d,correct_label,explanation
```

Imports are validated as one batch and always remain drafts. The academic workflow is `draft -> review -> published -> retired`; each approval remains a deliberate reviewer action. Importing a CSV or satisfying a numeric threshold never approves academic content automatically.

Timetable imports likewise remain drafts until reviewed. Their source must use HTTPS and be hosted on `nou.edu.ng` or one of its subdomains. Invalid calendar dates, duplicate rows, empty schedules, missing checksums, and non-official source URLs are rejected.

Human academic review of every question and legal owner approval are still required before launch. `FEATURE_CHECKOUT=false` remains unchanged and is independent of question-bank readiness.

## Email subscriber collection

Run `202607190004_newsletter_subscribers.sql` before enabling the homepage signup in production. The endpoint stores explicit consent in Supabase and then uses `BREVO_API_KEY` plus `BREVO_NEWSLETTER_LIST_ID` to add or update the address in a dedicated Brevo contact list. SMTP credentials cannot replace the Contacts API key.

If Brevo is temporarily unavailable, the Supabase record remains with an empty `brevo_synced_at` value for a later retry. Do not send marketing campaigns until the owner has approved the content, sender identity, unsubscribe behavior, and audience.
