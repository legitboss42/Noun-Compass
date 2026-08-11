# Inactive Students by Stage — Design

> **For agentic workers:** this is a design spec. Implementation planning happens
> next via `superpowers:writing-plans`. Do not implement from this document.

**Goal:** Give super-admins a view of signed-up-but-inactive students grouped by
*where they stopped* in the funnel, and let them send a stage-appropriate
re-engagement email — in bulk per stage, or to one student — reusing the existing
consent, unsubscribe, cooldown, and dedupe machinery.

**Date:** 2026-08-11
**Status:** approved design, pre-plan.

## Background

A daily cron ([app/api/cron/daily/route.ts](../../../app/api/cron/daily/route.ts))
and a guarded admin trigger
([app/admin/reengagement/](../../../app/admin/reengagement/)) already email one
audience — verified accounts that never did *any* activity — through one shared
send loop ([lib/platform/reengagement.ts](../../../lib/platform/reengagement.ts)).
That audience is a single bucket with a single email.

This feature splits that flat audience into the four points a student can stall
at, shows each bucket in the admin panel, and sends copy written for the point
they reached. It does not add AI generation: each stage has one hand-written
branded template the system selects and personalizes.

## Non-goals

- **No AI-generated copy.** Fixed per-stage templates only.
- **No new scheduling.** The cron keeps its current behavior (see "Cron" below);
  stage-aware sending is manual, from the panel.
- **No win-back of activated students.** A student who *completed* a practice
  exam has activated and is out of scope. A future S5 ("did one, never came
  back") can be added later.
- **No change to account/payment mail.** Those are never marketing and are
  untouched.

## The drop-off ladder (where they stopped)

Each inactive student is assigned to exactly one stage: the **furthest** point
they reached (a priority ladder, so non-linear journeys resolve to the deepest
signal). "Activated" students are excluded entirely.

| Stage | Label | Reached | Deepest signal present |
|-------|-------|---------|------------------------|
| — | *(excluded: activated)* | Completed a practice exam | `ai_practice_sessions.status='completed'` **or** `practice_sessions.status='completed'` |
| **S4** | Started practice, never finished | Began a practice exam | a row in `ai_practice_sessions` or `practice_sessions` (none completed) |
| **S3** | Explored tools, never tested | Used a tool / built a plan | a row in `user_tool_activity` or `study_plans` |
| **S2** | Set up, never explored | Completed onboarding | `profiles.onboarding_completed_at is not null` |
| **S1** | Signed up, never set up | Verified email | none of the above |

Classification is evaluated top-down: check "activated" first (exclude), then
S4, S3, S2, and finally S1 as the floor for any verified account with no deeper
signal.

### "Gone quiet"

A student is included only if they have been quiet for at least `quiet_days`
(default **7**, adjustable in the panel):

```
coalesce(last_activity_at, onboarding_completed_at, users.created_at)
  <= now() - make_interval(days => quiet_days)
```

`last_activity_at` is the greatest timestamp across the student's activity rows
(`user_tool_activity.updated_at`, `study_plans.updated_at`,
`study_plan_sessions.created_at`, `ai_practice_sessions.created_at`/`completed_at`,
`practice_sessions.started_at`/`completed_at`). For S1/S2 there is no activity, so
the coalesce falls back to onboarding time (S2) or account creation (S1) — i.e.
"created an account 7+ days ago and still stalled." This mirrors the cron's
existing `grace_days` idea.

## Architecture

Five units, each with one responsibility. The first three are pure/data and
independently testable; the last two are the Next.js surface.

```
SQL RPC  ──►  lib/platform/inactive-students.ts  ──►  admin page + actions
  │                    │                                      │
  │                    └── lib/platform/stage-email-core.ts ──┘
  │                                (pure: stage → template)
  └── security definer, service_role only
```

### 1. Data — one SQL function

New migration `supabase/migrations/202608110001_inactive_students_by_stage.sql`
adds a `security definer` RPC granted to `service_role` only, mirroring the
lockdown of `select_reengagement_candidates`:

```sql
create or replace function public.select_inactive_students_by_stage(
  p_quiet_days integer,
  p_cooldown_days integer,
  p_limit integer,
  p_stage text default null      -- null = all stages; else one of s1..s4
)
returns table (
  user_id uuid,
  email text,
  display_name text,
  stage text,                    -- 's1' | 's2' | 's3' | 's4'
  last_activity_at timestamptz,  -- the coalesced "quiet since" anchor
  context jsonb                  -- stage-specific extras (see below)
)
language sql
security definer
set search_path = public
as $$ ... $$;
```

Selection rules, all enforced in SQL:

- `u.email_confirmed_at is not null` (verified only).
- `ep.reengagement_reminders = true` (opted in). A student with no
  `email_preferences` row is treated as **not eligible** (the `handle_new_user`
  trigger creates the row, so its absence is anomalous — safer to skip than to
  email).
- **Exclude activated:** `not exists` a completed `ai_practice_sessions` or
  `practice_sessions` row.
- **Exclude staff:** `not exists` a non-`student` role in `user_roles` (the
  existing role table), so admins never appear in the audience.
- **Cooldown:** `not exists` a `notifications` row with
  `kind='reengagement'`, `emailed_at is not null`, within `p_cooldown_days`
  (identical to the current RPC). One cooldown across all stages — a student
  emailed as S3 last week is not re-emailed as S4 this week.
- **Quiet:** the coalesce expression above `<= now() - quiet_days`.
- Stage assigned by the priority ladder; `p_stage` filters to one stage when
  provided (for per-stage counts and bulk send).
- `order by last_activity_at asc` (most-stale first), `limit
  greatest(least(p_limit, 500), 0)`.

`context` carries what the S4 email needs to be specific — the course the student
abandoned mid-practice and the session id to resume:

```json
{ "course_code": "MTH101", "course_title": "Elementary Mathematics I", "resume_session_id": "<uuid>" }
```

For S1–S3 `context` is `{}`. The chosen S4 row is the student's most recent
non-completed `ai_practice_sessions` row (by `created_at desc`).

A companion counts function returns per-stage totals for the panel cards without
pulling rows:

```sql
create or replace function public.count_inactive_students_by_stage(
  p_quiet_days integer,
  p_cooldown_days integer
)
returns table (stage text, count bigint) ...
```

Same lockdown and grant. Both functions `revoke ... from public, anon,
authenticated` and `grant execute ... to service_role`.

The migration ends with the same sanity-check comment block the reengagement
migration uses, giving the exact service-role queries to compare per-stage counts
against total verified accounts before any real send.

### 2. Selection module — `lib/platform/inactive-students.ts`

`server-only`, the typed boundary over the RPCs. Mirrors
`lib/platform/reengagement.ts`.

```ts
export type InactiveStage = "s1" | "s2" | "s3" | "s4";

export type InactiveStudent = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  stage: InactiveStage;
  last_activity_at: string | null;
  context: {
    course_code?: string | null;
    course_title?: string | null;
    resume_session_id?: string | null;
  };
};

export type InactiveParams = { quietDays: number; cooldownDays: number; limit: number };

export function inactiveParamsFromEnv(): InactiveParams;               // env → params, clamped-by-RPC
export async function countInactiveByStage(admin, params): Promise<Record<InactiveStage, number>>;
export async function selectInactiveStudents(admin, params, stage?: InactiveStage): Promise<InactiveStudent[]>;
export async function sendStageBatch(admin, runDate, students): Promise<{ candidates: number; emailed: number; failed: number }>;
```

`sendStageBatch` is the stage-aware generalization of the existing
`sendReengagementBatch`: same `kind='reengagement'`, same `dedupe_key =
reengagement:${runDate}` (so a cron send and an admin send on the same day still
collide on the `notifications` unique index and never double-email), same
"write the notification row first, set `emailed_at` only after SMTP succeeds"
ordering, same "one bad address never stops the batch." The only change: it picks
the template by `student.stage` and writes a stage-specific notification
`title`/`body`/`action_url`.

`inactiveParamsFromEnv` reuses the existing knobs
(`REENGAGEMENT_COOLDOWN_DAYS`, `REENGAGEMENT_BATCH_LIMIT`) and adds
`REENGAGEMENT_QUIET_DAYS` (default 7) so the cron and panel agree on defaults.
The panel may override `quietDays` per request via a query param (see UI).

### 3. Email templates — `lib/platform/stage-email-core.ts`

Pure, no I/O, unit-tested — the counterpart to
`reengagement-email-core.ts`, which it generalizes. One builder that switches on
stage and returns `{ subject, html, text }` from the branded shell
(`renderBrandedEmail`), plus the notification copy for each stage.

```ts
export type StageEmailInput = {
  stage: InactiveStage;
  displayName?: string | null;
  siteUrl: string;
  unsubscribeUrl?: string;
  context?: { course_code?: string | null; course_title?: string | null; resume_session_id?: string | null };
};

export function buildStageEmail(input: StageEmailInput): { subject: string; html: string; text: string };
export function stageNotification(stage: InactiveStage, context?): { title: string; body: string; actionUrl: string };
export const STAGE_META: Record<InactiveStage, { label: string; blurb: string }>; // for panel labels
```

The four templates, each in the existing dark branded shell, each personalized
with the first name (reusing the existing `firstName` fallback logic, extracted
so both builders share it) and carrying the one-click unsubscribe:

| Stage | Subject (named) | CTA → | Angle |
|-------|-----------------|-------|-------|
| **S1** | `{first}, finish setting up NounCompass` | `/dashboard` ("Set up semester") | You verified but never told us your courses — 2 minutes to set up. |
| **S2** | `{first}, your tools are ready` | `/dashboard` | You're set up; here's the fastest first tool to open. |
| **S3** | `{first}, see where you actually stand` | `/dashboard/ai-practice` | You've used the tools; a Practice Exam shows what you've got. |
| **S4** | `{first}, finish your {course} practice` | `/dashboard/ai-practice?session={resume_session_id}` | You started a {course_title} exam — pick up where you left off. |

Each has a neutral-greeting fallback subject when the name is unusable. S4 falls
back to the S3 copy/subject if `context.course_title` is missing (defensive: the
email is still correct, just less specific). No template invents an exam date or
mentions removed question banks — the existing `reengagement-email.test.ts`
banned-phrase guard is extended to cover all four.

`ctaUrl` is composed in the send layer from `siteUrl` + the stage's path (the
core stays pure and URL-base-agnostic, matching how `sendReengagementEmail`
builds `ctaUrl` today).

### 4. Admin view — `app/admin/reengagement/page.tsx`

The existing page is repurposed from a single-audience trigger into the
"Inactive students" view. Still gated on `settings.manage` via
`requirePermission` (super-admin only); still `dynamic = "force-dynamic"`.

Layout:

- **Header** — retitled "Inactive students", description explaining stages and
  that sending here does not arm the cron.
- **Quiet-window control** — a small GET form (`?quiet=<n>`, default 7, clamped
  1–90) that re-renders the counts for that threshold. No JS needed.
- **Four stage cards** (`AdminStatCard`) — S1…S4 with counts from
  `countInactiveByStage`, each detail line naming the cooldown and the
  quiet-since date. Plus one "Cron" card showing whether
  `REENGAGEMENT_ENABLED === "true"` (unchanged from today).
- **Per-stage sections** — for each stage with count > 0:
  - An `AdminDataTable` drill-down: **Student** (name/email), **Where they
    stopped** (`STAGE_META.label`, plus course for S4), **Last active**
    (formatted `last_activity_at`). Capped at the batch limit; a note states the
    cap and true count when they differ (no silent truncation).
  - A **bulk-send** form: `AdminConfirmationFields phrase="SEND"` + reason,
    submitting to `sendStageCampaign` with a hidden `stage` field. Copy states
    exactly how many will be emailed and the cooldown hold.
  - A **per-row Send** button (own tiny form, hidden `user_id` + `stage`,
    submitting to `sendToOneStudent`). This is a one-off, so it does not require
    the typed `SEND` phrase, but it is still a POST server action, still writes
    an audit log, and still respects cooldown/dedupe (a per-row send to a
    student already in cooldown is a no-op that reports "already emailed
    recently").
- `AdminFeedback` surfaces `?error` / `?notice` exactly as today.

Reads use `createAdminClient()`; a null client renders the existing "Database is
not configured" path.

### 5. Admin actions — `app/admin/reengagement/actions.ts`

Three `"use server"` actions, each starting with
`requirePermission("settings.manage", "/admin/reengagement")` and ending with a
`writeAuditLog` + `revalidatePath` + `redirect` — following the existing
`sendReengagementCampaign` exactly.

```ts
export async function sendStageCampaign(formData): Promise<void>;   // bulk: stage + SEND + reason
export async function sendToOneStudent(formData): Promise<void>;    // one: stage + user_id (+ reason)
```

Shared helpers (`value`, `fail`) stay. Both:

1. Validate the `stage` field is one of `s1..s4`.
2. `sendStageCampaign`: require `requireActionConfirmation(…, "SEND")` and
   `requireAdminReason(…)`; select that stage's candidates via
   `selectInactiveStudents(admin, params, stage)`; `sendStageBatch`.
3. `sendToOneStudent`: select the single student
   (`selectInactiveStudents` filtered to that stage, then find by `user_id` — so
   the same eligibility/cooldown gate applies; if they're no longer eligible the
   action reports it and sends nothing); `sendStageBatch` with a one-element
   array.
4. `writeAuditLog` with `action: "reengagement.sent"`, `targetId: runDate`,
   metadata including `stage`, `mode: "bulk" | "single"`, and
   `candidates/emailed/failed`.

**Critically, like today: neither action reads `REENGAGEMENT_ENABLED`.** The
super-admin permission plus the confirmation *is* the deliberate enable; manual
sending never arms the unattended cron.

### Cron

The daily cron is **unchanged** in this feature. It keeps emailing its current
S1/S2-style "never started anything" audience through
`selectReengagementCandidates` / `sendReengagementBatch`, still gated behind
`REENGAGEMENT_ENABLED !== "true"`. Rationale: the cron's existing audience is a
strict subset of S1∪S2 (it excludes anyone with *any* activity row), the shared
`dedupe_key` and `kind='reengagement'` cooldown already prevent a cron send and a
panel send from colliding, and making the cron stage-aware is scope the user
explicitly deferred. A one-line code comment records that the panel is the
stage-aware path and the cron is the "never-started" path, so the overlap is
intentional.

## Data flow (bulk send)

1. Super-admin opens `/admin/reengagement?quiet=7`.
2. Page calls `countInactiveByStage` → renders four cards; for each non-empty
   stage calls `selectInactiveStudents(_, _, stage)` → renders the drill-down.
3. Admin reviews S4's list, types `SEND` + reason, submits.
4. `sendStageCampaign` re-selects S4 candidates (fresh, server-side — the page's
   list is only a preview), calls `sendStageBatch`.
5. Per student: insert `notifications` row (`dedupe_key=reengagement:<date>`); on
   unique-violation skip (already nudged today); else `buildStageEmail("s4", …)`
   + SMTP with one-click unsubscribe header; on success set `emailed_at`
   (starting the cooldown); on SMTP failure leave `emailed_at` null so they're
   retried next time.
6. `writeAuditLog`; redirect with `?notice=<emailed>/<failed>`.

## Error handling

- **RPC/DB error** → thrown by the module, shown via `AdminFeedback` on read;
  on a send action, caught and redirected to `?error=…` (existing `fail`).
- **SMTP failure per student** → counted as `failed`, notification row kept
  without `emailed_at`, batch continues. If `emailed === 0 && failed > 0`, the
  action redirects with the existing "check SMTP configuration" error.
- **No candidates** (race: list emptied between preview and send) → action
  reports "No students are eligible right now."
- **Missing unsubscribe signing** → `sendReengagementEmail`'s sibling refuses to
  send a marketing email without a working unsubscribe (same rule as today);
  the failure is counted, not swallowed silently.
- **Null admin client** → "Platform database is not configured."

## Testing

Unit tests (`tsx --test tests/platform/*.test.ts`), no DB required — the SQL is
verified by the migration's sanity-check queries against production data before
enabling, as the reengagement RPC already is.

New `tests/platform/stage-email.test.ts`:

- Each stage returns a subject, html, and text with **no unfilled `{{ }}`
  tokens** and a working unsubscribe link present in **both** html and text.
- Personalization: named greeting for a good name; neutral fallback for
  null/blank/email-like/over-long names (parameterized, as the existing test).
- S4 with `context.course_title` names the course and puts `session=<id>` in the
  CTA; S4 without context degrades to the S3-style copy and CTA.
- Banned-phrase guard (no invented exam dates, no question banks) across **all
  four** templates.
- `stageNotification` returns the right `action_url` per stage (S4 includes the
  resume session id).

Extend `tests/platform/reengagement-email.test.ts` only if the shared `firstName`
extraction changes its output (it must not — existing assertions stay green).

`tsc --noEmit` must stay clean; the full existing suite (117 tests) must stay
green.

## Security & safety constraints (carried, unchanged)

- Email only **verified + inactive + opted-in** students; the RPC enforces all
  three, staff excluded.
- Every send carries a **working one-click unsubscribe** (`reengagement` scope,
  the header→`/api/unsubscribe` fix already landed).
- **Off by default:** the cron still requires `REENGAGEMENT_ENABLED === "true"`;
  the panel requires super-admin + typed confirmation and never arms the cron.
- **Verify counts before any real send** using the migration's sanity queries.
- Account/payment mail is never touched; no secrets in logs or commits; do not
  commit code unless the user asks.

## Open decisions for review

These are resolved in the design above but were not explicitly confirmed; flagging
them so they can be changed at spec review rather than discovered in code.

1. **Counts show *eligible-to-email*, not *all inactive*.** The cards and
   drill-downs list students who are opted-in, verified, quiet, and outside
   cooldown — i.e. the set you can act on right now, matching the current page's
   "Eligible right now" semantics. Recently-emailed or opted-out students in a
   stage are *not* shown or counted. Alternative: show total inactive per stage
   and separately mark how many are emailable. Chosen the simpler, safer default
   (never surfaces opted-out students). Change if you want a fuller census view.
2. **Per-row send skips the typed `SEND` phrase.** A one-off row send still
   requires super-admin, still POSTs a server action, still audits, and still
   respects cooldown — but does not make you type `SEND` (that guard is reserved
   for bulk). Change if single sends should also require the phrase.
3. **Default quiet window = 7 days**, adjustable 1–90 in the panel. Confirmed in
   brainstorming; restated here as the concrete clamp.

## File manifest

| File | Change |
|------|--------|
| `supabase/migrations/202608110001_inactive_students_by_stage.sql` | Create: two `security definer` RPCs, service_role-only |
| `lib/platform/inactive-students.ts` | Create: typed selection + stage-aware send batch |
| `lib/platform/stage-email-core.ts` | Create: pure per-stage template builder + notification copy |
| `lib/platform/reengagement-email-core.ts` | Modify: export shared `firstName` helper |
| `app/admin/reengagement/page.tsx` | Modify: single-audience trigger → stage view with drill-downs |
| `app/admin/reengagement/actions.ts` | Modify: add `sendStageCampaign` + `sendToOneStudent` |
| `tests/platform/stage-email.test.ts` | Create: template/personalization/banned-phrase tests |

The nav link in `app/admin/layout.tsx` already points at `/admin/reengagement`;
only its label may change ("Inactive students"). `lib/platform/reengagement.ts`
and the cron are left as-is.

