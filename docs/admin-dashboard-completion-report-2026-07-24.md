# NounCompass admin dashboard completion report

Date: 24 July 2026
Repository: `C:\Users\vicky\Desktop\Web Growth\Noun-Compass`

## 1. Summary

The repository now contains a production-built, permission-aware admin
operations dashboard for:

- users and Supabase Auth account state
- roles and role-safety rules
- Semester Pass memberships and manual entitlement adjustments
- Flutterwave payment review and safe re-verification
- question banks, versions, editorial workflow, and student reports
- filesystem MDX article inventory and validation
- support tickets, replies, private internal notes, assignment, and history
- database-backed user, revenue, practice, and support analytics
- constrained non-secret platform settings
- schedules and append-only audit history

The existing App Router, Supabase helpers, Auth model, payment verification,
question engine, filesystem articles, routes, and design system were retained.

## 2. Routes created or changed

Created or completed:

- `/admin`
- `/admin/users`
- `/admin/users/[user-id]`
- `/admin/memberships`
- `/admin/payments`
- `/admin/payments/[reference]`
- `/admin/questions`
- `/admin/questions/[question-id]`
- `/admin/articles`
- `/admin/support`
- `/admin/support/[ticket-id]`
- `/admin/analytics`
- `/admin/settings`
- `/admin/audit-log`

Integrated and protected:

- `/admin/schedules`
- `/admin/[section]`, now restricted to the remaining academic-term and notice
  inventory instead of providing generic bypasses to dedicated admin routes

Availability settings are enforced by:

- `/api/checkout/initialize`
- `/api/newsletter`
- `/api/practice/sessions`
- `/api/question-reports`

## 3. Components and server utilities

Added reusable admin UI for:

- breadcrumbs
- page headings
- stat cards
- server-rendered data tables
- pagination
- search and filter forms
- status badges
- confirmation fields
- empty, loading, error, success, and failure states
- accessible metric bars with text summaries
- file-path copy feedback

Added server-only operations utilities for:

- permission calculation and route/action enforcement
- administrator session resolution
- date and currency formatting
- confirmation, reason, transition, and extension rules
- sanitised audit logging
- MDX article inspection
- constrained setting parsing
- runtime availability flags

## 4. Server actions

Implemented or hardened actions for:

- role assignment and removal
- account suspension and restoration
- password-recovery email requests
- membership grant, extension, revocation, and restoration
- payment re-verification and manual-review marking
- question creation, CSV import, version creation, review, publication,
  retirement, change requests, and report resolution
- schedule import and publication
- support assignment, priority, status, reply, and private-note operations
- whitelisted platform-setting changes

Every action that changes privileged operational state rechecks its permission
on the server. Sensitive state changes write audit records. Access-reducing or
otherwise destructive actions use typed confirmation and a reason.

## 5. Migrations added and live status

Added:

- `202607240001_admin_operations.sql`
- `202607240002_admin_metrics.sql`
- `202607240003_admin_lists.sql`
- `202607240004_admin_security.sql`

Also applied the previously pending:

- `202607200001_question_engine_integration.sql`
- `202607200002_service_role_payment_privileges.sql`

All six migrations were applied to the live NounCompass Supabase project through
the controlled Chrome SQL Editor session.

Live verification confirmed:

- the server-only user, membership, payment, and support list functions execute
- overview and analytics functions return JSON objects
- question bookmarks and question reports exist
- platform settings and support history exist
- membership provenance and payment-review fields exist
- audit reason fields exist
- internal-note SELECT and INSERT policies are staff-only

The SQL Editor did not expose a `supabase_migrations.schema_migrations` relation.
The SQL is live, but CLI migration history must be reconciled before the first
future `supabase db push`.

## 6. RLS changes

RLS remains enabled and restrictive.

The final security migration replaces the support-message policies so:

- a student can read only non-internal messages on their own ticket
- a student cannot insert an internal note
- authorised staff can read and create internal notes
- service-role access remains isolated to trusted server code

Platform settings are constrained at both the application and database levels.
No UI can create arbitrary environment-style keys.

## 7. Permission matrix

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

The actual repository has no general `admin` role. Broad administrator
operations therefore belong to `super_admin`.

## 8. Tests added

Added unit coverage for:

- student and staff permission boundaries
- editor and reviewer scope
- elevated-role assignment
- super-admin access
- membership extension and expiry handling
- confirmation and reason validation
- self-lockout and final-super-admin protection
- question publication transitions
- support status transitions
- setting-key allowlisting
- boolean and email setting parsing

Result: 52 platform tests passed, 0 failed.

## 9. Commands run

```powershell
git diff --check
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run test:platform
npm.cmd run build
```

## 10. Validation result

- Git diff check: passed; only Windows line-ending notices
- ESLint: passed with 0 errors and one pre-existing unused-parameter warning in
  `scripts/seo-audit/search-console.mjs`
- TypeScript: passed
- Platform tests: 52 passed
- Next.js production build: passed
- Static generation: 125 pages generated
- Admin routes: compiled as dynamic server-rendered routes

## 11. Live backend snapshot

The final live query smoke test returned:

- 2 Auth users through the admin user RPC
- 2 payment attempts through the admin payment RPC
- 0 membership rows
- 0 support tickets
- 0 platform-setting overrides
- valid overview JSON
- valid analytics JSON

Earlier live inspection in the same migration session confirmed 5 question
banks and no published questions, question reports, support tickets, active
memberships, verified revenue, or audit rows at that time. The dashboard does
not invent values for empty domains.

## 11A. Live environment, migration-history, and role smoke follow-up

Completed through the controlled Chrome session on 24 July 2026:

- Added the four required Supabase values to the ignored local `.env.local`.
- Updated the same four variables in Vercel for Production and Preview:
  `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, and
  `INITIAL_SUPER_ADMIN_EMAIL`.
- Deployed the completed repository changes and confirmed the new production
  build is `Ready` on `nouncompass.me`.
- Linked the Supabase CLI to project `bkxujxtshrqxhwyhqtey`.
- Repaired and verified the six documented migration-history versions:
  `202607200001`, `202607200002`, `202607240001`, `202607240002`,
  `202607240003`, and `202607240004`.
- Revoked the temporary Supabase CLI access token and removed its temporary
  local transfer file after verification.
- Created five dedicated synthetic production accounts to test each role in
  isolation. Their creation and cleanup were written to `audit_logs`, all five
  accounts were removed after the tests, and the owner session was restored
  with `student` and `super_admin`.
- Replaced the raw `forbidden` authorization code on the student dashboard with
  the accessible message, “You don’t have permission to view that page.”

Signed-in production results:

| Role | Expected allowed route | Result | Expected denied route | Result |
| --- | --- | --- | --- | --- |
| `student` | `/dashboard` | Pass | `/admin` | Pass |
| `support_agent` | `/admin`, `/admin/support` | Pass | `/admin/payments` | Pass |
| `content_editor` | `/admin/questions` | Pass | `/admin/payments`, `/admin/users` | Pass |
| `academic_reviewer` | `/admin/questions` | Pass | `/admin/users`, `/admin/payments`, `/admin/settings` | Pass |
| `super_admin` | `/admin/users`, `/admin/payments`, `/admin/settings`, `/admin/analytics` | Pass | Not applicable | Pass |

Permission-aware navigation was also verified for support, editor, reviewer,
and super-admin sessions. No restricted link was exposed in the tested
lower-privilege sidebars.

Final live counts after synthetic-account cleanup:

- 2 Supabase Auth users
- 2 profiles
- 3 role assignments
- 0 memberships
- 2 payment attempts
- 0 support tickets
- 0 question reports
- 14 audit-log entries
- 0 platform-setting overrides
- 0 remaining synthetic smoke-test accounts

## 12. Remaining limitations

- The four earlier local-only history entries (`202607190001` through
  `202607190004`) remain unreconciled because they were not included in the
  documented, live-verified repair set. Their SQL state must be independently
  proven before marking them applied.
- MDX editing remains repository-based. A durable browser editor requires the
  documented future GitHub pull-request integration.
- Public platform-name, support/contact email, term, notice, and membership
  visibility settings are stored safely but are not all consumed throughout
  the public interface. Checkout, diagnostic, question-report, and newsletter
  availability are enforced now.

## 13. Manual deployment steps

The approved release, variable update, migration-history repair, deployment,
and staff-role smoke matrix are complete.

Before granting real staff access:

1. Assign only the minimum role required for each staff member.
2. Test sensitive actions with dedicated records and inspect their audit rows.
3. Verify internal support notes through both a staff and a student session.
4. Independently prove the SQL state of the four older local-only migrations
   before reconciling those ledger versions.

## 14. Environment-variable changes required

The following values are configured locally and in Vercel Production and
Preview:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
INITIAL_SUPER_ADMIN_EMAIL
```

Keep the existing `NEXT_PUBLIC_SITE_URL`, Flutterwave variables for payment
re-verification, and Supabase Auth email configuration for recovery links.

Do not prefix `SUPABASE_SERVICE_ROLE_KEY` with `NEXT_PUBLIC_`. Do not commit
`.env.local`.

## 15. Exact migration-history commands

After confirming the linked project:

```powershell
npx.cmd supabase login
npx.cmd supabase link --project-ref bkxujxtshrqxhwyhqtey
npx.cmd supabase migration list
npx.cmd supabase migration repair --status applied 202607200001
npx.cmd supabase migration repair --status applied 202607200002
npx.cmd supabase migration repair --status applied 202607240001
npx.cmd supabase migration repair --status applied 202607240002
npx.cmd supabase migration repair --status applied 202607240003
npx.cmd supabase migration repair --status applied 202607240004
```

The repair commands reconcile history only. The migration SQL is already
applied live.

## 16. Release and review record

The complete sitewide and admin change set was committed and pushed as:

- `19115d1` — `Build sitewide redesign and secure admin operations`
- `c09282a` — `Humanize forbidden dashboard notice`

High-risk files reviewed in the release include:

- `lib/platform/admin-permissions.ts`
- `lib/platform/admin-auth.ts`
- `lib/platform/audit.ts`
- `lib/platform/admin-workflows.ts`
- `app/admin/users/actions.ts`
- `app/admin/memberships/actions.ts`
- `app/admin/payments/actions.ts`
- `app/admin/questions/actions.ts`
- `app/admin/support/actions.ts`
- `app/admin/settings/actions.ts`
- all four `20260724000*_*.sql` migrations
- `docs/admin-dashboard.md`
- `docs/article-admin-limitations.md`

The user's earlier sitewide redesign changes were preserved and included in the
approved release. Production deployment and signed-in verification were
completed through the controlled Chrome session.
