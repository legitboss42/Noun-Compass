# NounCompass administration dashboard

Last updated: 24 July 2026

## Purpose

The protected `/admin` area is the operations centre for accounts, roles,
memberships, Flutterwave payment review, question banks, filesystem MDX
articles, support, analytics, platform settings, schedules, and audit history.
It builds on the existing Next.js App Router and Supabase domains.

All admin pages are dynamic, noindex routes. Privileged Auth and database
operations run only in server components or server actions through the
server-only Supabase service-role client.

## Route map

| Route | Purpose |
| --- | --- |
| `/admin` | Permission-aware live operations overview |
| `/admin/users` | Paginated Supabase Auth and profile directory |
| `/admin/users/[user-id]` | Account, role, access, payments, practice, support, and audit detail |
| `/admin/memberships` | Search, filter, grant, extend, revoke, and restore access |
| `/admin/payments` | Paginated payment review and verification queue |
| `/admin/payments/[reference]` | Attempt, provider summary, event, activation, and audit detail |
| `/admin/questions` | Question-bank readiness, import, drafting, filters, and review queue |
| `/admin/questions/[question-id]` | Version editor, publication workflow, reports, and history |
| `/admin/articles` | Repository MDX inventory and validation |
| `/admin/support` | Prioritised, paginated ticket queue |
| `/admin/support/[ticket-id]` | Conversation, staff notes, assignment, status, and context |
| `/admin/analytics` | Database-backed users, revenue, practice, and support analytics |
| `/admin/settings` | Whitelisted non-secret platform settings |
| `/admin/schedules` | Existing versioned official timetable workflow |
| `/admin/audit-log` | Paginated sensitive-action history |

## Roles and permissions

The repository does not have a general `admin` role. Its actual role enum is:
`student`, `support_agent`, `content_editor`, `academic_reviewer`, and
`super_admin`.

| Capability | student | support_agent | content_editor | academic_reviewer | super_admin |
| --- | :---: | :---: | :---: | :---: | :---: |
| Admin access | No | Yes | Yes | Yes | Yes |
| Users read | No | Yes | No | No | Yes |
| Support manage | No | Yes | No | No | Yes |
| Questions write | No | No | Yes | Yes | Yes |
| Questions publish | No | No | No | Yes | Yes |
| Articles inspect | No | No | Yes | Yes | Yes |
| Schedules write | No | No | Yes | Yes | Yes |
| Schedules publish | No | No | No | Yes | Yes |
| Users/roles/memberships/payments | No | No | No | No | Yes |
| Analytics/settings/audit | No | No | No | No | Yes |

Navigation filtering is only a convenience. Every protected page and mutation
checks its permission again on the server.

## Required environment variables

Use the existing `.env.example`. Administration requires:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
INITIAL_SUPER_ADMIN_EMAIL
NEXT_PUBLIC_SITE_URL
```

Payment re-verification additionally requires the existing Flutterwave
variables. Recovery-email delivery uses the existing Supabase Auth email
configuration. Never prefix the service-role key with `NEXT_PUBLIC_`.

`LOCAL_PILOT` must remain `false` in production.

## Database setup and migrations

The dashboard depends on the additive migrations from
`202607200001_question_engine_integration.sql` through
`202607240004_admin_security.sql`.

For a linked Supabase CLI project:

```powershell
npx.cmd supabase login
npx.cmd supabase link --project-ref bkxujxtshrqxhwyhqtey
npx.cmd supabase db push
```

The current live project was updated through the Supabase SQL Editor, and the
SQL Editor did not expose a `supabase_migrations.schema_migrations` relation.
Before the first future `db push`, link the CLI, run `npx.cmd supabase migration
list`, and reconcile only the versions whose objects have been verified:

```powershell
npx.cmd supabase migration repair --status applied 202607200001
npx.cmd supabase migration repair --status applied 202607200002
npx.cmd supabase migration repair --status applied 202607240001
npx.cmd supabase migration repair --status applied 202607240002
npx.cmd supabase migration repair --status applied 202607240003
npx.cmd supabase migration repair --status applied 202607240004
```

Run the repair commands only after the linked CLI confirms the same production
project. They reconcile history; they do not execute migration SQL.

The migrations keep RLS enabled. They add server-only reporting/list RPCs,
manual-membership provenance, payment-review state, ticket priority/history,
whitelisted settings, expanded audit fields, admin indexes, and strict
staff-only internal support-note policies.

## Administrator bootstrap

1. Set `INITIAL_SUPER_ADMIN_EMAIL` to a verified account controlled by the
   platform owner.
2. Sign in with that exact address.
3. The existing bootstrap helper assigns the initial `super_admin` role.
4. Confirm the role in `public.user_roles`.
5. After another trusted super administrator exists, role changes should use
   the audited admin interface.

The interface prevents self-removal of the acting super administrator and
prevents removal of the final super administrator.

## User suspension

Suspension uses Supabase Auth ban state, not a second profile status. It blocks
sign-in without deleting the user or related operational history. Restore
removes the ban. Both actions require typed confirmation, a reason, and an
audit entry. Permanent deletion is intentionally not a normal admin action.

## Manual memberships

The Semester Pass plan remains sourced from `membership_plans`: NGN 2,500,
one payment, 180 days, no automatic renewal. A manual grant creates a
`memberships` row with `source = 'manual'`, an entitlement adjustment, the
administrator ID, and an audit entry. It never changes a payment record.

Extensions continue from the later of the current expiry or the current time.
Revocation ends access without deleting history. Restore grants a fresh plan
period when necessary.

## Payment review

Payment attempts cannot be manually marked successful. Review staff may:

1. Inspect the local attempt and webhook-event processing result.
2. Compare the safe provider summary and membership outcome.
3. Re-run server-side Flutterwave verification using the transaction ID.
4. Mark an attempt for manual review.
5. If verified payment access still needs remediation, grant access through the
   separate audited membership workflow.

The full provider payload is not rendered or copied into audit metadata.

## Support workflow

Tickets can be filtered by status, priority, category, and assignment.
Authorised support staff can assign tickets, change priority, make valid status
transitions, reply to the student, and add internal notes.

Internal notes are protected in both the UI and database policy: students
cannot select or insert a row where `internal_note = true`. Assignment,
priority, and status changes produce ticket-history and audit records.

## Article management

Articles remain filesystem MDX under `content/articles`. `/admin/articles`
lists and validates the real repository files, including required frontmatter,
draft state, images, and related slugs. It does not offer non-durable
serverless filesystem editing. See `docs/article-admin-limitations.md` for the
recommended GitHub pull-request workflow.

## Settings

Only `super_admin` can read or update settings. Application code whitelists the
allowed keys, and the database repeats the same key constraint. The UI cannot
create arbitrary keys and never displays environment secrets.

The checkout, free-diagnostic, question-report, and newsletter availability
flags are enforced in their server route handlers. They fail closed when set to
disabled. Any runtime feature also continues to fail safely when required
external configuration is absent. Environment emergency controls remain
authoritative.

## Deployment checklist

1. Review all migration SQL.
2. Reconcile and apply migration history.
3. Configure production environment variables without copying them into Git.
4. Keep `LOCAL_PILOT=false`.
5. Run `git diff --check`, lint, TypeScript, platform tests, and `npm run build`.
6. Sign in as each staff role and confirm allowed and denied routes.
7. Smoke-test one non-destructive list/filter flow per admin section.
8. Test sensitive mutations with dedicated test accounts and review audit rows.
9. Test Flutterwave verification only with a real known reference and
   transaction ID.
10. Confirm internal support notes cannot be read through a student session.

## Rollback guidance

Prefer application rollback over destructive schema rollback. The migrations
are additive, and older application code can ignore the new columns and tables.
If a release fails:

1. Redeploy the previous application version.
2. Disable affected feature access through existing deployment controls.
3. Preserve audit, payment, membership, support, and question history.
4. Diagnose and release a forward fix.

Do not drop columns, tables, version history, payment events, or audit logs as a
routine rollback.
