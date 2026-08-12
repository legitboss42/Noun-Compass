# NounCompass outbound email

Every non-transactional email NounCompass sends, what turns it on, and how a
student stops it.

## What we send

| Email | Trigger | Consent | Unsubscribe scope |
|---|---|---|---|
| Contact auto-reply | The student messaged us | Transactional | None — they wrote to us |
| Study session reminder | A session they scheduled is due | `email_preferences.study_reminders` (default true) | `all` |
| Re-engagement nudge | Signed up, verified, never used a tool | `email_preferences.reengagement_reminders` (default true) | `reengagement` |
| Membership expiry | Their own pass is ending | Transactional | None |

Account, payment, and membership mail is not marketing and is not covered by
unsubscribe. Everything else is.

## Unsubscribe

`/unsubscribe` (page) and `/api/unsubscribe` (RFC 8058 one-click POST).

Three properties worth preserving if this is ever touched:

1. **GET never acts.** Corporate mail scanners and link previewers fetch every
   URL in a message. Acting on GET would silence students who never clicked.
   The page confirms; the button POSTs.
2. **The token is signed over address *and* scope.** A link cannot be replayed
   to silence a different address, and a `reengagement` link cannot be escalated
   to stop every email.
3. **Known and unknown addresses get identical responses.** The endpoint cannot
   be used to test which emails have accounts.

Consent lives in two tables and an unsubscribe clears both:
`newsletter_subscribers` (addresses with no account) and `email_preferences`
(registered students).

Set `UNSUBSCRIBE_SECRET` in production. Without it links are signed with
`SUPABASE_SERVICE_ROLE_KEY`, which works, but rotating the service role would
invalidate every link already sent.

## Re-engagement nudge

Off by default. It only runs when `REENGAGEMENT_ENABLED` is exactly `"true"` —
this is the one job that emails people who did not ask for anything, so it does
not start on deploy.

A student is a candidate when all of these hold:

- Email verified.
- Account older than `REENGAGEMENT_GRACE_DAYS` (default 3).
- `reengagement_reminders` still true.
- Zero rows in `user_tool_activity`, `practice_sessions`,
  `ai_practice_sessions`, and `study_plans`.
- Not nudged in the last `REENGAGEMENT_COOLDOWN_DAYS` (default 14).

Completing onboarding does **not** count as activity. Someone who filled in
their programme and never opened a tool is exactly the target.

Selection is `public.select_reengagement_candidates(grace, cooldown, limit)`,
`security definer` and granted to `service_role` only.

### Before turning it on

1. Apply `supabase/migrations/202608100002_reengagement_reminders.sql`.
2. Count who would receive it:
   ```sql
   select count(*) from public.select_reengagement_candidates(3, 14, 500);
   ```
3. Render a local preview first (this sends nothing):
   ```bash
   npx tsx scripts/marketing/reengagement-preview.mjs
   ```
4. After owner review, test-send one controlled address with `--send you@example.com`, then click the unsubscribe link and confirm it lands on
   `/unsubscribe` and completes.
5. Only then set `REENGAGEMENT_ENABLED=true` in Vercel.

`REENGAGEMENT_BATCH_LIMIT` (default 50) caps sends per daily run. Overflow
drains on later runs, oldest signup first.

### Idempotency

The `notifications` row is written *before* the send, and `unique (user_id,
dedupe_key)` on `reengagement:<run_date>` is what stops a retried run from
emailing twice. `emailed_at` is set only after delivery, so a row without it
means the send failed — the cooldown never started and that student is picked
up on the next run.

## Environment

| Var | Default | Purpose |
|---|---|---|
| `REENGAGEMENT_ENABLED` | off | Must be exactly `"true"` to send |
| `REENGAGEMENT_GRACE_DAYS` | `3` | Minimum account age |
| `REENGAGEMENT_COOLDOWN_DAYS` | `14` | Minimum gap between nudges |
| `REENGAGEMENT_BATCH_LIMIT` | `50` | Max sends per daily run |
| `UNSUBSCRIBE_SECRET` | service-role key | HMAC secret for unsubscribe links |

Reuses `BREVO_SMTP_*`, `CONTACT_FORM_FROM` / `CONTACT_FORM_AUTOREPLY_FROM`,
`NEXT_PUBLIC_SITE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`.

## Known gaps

- Local preview and automated HTML/text/header tests do not prove an owner send, Brevo inbox/logs, notification row, or cron execution. Those remain manual checks before `REENGAGEMENT_ENABLED=true` is set in Vercel.
- No account email-preferences page. The unsubscribe link is the only opt-out
  surface, which is why it has to keep working.
- The contact auto-reply and study reminder do not use `renderBrandedEmail` yet.
- The live Supabase auth template links `/privacy`, which 404s. The real route
  is `/privacy-policy`. Fix it in the Supabase dashboard.
