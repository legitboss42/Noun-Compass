# Re-engagement Email for Inactive Signed-Up Users — Design

**Date:** 2026-08-10
**Status:** Approved for planning
**Author:** Victor Chinukwue (with Claude)

## Problem

Users sign up and verify their email, but a portion never take any action on the
platform (no tools used, no practice, no study plan). With exams approaching, we
want to automatically remind these inactive users to start studying, via email,
with a compliant one-click unsubscribe.

## Goal

Automatically email verified-but-inactive users a re-engagement nudge, on a
repeatable cadence with a cooldown, reusing the existing Brevo SMTP send path and
matching the visual style of the current Supabase auth (confirmation/reset)
email. Provide a real, one-click unsubscribe that persists to the database.

## Decisions (locked)

| Question | Decision |
|---|---|
| Audience | Signed-up + verified + inactive users who have **not** explicitly opted out (choice #3). |
| Send method | In-app send via existing Brevo **SMTP** transport (nodemailer), not the Brevo campaign UI or API. |
| Trigger | Fully automatic inside the existing daily cron (`/api/cron/daily`, `0 5 * * *`). |
| Cadence | Repeatable with a cooldown (default 14 days) — a still-inactive user can be nudged again after the cooldown. |
| Template | Reuse the shell of the current Supabase auth email (dark theme, green `#18a558`, amber `#f0b429`). |
| Settings toggle | Out of scope for v1 — no account preferences UI exists yet. Unsubscribe link is the opt-out mechanism. |

## Non-Goals (YAGNI)

- No browser automation (the original idea; unnecessary for a server-side job).
- No Brevo campaign UI / Brevo contacts API for this send.
- No admin dashboard button or preview screen.
- No per-user exam-date personalization — generic "exams are approaching" copy for v1.
- No account-settings preferences page (future work).
- No retrofit of existing emails (contact auto-reply, study reminder) onto the new
  shared layout in v1 — the shared helper is built so this is easy later, but not done now.

## Audience Definition

A user is a **candidate** when ALL of these hold:

1. **Email verified** — `auth.users.email_confirmed_at is not null`.
2. **Aged past grace window** — `auth.users.created_at <= now() - REENGAGEMENT_GRACE_DAYS` (default 3 days).
3. **Opted in (not opted out)** — `email_preferences.reengagement_reminders = true` (new column, defaults `true`).
4. **No activity** — the user has zero rows in ALL of:
   - `public.user_tool_activity`
   - `public.practice_sessions`
   - `public.ai_practice_sessions`
   - `public.study_plans`
5. **Not nudged within cooldown** — no `public.notifications` row with `kind = 'reengagement'`
   and `emailed_at >= now() - REENGAGEMENT_COOLDOWN_DAYS` (default 14) for that user.

**Activity bar (explicitly agreed):** completing onboarding (`profiles.onboarding_completed_at`)
does NOT count as activity. An onboarded-but-never-practiced user is still a candidate.

## Architecture

### 1. Migration — `supabase/migrations/2026081000XX_reengagement_reminders.sql`

- Add opt-out column, backfilling all existing users to `true` (consistent with the other
  reminder flags, which all default `true`):
  ```sql
  alter table public.email_preferences
    add column if not exists reengagement_reminders boolean not null default true;
  ```
- Add a `security definer` selection function, granted to `service_role` only (matches the
  locked-down RPC pattern in `202607290002_lock_down_security_definer_rpc.sql`):
  ```sql
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
  (Final table/column names verified against migrations during planning; `study_plans` is the
  parent table for the study planner — see `202607240005`.)

### 2. Shared email layout — `lib/email-layout.ts`

- Export a pure function:
  ```ts
  renderBrandedEmail(input: {
    preheader: string;
    eyebrow: string;        // e.g. "YOUR EXAMS ARE COMING"
    heading: string;        // supports one highlighted span
    bodyHtml: string;       // paragraphs
    cta: { label: string; url: string };
    noteHtml?: string;      // the boxed "security note" style callout
    unsubscribeUrl?: string;
  }): { html: string; text: string }
  ```
- HTML is the pasted auth-template shell with the `{{ .ConfirmationURL }}` / `{{ .Email }}`
  Supabase tokens removed and replaced by real interpolated values. Static shell preserved:
  dark background `#07111f`, card `#0d1b2a`, green bar/button `#18a558`, amber highlight
  `#f0b429`, logo, social row, footer disclaimer.
- **Footer link fix:** template's `/privacy` → use the real route `/privacy-policy`.
- When `unsubscribeUrl` is present, render an unsubscribe line in the footer.
- Also produces a plain-text alternative (headline, body, CTA URL, unsubscribe URL).
- All user-provided values HTML-escaped (reuse an escape helper like `contact-mail.ts`).

### 3. Re-engagement copy — `lib/platform/reengagement-email-core.ts` (pure)

- Export `buildReengagementEmail({ displayName, ctaUrl, unsubscribeUrl })` returning
  `{ subject, html, text }` by calling `renderBrandedEmail(...)`.
- Copy theme: "You signed up but haven't started — exams are approaching." Friendly, one CTA
  to the dashboard/practice. Uses `displayName` with a graceful fallback ("there").
- Pure and dependency-free so it is unit-testable.

### 4. Send function — `lib/contact-mail.ts`

- Add `sendReengagementEmail({ to, displayName, unsubscribeUrl })`:
  - Reuse `createTransporter()` (Brevo SMTP).
  - Build content via `buildReengagementEmail(...)`.
  - From address: reuse `CONTACT_FORM_AUTOREPLY_FROM` / `CONTACT_FORM_FROM` fallback chain.
  - Set deliverability headers:
    - `List-Unsubscribe: <mailto:...?subject=unsubscribe>, <UNSUB_URL>`
    - `List-Unsubscribe-Post: List-Unsubscribe=One-Click` (RFC 8058)

### 5. Email link signing — `lib/email-links.ts` (pure)

- `signEmailToken(userId, purpose)` and `verifyEmailToken(token, purpose)`.
- Token = `base64url(payload) + "." + base64url(hmacSHA256(payload, secret))`, where
  `payload = "<purpose>:<userId>"`.
- Secret from `EMAIL_LINK_SECRET`, falling back to `SUPABASE_SERVICE_ROLE_KEY` (no new required env).
- Constant-time comparison; reject tampered/foreign tokens. Pure and unit-testable.

### 6. Unsubscribe route — `app/api/email/unsubscribe/route.ts`

- **GET** (`?token=...&purpose=reengagement`): verify token → service-role update
  `email_preferences.reengagement_reminders = false` for that `user_id` → render a simple
  branded confirmation HTML page ("You've been unsubscribed from study reminder emails").
  Invalid/expired token → neutral message, HTTP 200 (no user enumeration).
- **POST** (one-click, RFC 8058): same effect, returns HTTP 200, no body required.
- Uses `createAdminClient()`; if unavailable, returns a friendly 503 page.

### 7. Cron integration — `app/api/cron/daily/route.ts`

- New guarded block after the subscriber-sync block, before writing `cron_runs.details`.
- Guard: `REENGAGEMENT_ENABLED !== 'false'` (default on).
- Steps:
  1. Read env: `REENGAGEMENT_GRACE_DAYS` (3), `REENGAGEMENT_COOLDOWN_DAYS` (14),
     `REENGAGEMENT_BATCH_LIMIT` (100).
  2. `admin.rpc('select_reengagement_candidates', { p_grace_days, p_cooldown_days, p_limit })`.
  3. For each candidate:
     - Build `unsubscribeUrl = ${SITE_URL}/api/email/unsubscribe?purpose=reengagement&token=<signed>`.
     - `sendReengagementEmail(...)` inside try/catch (one failure must not abort the run).
     - On success, insert a `notifications` row:
       `kind:'reengagement'`, `title`, `body`, `action_url:'/dashboard/practice'`,
       `dedupe_key: reengagement:<run_date>`, then set `emailed_at = now()`.
       (`unique (user_id, dedupe_key)` makes the per-run insert idempotent; the cooldown check
       in the RPC prevents re-sending across runs.)
  4. Fold counts into `cron_runs.details`:
     `reengagementCandidates`, `reengagementEmailed`, `reengagementFailed`.
- Batch cap keeps us well under Brevo's daily send limit; overflow simply drains on
  subsequent daily runs (ordered oldest-signup first).

## Data Flow

```
daily cron (0 5 * * *)
  └─ rpc select_reengagement_candidates(grace, cooldown, limit)   [service_role, SQL]
       └─ for each candidate:
            ├─ signEmailToken(userId, 'reengagement')            [lib/email-links]
            ├─ buildReengagementEmail(...)                       [reengagement-email-core]
            │     └─ renderBrandedEmail(...)                     [email-layout]
            ├─ sendReengagementEmail(...) via Brevo SMTP         [contact-mail]
            └─ insert notifications row + set emailed_at         [dedupe + cooldown anchor]

user clicks unsubscribe → GET/POST /api/email/unsubscribe
  └─ verifyEmailToken → set email_preferences.reengagement_reminders = false
```

## Error Handling

- **Per-send isolation:** each email in its own try/catch; failures increment
  `reengagementFailed` and continue. Matches the study-reminder block's resilience.
- **SMTP not configured:** `createTransporter()` throws → caught per-send; run still records counts.
- **RPC/DB failure:** bubbles to the existing outer try/catch, which marks the `cron_run` failed.
- **Invalid unsubscribe token:** neutral 200 response, no enumeration, no state change.
- **Idempotency:** `unique (user_id, dedupe_key)` on `notifications` prevents double-send within
  a run; the cooldown `NOT EXISTS` prevents re-send across runs.

## Testing

Node test runner via the existing `test:platform` script (`tsx --test tests/platform/*.test.ts`).
**All test files MUST live in `tests/platform/`** — the script globs only that directory, so
tests placed elsewhere silently never run.

1. `tests/platform/email-links.test.ts` — sign/verify roundtrip; reject tampered signature;
   reject wrong purpose; reject foreign userId.
2. `tests/platform/reengagement-email-core.test.ts` — subject present; unsubscribe URL rendered
   in html + text; display-name fallback when empty; user input escaped.
3. `tests/platform/email-layout.test.ts` — no residual `{{ }}` tokens; `/privacy-policy` used
   (not `/privacy`); CTA url present; preheader present.
4. `tests/platform/reengagement-cron.test.ts` — with a mocked admin client: respects batch cap,
   skips/continues on send error (counts correct), inserts notification with correct dedupe_key
   and sets `emailed_at`, and honors the `REENGAGEMENT_ENABLED=false` guard.

RPC candidate logic validated by a checked-in SQL sanity query in the migration comments and a
manual verification before enabling in production.

## Configuration (env)

| Var | Default | Purpose |
|---|---|---|
| `REENGAGEMENT_ENABLED` | `true` | Master switch for the cron block. |
| `REENGAGEMENT_GRACE_DAYS` | `3` | Min account age before first nudge. |
| `REENGAGEMENT_COOLDOWN_DAYS` | `14` | Min gap between nudges to the same user. |
| `REENGAGEMENT_BATCH_LIMIT` | `100` | Max emails per daily run. |
| `EMAIL_LINK_SECRET` | (falls back to `SUPABASE_SERVICE_ROLE_KEY`) | HMAC secret for unsubscribe tokens. |

Reuses existing: `BREVO_SMTP_*`, `CONTACT_FORM_FROM` / `CONTACT_FORM_AUTOREPLY_FROM`,
`NEXT_PUBLIC_SITE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`.

## Files Touched

**New**
- `supabase/migrations/2026081000XX_reengagement_reminders.sql`
- `lib/email-layout.ts`
- `lib/email-links.ts`
- `lib/platform/reengagement-email-core.ts`
- `app/api/email/unsubscribe/route.ts`
- `tests/platform/email-links.test.ts`
- `tests/platform/email-layout.test.ts`
- `tests/platform/reengagement-email-core.test.ts`
- `tests/platform/reengagement-cron.test.ts`

**Modified**
- `lib/contact-mail.ts` — add `sendReengagementEmail(...)`.
- `app/api/cron/daily/route.ts` — add guarded re-engagement block + details counts.

## Known Follow-ups (not in v1)

- Retrofit contact auto-reply + study-reminder emails onto `renderBrandedEmail`.
- Build an account email-preferences settings page with a `reengagement_reminders` toggle.
- Fix the live Supabase auth template's `/privacy` → `/privacy-policy` link.
- Optional: personalize with the user's next exam date.
