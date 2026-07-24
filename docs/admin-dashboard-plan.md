# NounCompass Admin Operations Dashboard Plan

Last audited: 24 July 2026

## Existing resources to reuse

- Next.js App Router routes under `app/admin`, with protected layouts and server actions.
- Supabase browser, server-session, and service-role helpers under `lib/supabase`.
- `requireUser()`, `getUserRoles()`, and `requireRole()` in `lib/platform/auth.ts`.
- The actual role enum: `student`, `support_agent`, `content_editor`, `academic_reviewer`, and `super_admin`.
- `INITIAL_SUPER_ADMIN_EMAIL` as the bootstrap-only super-admin fallback.
- Existing tables for profiles, roles, plans, memberships, payment attempts/events, entitlement adjustments, question banks, questions, versions, options, reports, practice sessions, support tickets/messages, content reviews, notifications, and audit logs.
- Existing question creation, CSV import, review, publication, and schedule-import workflows.
- Existing Flutterwave verification and `activate_semester_pass` database function.
- Existing filesystem MDX loader in `lib/articles.ts`.
- Existing platform visual language in `app/sitewide.css` and the current global NounCompass shell.
- Existing Node test runner (`tsx --test`) and platform tests.

## Confirmed schema and product constraints

- Profiles contain display name, programme, level, semester, entry mode, study centre, exam mode, selected courses, study days, and timestamps. They do not contain faculty or phone.
- Supabase Auth remains the source of truth for email, providers, confirmation, signup, last sign-in, and ban state.
- The current membership row requires a unique payment reference. A nullable reference plus an explicit source is needed for audited manual grants.
- The current Semester Pass is stored in `membership_plans` and configured as NGN 2,500 for 180 days.
- Payment events intentionally retain hashes and processing state, not full secret-bearing webhook payloads.
- Support tickets already had assignment and an internal-message flag. Priority
  and explicit status history were missing, and the original message policy did
  not sufficiently prevent a student from reading or creating an internal-note
  row. The admin security migration closes that policy gap.
- Question workflow values are `draft`, `review`, `published`, and `retired`; reports use `open`, `reviewing`, `resolved`, and `dismissed`.
- Articles are repository-backed MDX files. Production serverless filesystem editing is not durable and will not be presented as an editor.
- Database activity supports operational analytics. Client-side Google Analytics is not suitable for privileged user-level reporting.

## Routes

| Route | Purpose | Minimum permission |
| --- | --- | --- |
| `/admin` | Operations overview and current work | overview read |
| `/admin/users` | Paginated identity/profile directory | users read |
| `/admin/users/[user-id]` | User, access, payments, practice, support, and audit detail | users read |
| `/admin/memberships` | Membership listing and manual access adjustments | memberships read/write |
| `/admin/payments` | Payment review and safe verification | payments read/verify |
| `/admin/questions` | Question banks, workflow, reports, and publishing | questions read/write/publish |
| `/admin/articles` | MDX inventory and validation | articles read |
| `/admin/support` | Paginated support queue | support read/write |
| `/admin/support/[ticket-id]` | Conversation, internal notes, assignment, and status | support read/write |
| `/admin/analytics` | Database-backed operational analytics | analytics read |
| `/admin/settings` | Whitelisted platform settings | settings read/write |
| `/admin/schedules` | Existing timetable import and publication | schedules write/publish |
| `/admin/audit-log` | Append-only action history | audit read |

## Permission matrix

| Capability | support_agent | content_editor | academic_reviewer | super_admin |
| --- | :---: | :---: | :---: | :---: |
| Overview | Yes | Yes | Yes | Yes |
| Users read | Yes | No | No | Yes |
| Users suspend/restore | No | No | No | Yes |
| Roles assign/remove | No | No | No | Yes |
| Memberships/payments | No | No | No | Yes |
| Questions edit | No | Yes | Yes | Yes |
| Questions publish | No | No | Yes | Yes |
| Articles inspect | No | Yes | Yes | Yes |
| Support manage | Yes | No | No | Yes |
| Analytics | No | No | No | Yes |
| Settings | No | No | No | Yes |
| Audit log | No | No | No | Yes |

The schema has no general `admin` role. `super_admin` therefore owns the broad operational permissions described as “admin” in the product brief. Navigation visibility is only a convenience; every page and mutation will enforce the same server-side permission.

## Server utilities and actions

- Add `getAdminSession()`, `requireAdmin()`, `hasAdminPermission()`, and `requirePermission()` using the existing session and role helpers.
- Make the service-role client explicitly server-only.
- Add a reusable audit logger that sanitises metadata and records reason, previous state, and resulting state.
- Add server-only paginated services for users, memberships, payments, support, analytics, and article validation.
- Add confirmed server actions for roles, account suspension/restoration, recovery-email dispatch, manual membership grants/extensions/revocations/restoration, payment re-verification/review, question-report resolution, support assignment/replies/notes/status, and whitelisted settings.
- Require typed confirmation text and a reason for destructive or access-reducing actions.

## Migration requirements

Additive migrations are required:

- Allow `memberships.payment_reference` to be null for non-payment grants.
- Add membership source and administrative lifecycle fields.
- Add support priority and a support status-history table.
- Add constrained `platform_settings`.
- Add non-secret audit columns for reason, previous state, and resulting state.
- Add admin query indexes for status, dates, expiry, course code, ticket queues, and payment references.
- Add server-only paginated list and aggregate analytics RPCs.
- Enforce staff-only read and insert policies for internal support notes.
- Keep RLS enabled and restrictive; privileged writes remain isolated behind authenticated, permission-checked server code.

No migration will add faculty or phone because the application does not currently collect them. No application-level account-status column is required: Supabase Auth ban state is sufficient and avoids competing sources of truth.

## Testing plan

- Unit-test the permission matrix, role escalation rules, self-lockout/last-super-admin rules, status transitions, membership date calculations, payment action safeguards, and audit metadata sanitisation.
- Retain and run the existing platform tests.
- Verify every `/admin` page calls the permission layer and every privileged action rechecks permission.
- Confirm service-role utilities cannot enter client bundles.
- Run `git diff --check`, ESLint, TypeScript without emit, platform tests, and the full production build.
- Perform a source-level security scan for secrets, production `LOCAL_PILOT`, unguarded admin handlers, blind payment-success mutations, and destructive actions without confirmation.
