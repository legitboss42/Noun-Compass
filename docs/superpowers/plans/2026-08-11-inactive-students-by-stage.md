# Inactive Students by Stage — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let super-admins view signed-up-but-inactive students grouped by the furthest funnel step they reached, and send a fixed per-stage re-engagement email in bulk or per-student.

**Architecture:** A `security definer` SQL RPC classifies each verified, opted-in, quiet, non-activated student into stage s1–s4 and returns per-student context. A `server-only` TypeScript module wraps the RPC and reuses the existing notification-first / emailed-at-after-success send batch. A pure email-core module builds one branded template per stage. The existing `/admin/reengagement` page and actions are extended into a stage view with bulk and per-row send.

**Tech Stack:** Next.js 16 App Router (server components + server actions), TypeScript, Supabase (service-role admin client, plpgsql/sql RPCs), nodemailer (Brevo SMTP), `node:test` via `tsx --test`.

## Global Constraints

- Email only **verified + inactive + opted-in** students; the RPC enforces all three. Exclude staff (`user_roles.role <> 'student'`) and activated students (any `status='completed'` practice).
- Every send carries a **working one-click unsubscribe** (`reengagement` scope). Reuse `sendReengagementEmail`'s sibling behaviour: refuse to send marketing without a signable unsubscribe link.
- **Off by default:** the cron still requires `REENGAGEMENT_ENABLED === "true"` and is left unchanged. The admin path never reads that flag — super-admin permission plus typed confirmation is the deliberate enable.
- Reuse existing plumbing: `kind='reengagement'`, `dedupe_key='reengagement:${runDate}'`, the `notifications` unique `(user_id, dedupe_key)`, and the 14-day cooldown. Do not invent parallel machinery.
- All new RPCs: `security definer`, `set search_path = public`, `revoke ... from public, anon, authenticated`, `grant execute ... to service_role`. Match `202608100002_reengagement_reminders.sql`.
- Do not commit code unless the user explicitly asks. Verify audience counts with the migration's sanity queries before any real send.
- `tsc --noEmit` stays clean; the full existing suite (117 tests) stays green.

## File Structure

- Create `supabase/migrations/202608110001_inactive_students_by_stage.sql` — one internal classifier function + two public RPCs (select, count), all service_role-only.
- Create `lib/platform/stage-email-core.ts` — pure: `buildStageEmail`, `stageNotification`, `STAGE_META`, `InactiveStage`.
- Modify `lib/platform/reengagement-email-core.ts` — export the shared `firstName` helper; import it in stage-email-core.
- Create `lib/platform/inactive-students.ts` — `server-only`: typed params, `countInactiveByStage`, `selectInactiveStudents`, `sendStageBatch`.
- Modify `app/admin/reengagement/page.tsx` — single-audience trigger → stage view with per-stage drill-downs, bulk + per-row send.
- Modify `app/admin/reengagement/actions.ts` — add `sendStageCampaign` and `sendToOneStudent`.
- Create `tests/platform/stage-email.test.ts` — template, personalization, banned-phrase, notification-url tests.
- Modify `app/admin/layout.tsx` — rename the nav label to "Inactive students" (link unchanged).

---

### Task 1: Pure per-stage email core

**Files:**
- Create: `lib/platform/stage-email-core.ts`
- Modify: `lib/platform/reengagement-email-core.ts:46-54` (export the private `firstName`)
- Test: `tests/platform/stage-email.test.ts`

**Interfaces:**
- Consumes: `renderBrandedEmail` from `lib/email-layout.ts`; `firstName` from `lib/platform/reengagement-email-core.ts` (exported in this task).
- Produces:
  - `type InactiveStage = "s1" | "s2" | "s3" | "s4"`
  - `type StageContext = { course_code?: string | null; course_title?: string | null; resume_session_id?: string | null }`
  - `buildStageEmail(input: { stage: InactiveStage; displayName?: string | null; siteUrl: string; unsubscribeUrl?: string; context?: StageContext }): { subject: string; html: string; text: string }`
  - `stageNotification(stage: InactiveStage, context?: StageContext): { title: string; body: string; actionUrl: string }` — `actionUrl` is a **relative** path (notifications store relative `action_url`).
  - `STAGE_META: Record<InactiveStage, { label: string; blurb: string }>`

**Design note (resolves a spec ambiguity):** the CTA path per stage is computed once by a private `stagePath(stage, context)`. `stageNotification` returns it as the relative `actionUrl`; `buildStageEmail` prepends `siteUrl` to make the absolute email CTA. This keeps the core pure and URL-base-agnostic while staying DRY.

- [ ] **Step 1: Write the failing test**

Create `tests/platform/stage-email.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  STAGE_META,
  buildStageEmail,
  stageNotification,
  type InactiveStage,
} from "../../lib/platform/stage-email-core";

const SITE = "https://nouncompass.me";
const STAGES: InactiveStage[] = ["s1", "s2", "s3", "s4"];

test("every stage renders a complete branded email with no leftover tokens", () => {
  for (const stage of STAGES) {
    const { subject, html, text } = buildStageEmail({
      stage,
      displayName: "Ada",
      siteUrl: SITE,
      unsubscribeUrl: `${SITE}/unsubscribe?email=a%40b.com&scope=reengagement&token=abc`,
      context: { course_code: "MTH101", course_title: "Elementary Mathematics I", resume_session_id: "sess-1" },
    });
    assert.ok(subject.length > 0, `${stage} has a subject`);
    assert.equal(/\{\{|\}\}/.test(html), false, `${stage} has no template tokens`);
    assert.match(html, /Hi Ada,/, `${stage} greets by name`);
    assert.match(html, /scope=reengagement/, `${stage} html has unsubscribe`);
    assert.match(text, /scope=reengagement/, `${stage} text has unsubscribe`);
  }
});

test("s4 names the abandoned course and deep-links to resume it", () => {
  const { subject, html } = buildStageEmail({
    stage: "s4",
    displayName: "Ada",
    siteUrl: SITE,
    context: { course_code: "MTH101", course_title: "Elementary Mathematics I", resume_session_id: "sess-9" },
  });
  assert.match(subject, /Elementary Mathematics I|MTH101/);
  assert.match(html, /session=sess-9/);
});

test("s4 without course context degrades to the plain practice CTA", () => {
  const noCtx = buildStageEmail({ stage: "s4", displayName: "Ada", siteUrl: SITE });
  assert.match(noCtx.html, /dashboard\/ai-practice/);
  assert.equal(/session=/.test(noCtx.html), false);
});

test("an unusable display name falls back to a neutral greeting for every stage", () => {
  for (const stage of STAGES) {
    for (const displayName of [null, "", "   ", "student@example.com", "Averyveryverylongsinglenametoken"]) {
      const { html } = buildStageEmail({ stage, displayName, siteUrl: SITE });
      assert.match(html, /Hi there,/, `${stage} neutral greeting for ${JSON.stringify(displayName)}`);
    }
  }
});

test("no stage invents an exam date or mentions removed question banks", () => {
  for (const stage of STAGES) {
    const { html, text } = buildStageEmail({
      stage, displayName: "Ada", siteUrl: SITE,
      context: { course_title: "Elementary Mathematics I", resume_session_id: "s" },
    });
    for (const banned of [/question bank/i, /past question/i, /your exam is on/i, /expires? in \d/i]) {
      assert.equal(banned.test(html), false, `${stage} html banned: ${banned}`);
      assert.equal(banned.test(text), false, `${stage} text banned: ${banned}`);
    }
  }
});

test("stageNotification returns a relative action_url with the s4 resume id", () => {
  assert.equal(stageNotification("s1").actionUrl, "/dashboard");
  assert.equal(stageNotification("s3").actionUrl, "/dashboard/ai-practice");
  assert.equal(
    stageNotification("s4", { resume_session_id: "sess-2" }).actionUrl,
    "/dashboard/ai-practice?session=sess-2",
  );
  for (const stage of STAGES) {
    const n = stageNotification(stage);
    assert.ok(n.title.length > 0 && n.body.length > 0, `${stage} notification copy`);
  }
});

test("STAGE_META covers all four stages with labels", () => {
  for (const stage of STAGES) assert.ok(STAGE_META[stage].label.length > 0);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx tsx --test tests/platform/stage-email.test.ts`
Expected: FAIL — `Cannot find module '../../lib/platform/stage-email-core'`.

- [ ] **Step 3: Export the shared `firstName` helper**

In `lib/platform/reengagement-email-core.ts`, change the helper declaration on line 46 from `function firstName(...)` to `export function firstName(...)`. Leave the body and all existing callers unchanged.

```ts
export function firstName(displayName?: string | null) {
  const cleaned = (displayName ?? "").replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const first = cleaned.split(" ")[0];
  if (first.length > 24 || first.includes("@")) return "";
  return first;
}
```

- [ ] **Step 4: Create `lib/platform/stage-email-core.ts`**

```ts
import { renderBrandedEmail } from "../email-layout";
import { firstName } from "./reengagement-email-core";

export type InactiveStage = "s1" | "s2" | "s3" | "s4";

export type StageContext = {
  course_code?: string | null;
  course_title?: string | null;
  resume_session_id?: string | null;
};

export type StageEmailInput = {
  stage: InactiveStage;
  displayName?: string | null;
  siteUrl: string;
  unsubscribeUrl?: string;
  context?: StageContext;
};

export const STAGE_META: Record<InactiveStage, { label: string; blurb: string }> = {
  s1: { label: "Signed up, never set up", blurb: "Verified their email but never completed onboarding." },
  s2: { label: "Set up, never explored", blurb: "Finished onboarding but never opened a study tool." },
  s3: { label: "Explored tools, never tested", blurb: "Used a tool or planner but never did a Practice Exam." },
  s4: { label: "Started practice, never finished", blurb: "Began a Practice Exam but never completed one." },
};

/** Relative CTA path, shared by the email (absolute) and the notification row (relative). */
function stagePath(stage: InactiveStage, context?: StageContext): string {
  if (stage === "s3") return "/dashboard/ai-practice";
  if (stage === "s4") {
    const id = context?.resume_session_id;
    return id ? `/dashboard/ai-practice?session=${encodeURIComponent(id)}` : "/dashboard/ai-practice";
  }
  return "/dashboard"; // s1, s2
}

type StageCopy = {
  subject: string;
  preheader: string;
  eyebrow: string;
  heading: string;
  headingHighlight?: string;
  paragraphs: string[];
  ctaLabel: string;
  note?: string;
};

function stageCopy(stage: InactiveStage, first: string, context?: StageContext): StageCopy {
  const named = (withName: string, neutral: string) => (first ? withName : neutral);
  const course = (context?.course_title || "").trim();
  switch (stage) {
    case "s1":
      return {
        subject: named(`${first}, finish setting up NounCompass`, "Finish setting up NounCompass"),
        preheader: "You verified your account. Two minutes to finish setting it up.",
        eyebrow: "Finish your setup",
        heading: "You are one step from a study plan.",
        headingHighlight: "one step",
        paragraphs: [
          named(`Hi ${first},`, "Hi there,"),
          "You verified your NounCompass account but have not set up your semester yet. Once we know your programme and registered courses, every tool works from your real courses instead of generic ones.",
          "It takes about two minutes and you can change it any time.",
        ],
        ctaLabel: "Set up my semester",
        note: "Everything on NounCompass is free: the CGPA calculator, the study planner, and Practice Exams.",
      };
    case "s2":
      return {
        subject: named(`${first}, your study tools are ready`, "Your NounCompass tools are ready"),
        preheader: "Your semester is set up. Here is the fastest tool to open first.",
        eyebrow: "Your tools are ready",
        heading: "Your semester is set up. Now use it.",
        headingHighlight: "use it",
        paragraphs: [
          named(`Hi ${first},`, "Hi there,"),
          "You finished setting up your semester but have not opened a study tool yet. The quickest first step is a Practice Exam built from your own course material - it marks itself and shows the topics to revise.",
          "It is free and your score is saved so you can see whether you are improving.",
        ],
        ctaLabel: "Open my dashboard",
        note: "Also free: the CGPA calculator and the study planner.",
      };
    case "s3":
      return {
        subject: named(`${first}, see where you actually stand`, "See where you actually stand"),
        preheader: "You have used the tools. A Practice Exam shows what you have got.",
        eyebrow: "Try a Practice Exam",
        heading: "You have explored. Now test yourself.",
        headingHighlight: "test yourself",
        paragraphs: [
          named(`Hi ${first},`, "Hi there,"),
          "You have used the NounCompass tools but have not tried a Practice Exam yet. Pick one of your registered courses and NounCompass builds questions from the official material, marks them, and shows which topics to go back to.",
          "It takes a few minutes and it is free.",
        ],
        ctaLabel: "Start a Practice Exam",
      };
    case "s4":
      return course
        ? {
            subject: named(`${first}, finish your ${course} practice`, `Finish your ${course} practice`),
            preheader: `You started a ${course} Practice Exam. Pick up where you left off.`,
            eyebrow: "Pick up where you left off",
            heading: "You started. Now finish it.",
            headingHighlight: "finish it",
            paragraphs: [
              named(`Hi ${first},`, "Hi there,"),
              `You started a Practice Exam for ${course} but did not finish it. Your progress is saved - you can pick up exactly where you left off and see your score at the end.`,
              "It only takes a few more minutes.",
            ],
            ctaLabel: "Finish my practice",
          }
        : {
            subject: named(`${first}, finish your practice exam`, "Finish your practice exam"),
            preheader: "You started a Practice Exam. Pick up where you left off.",
            eyebrow: "Pick up where you left off",
            heading: "You started. Now finish it.",
            headingHighlight: "finish it",
            paragraphs: [
              named(`Hi ${first},`, "Hi there,"),
              "You started a Practice Exam but did not finish it. Your progress is saved - you can pick up where you left off and see your score at the end.",
              "It only takes a few more minutes.",
            ],
            ctaLabel: "Finish my practice",
          };
  }
}

export function stageNotification(stage: InactiveStage, context?: StageContext) {
  const copy = stageCopy(stage, "", context);
  return { title: copy.eyebrow, body: copy.paragraphs[copy.paragraphs.length - 1], actionUrl: stagePath(stage, context) };
}

export function buildStageEmail(input: StageEmailInput): { subject: string; html: string; text: string } {
  const first = firstName(input.displayName);
  const copy = stageCopy(input.stage, first, input.context);
  const site = input.siteUrl.replace(/\/+$/, "");
  const { html, text } = renderBrandedEmail({
    preheader: copy.preheader,
    eyebrow: copy.eyebrow,
    heading: copy.heading,
    headingHighlight: copy.headingHighlight,
    paragraphs: copy.paragraphs,
    cta: { label: copy.ctaLabel, url: `${site}${stagePath(input.stage, input.context)}` },
    note: copy.note,
    unsubscribeUrl: input.unsubscribeUrl,
    siteUrl: input.siteUrl,
  });
  return { subject: copy.subject, html, text };
}
```

- [ ] **Step 5: Run the new test to verify it passes**

Run: `npx tsx --test tests/platform/stage-email.test.ts`
Expected: PASS (all tests).

- [ ] **Step 6: Verify nothing regressed**

Run: `npm run test:platform` and `npx tsc --noEmit`
Expected: full suite green (existing 117 + new), typecheck clean. In particular `tests/platform/reengagement-email.test.ts` stays green — exporting `firstName` changes nothing about its behaviour.

- [ ] **Step 7: Commit**

```bash
git add lib/platform/stage-email-core.ts lib/platform/reengagement-email-core.ts tests/platform/stage-email.test.ts
git commit -m "Add pure per-stage re-engagement email templates"
```

---

### Task 2: SQL classifier + selection/count RPCs

**Files:**
- Create: `supabase/migrations/202608110001_inactive_students_by_stage.sql`

**Interfaces:**
- Consumes: existing tables `auth.users`, `public.email_preferences(reengagement_reminders)`, `public.profiles(onboarding_completed_at, display_name)`, `public.user_roles(role)`, `public.user_tool_activity`, `public.study_plans`, `public.study_plan_sessions`, `public.ai_practice_sessions(status, course_code, course_title)`, `public.practice_sessions(status)`, `public.notifications(kind, emailed_at)`.
- Produces (called from Task 3):
  - `select_inactive_students_by_stage(p_quiet_days int, p_cooldown_days int, p_limit int, p_stage text default null)` → rows `(user_id uuid, email text, display_name text, stage text, last_activity_at timestamptz, context jsonb)`.
  - `count_inactive_students_by_stage(p_quiet_days int, p_cooldown_days int)` → rows `(stage text, count bigint)`.

**Note on `last_activity_at` semantics (locks a spec ambiguity):** the returned `last_activity_at` is the raw newest activity timestamp, which is **null for S1/S2** (no activity rows). The quiet-window filter and ordering use `coalesce(last_activity_at, onboarding_completed_at, users.created_at)`. The admin page renders null as "No activity yet" rather than pretending signup was activity.

**Testing note:** this repo has no local SQL test harness (all tests are `tsx --test` over TypeScript). This task's gate is (a) careful review that it matches the exact security pattern of `202608100002_reengagement_reminders.sql`, and (b) the migration's own sanity-check queries, which the user runs against the live database before enabling — identical to how the existing reengagement RPC was validated. There is no automated test step for this task; do not fabricate one.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/202608110001_inactive_students_by_stage.sql`:

```sql
-- Inactive students grouped by the furthest funnel step they reached.
--
-- Extends the re-engagement audience (202608100002) from one flat "never
-- started anything" bucket into four drop-off stages, each shown and emailed
-- separately from the admin panel. Same guarantees as that migration: verified
-- + opted-in only, service_role-only execution, and a shared 14-day cooldown on
-- the notifications table so an admin send and the cron never double-email.
--
-- Stage ladder (deepest signal wins), evaluated only for students who never
-- completed a practice exam (a completed exam = activated = out of scope):
--   s4  started a practice exam, never completed one
--   s3  used a tool or built a study plan, never started a practice exam
--   s2  completed onboarding, never used a tool
--   s1  verified email, never completed onboarding

-- Internal classifier. security definer so it can read auth.users and the
-- activity tables; deliberately NOT granted to service_role because only the
-- two wrappers below call it, as their (superuser) owner. last_activity_at is
-- the raw newest activity timestamp (null for s1/s2); the quiet filter coalesces
-- it with onboarding and signup time.
create or replace function public._reengagement_classify_inactive(
  p_quiet_days integer,
  p_cooldown_days integer
)
returns table (
  user_id uuid,
  email text,
  display_name text,
  stage text,
  last_activity_at timestamptz,
  context jsonb
)
language sql
security definer
set search_path = public
as $$
  with base as (
    select
      u.id,
      u.email::text as email,
      coalesce(p.display_name, '') as display_name,
      u.created_at,
      p.onboarding_completed_at,
      (
        exists (select 1 from public.ai_practice_sessions a where a.user_id = u.id and a.status = 'completed')
        or exists (select 1 from public.practice_sessions s where s.user_id = u.id and s.status = 'completed')
      ) as has_completed_practice,
      (
        exists (select 1 from public.ai_practice_sessions a where a.user_id = u.id)
        or exists (select 1 from public.practice_sessions s where s.user_id = u.id)
      ) as has_started_practice,
      (
        exists (select 1 from public.user_tool_activity t where t.user_id = u.id)
        or exists (select 1 from public.study_plans sp where sp.user_id = u.id)
      ) as has_tool_activity,
      (p.onboarding_completed_at is not null) as has_onboarded,
      (
        select max(g) from (
          select max(t.updated_at) as g from public.user_tool_activity t where t.user_id = u.id
          union all
          select max(sp.updated_at) from public.study_plans sp where sp.user_id = u.id
          union all
          select max(ss.created_at) from public.study_plan_sessions ss where ss.user_id = u.id
          union all
          select max(greatest(a.created_at, a.completed_at)) from public.ai_practice_sessions a where a.user_id = u.id
          union all
          select max(greatest(s.started_at, s.completed_at)) from public.practice_sessions s where s.user_id = u.id
        ) activity
      ) as last_activity_at
    from auth.users u
    join public.email_preferences ep on ep.user_id = u.id
    left join public.profiles p on p.id = u.id
    where u.email_confirmed_at is not null
      and ep.reengagement_reminders = true
      and not exists (
        select 1 from public.user_roles r where r.user_id = u.id and r.role <> 'student'
      )
      and not exists (
        select 1 from public.notifications n
        where n.user_id = u.id
          and n.kind = 'reengagement'
          and n.emailed_at is not null
          and n.emailed_at >= now() - make_interval(days => greatest(p_cooldown_days, 1))
      )
  )
  select
    b.id,
    b.email,
    b.display_name,
    case
      when b.has_started_practice then 's4'
      when b.has_tool_activity then 's3'
      when b.has_onboarded then 's2'
      else 's1'
    end as stage,
    b.last_activity_at,
    case
      when b.has_started_practice then coalesce(
        (
          select jsonb_build_object(
            'course_code', a.course_code,
            'course_title', a.course_title,
            'resume_session_id', a.id
          )
          from public.ai_practice_sessions a
          where a.user_id = b.id and a.status <> 'completed'
          order by a.created_at desc
          limit 1
        ),
        '{}'::jsonb
      )
      else '{}'::jsonb
    end as context
  from base b
  where b.has_completed_practice = false
    and coalesce(b.last_activity_at, b.onboarding_completed_at, b.created_at)
        <= now() - make_interval(days => greatest(p_quiet_days, 0));
$$;

-- Rows for one stage (or all), most-stale first, capped like the reengagement RPC.
create or replace function public.select_inactive_students_by_stage(
  p_quiet_days integer,
  p_cooldown_days integer,
  p_limit integer,
  p_stage text default null
)
returns table (
  user_id uuid,
  email text,
  display_name text,
  stage text,
  last_activity_at timestamptz,
  context jsonb
)
language sql
security definer
set search_path = public
as $$
  select c.user_id, c.email, c.display_name, c.stage, c.last_activity_at, c.context
  from public._reengagement_classify_inactive(p_quiet_days, p_cooldown_days) c
  where p_stage is null or c.stage = p_stage
  order by c.last_activity_at asc nulls first, c.user_id
  limit greatest(least(p_limit, 500), 0);
$$;

-- Per-stage totals for the panel cards, without pulling rows.
create or replace function public.count_inactive_students_by_stage(
  p_quiet_days integer,
  p_cooldown_days integer
)
returns table (stage text, count bigint)
language sql
security definer
set search_path = public
as $$
  select c.stage, count(*)::bigint
  from public._reengagement_classify_inactive(p_quiet_days, p_cooldown_days) c
  group by c.stage;
$$;

revoke all on function public._reengagement_classify_inactive(integer, integer)
  from public, anon, authenticated;
revoke all on function public.select_inactive_students_by_stage(integer, integer, integer, text)
  from public, anon, authenticated;
revoke all on function public.count_inactive_students_by_stage(integer, integer)
  from public, anon, authenticated;
grant execute on function public.select_inactive_students_by_stage(integer, integer, integer, text)
  to service_role;
grant execute on function public.count_inactive_students_by_stage(integer, integer)
  to service_role;

-- Sanity check before sending, run with the service role:
--   select stage, count from public.count_inactive_students_by_stage(7, 14) order by stage;
--   select stage, count(*) from public.select_inactive_students_by_stage(7, 14, 500, null) group by stage;
-- Compare the total against verified accounts to confirm the filter is sane:
--   select count(*) from auth.users where email_confirmed_at is not null;
```

- [ ] **Step 2: Self-check the SQL by reading**

Confirm: three functions all `security definer` + `set search_path = public`; the internal function is revoked from public/anon/authenticated and **not** granted to service_role; both wrappers are granted to service_role; stage `case` ordering is s4→s3→s2→s1; activated users excluded via `has_completed_practice = false`; `context` is `{}` for s1–s3 and for s4 without an AI session. There is no automated test — do not add a `.test.ts` for SQL.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/202608110001_inactive_students_by_stage.sql
git commit -m "Add security-definer RPCs classifying inactive students by stage"
```

---

### Task 3: Server-only selection + stage-aware send

**Files:**
- Create: `lib/platform/inactive-students.ts`
- Modify: `lib/contact-mail.ts` (add `sendInactiveStageEmail`)

**Interfaces:**
- Consumes: `select_inactive_students_by_stage` / `count_inactive_students_by_stage` (Task 2); `buildStageEmail`, `stageNotification`, `InactiveStage`, `StageContext` (Task 1); the existing `createTransporter`, `siteBaseUrl`, `unsubscribeLinkFor`, `unsubscribeHeadersFor` in `lib/contact-mail.ts` / `lib/platform/unsubscribe.ts`.
- Produces (called from Task 4 & 5):
  - `type InactiveStudent = { user_id: string; email: string | null; display_name: string | null; stage: InactiveStage; last_activity_at: string | null; context: StageContext }`
  - `type InactiveParams = { quietDays: number; cooldownDays: number; limit: number }`
  - `inactiveParamsFromEnv(): InactiveParams`
  - `inactiveRunDate(now?: Date): string`
  - `countInactiveByStage(admin, params): Promise<Record<InactiveStage, number>>`
  - `selectInactiveStudents(admin, params, stage?): Promise<InactiveStudent[]>`
  - `sendStageBatch(admin, runDate, students): Promise<{ candidates: number; emailed: number; failed: number }>`
  - In `contact-mail.ts`: `sendInactiveStageEmail({ to, displayName, stage, context }): Promise<void>`

**Testing note:** like the existing `lib/platform/reengagement.ts`, this `server-only` module and the SMTP wrapper are **not** unit-tested — they are thin glue over the RPC (Task 2), the fully-tested pure templates (Task 1), and nodemailer. The gate for this task is `npx tsc --noEmit` clean plus review that `sendStageBatch` mirrors `sendReengagementBatch` exactly (notification row first; `emailed_at` only after SMTP succeeds; unique-violation skip; one failure never stops the batch). Do not invent a test that needs live SMTP or a live database.

- [ ] **Step 1: Add `sendInactiveStageEmail` to `lib/contact-mail.ts`**

Add the import near the top (with the other `@/lib/platform` imports):

```ts
import { buildStageEmail, type InactiveStage, type StageContext } from "@/lib/platform/stage-email-core";
```

Append this function at the end of the file (it mirrors `sendReengagementEmail` — refuses to send without a signable unsubscribe, because `unsubscribeLinkFor` throws when signing is unconfigured):

```ts
/**
 * A stage-specific re-engagement nudge for an inactive student. Like
 * sendReengagementEmail it will not send without a working unsubscribe: the
 * link is signed here, and a signing failure throws rather than sending
 * marketing with no way out.
 */
export async function sendInactiveStageEmail({
  displayName,
  to,
  stage,
  context,
}: {
  displayName?: string | null;
  to: string;
  stage: InactiveStage;
  context?: StageContext;
}) {
  const transporter = createTransporter();
  const fromAddress = process.env.CONTACT_FORM_AUTOREPLY_FROM ?? process.env.CONTACT_FORM_FROM ?? "NounCompass Support <support@nouncompass.me>";
  const siteUrl = siteBaseUrl();
  const unsubscribeUrl = unsubscribeLinkFor(to, "reengagement");
  const headers = unsubscribeHeadersFor(to, "reengagement");

  const { subject, html, text } = buildStageEmail({ stage, displayName, siteUrl, unsubscribeUrl, context });

  await transporter.sendMail({ from: fromAddress, to, headers, subject, text, html });
}
```

- [ ] **Step 2: Create `lib/platform/inactive-students.ts`**

```ts
import "server-only";

import { sendInactiveStageEmail } from "@/lib/contact-mail";
import { stageNotification, type InactiveStage, type StageContext } from "@/lib/platform/stage-email-core";
import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;

export type InactiveStudent = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  stage: InactiveStage;
  last_activity_at: string | null;
  context: StageContext;
};

export type InactiveParams = { quietDays: number; cooldownDays: number; limit: number };

// Quiet window defaults to 7 days per the design; cooldown/limit reuse the
// reengagement knobs so the cron and this panel agree.
const DEFAULTS: InactiveParams = { quietDays: 7, cooldownDays: 14, limit: 50 };

function knob(raw: string | undefined, fallback: number) {
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export function inactiveParamsFromEnv(): InactiveParams {
  return {
    quietDays: knob(process.env.REENGAGEMENT_QUIET_DAYS, DEFAULTS.quietDays),
    cooldownDays: knob(process.env.REENGAGEMENT_COOLDOWN_DAYS, DEFAULTS.cooldownDays),
    limit: knob(process.env.REENGAGEMENT_BATCH_LIMIT, DEFAULTS.limit),
  };
}

/** Shared with the reengagement dedupe key so a cron send and an admin send on
 * the same day collide on notifications(user_id, dedupe_key) instead of
 * double-emailing. */
export function inactiveRunDate(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

const STAGES: InactiveStage[] = ["s1", "s2", "s3", "s4"];

export async function countInactiveByStage(
  admin: AdminClient,
  params: InactiveParams,
): Promise<Record<InactiveStage, number>> {
  const { data, error } = await admin.rpc("count_inactive_students_by_stage", {
    p_quiet_days: params.quietDays,
    p_cooldown_days: params.cooldownDays,
  });
  if (error) throw new Error(error.message);
  const counts: Record<InactiveStage, number> = { s1: 0, s2: 0, s3: 0, s4: 0 };
  for (const row of (data ?? []) as { stage: string; count: number | string }[]) {
    if ((STAGES as string[]).includes(row.stage)) {
      counts[row.stage as InactiveStage] = Number(row.count) || 0;
    }
  }
  return counts;
}

export async function selectInactiveStudents(
  admin: AdminClient,
  params: InactiveParams,
  stage?: InactiveStage,
): Promise<InactiveStudent[]> {
  const { data, error } = await admin.rpc("select_inactive_students_by_stage", {
    p_quiet_days: params.quietDays,
    p_cooldown_days: params.cooldownDays,
    p_limit: params.limit,
    p_stage: stage ?? null,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as InactiveStudent[];
}

export type StageBatchResult = { candidates: number; emailed: number; failed: number };

/**
 * Emails each student once with their stage's template. Identical control flow
 * to sendReengagementBatch: the notification row (with stage-specific copy) is
 * written first, and its unique (user_id, dedupe_key) is what stops a retried
 * run — cron or admin — from emailing twice on the same day. emailed_at is set
 * only after SMTP succeeds, so a failure leaves the student eligible next time.
 * One bad address never stops the batch.
 */
export async function sendStageBatch(
  admin: AdminClient,
  runDate: string,
  students: InactiveStudent[],
): Promise<StageBatchResult> {
  const dedupeKey = `reengagement:${runDate}`;
  let emailed = 0;
  let failed = 0;

  for (const student of students) {
    if (!student.email) continue;
    const note = stageNotification(student.stage, student.context);
    const { error: insertError } = await admin.from("notifications").insert({
      user_id: student.user_id,
      kind: "reengagement",
      title: note.title,
      body: note.body,
      action_url: note.actionUrl,
      dedupe_key: dedupeKey,
    });
    if (insertError) continue;

    try {
      await sendInactiveStageEmail({
        to: student.email,
        displayName: student.display_name,
        stage: student.stage,
        context: student.context,
      });
      await admin
        .from("notifications")
        .update({ emailed_at: new Date().toISOString() })
        .eq("user_id", student.user_id)
        .eq("dedupe_key", dedupeKey);
      emailed += 1;
    } catch {
      failed += 1;
    }
  }

  return { candidates: students.length, emailed, failed };
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean. (No new test file — see the testing note above.)

- [ ] **Step 4: Confirm the existing suite still passes**

Run: `npm run test:platform`
Expected: unchanged green — this task adds no test but must not break imports.

- [ ] **Step 5: Commit**

```bash
git add lib/platform/inactive-students.ts lib/contact-mail.ts
git commit -m "Add stage-aware inactive-student selection and send batch"
```

---

### Task 4: Admin server actions (bulk + per-user)

**Files:**
- Modify: `app/admin/reengagement/actions.ts`

**Interfaces:**
- Consumes: `requirePermission` (`@/lib/platform/admin-auth`), `requireActionConfirmation` + `requireAdminReason` (`@/lib/platform/admin-workflows`), `writeAuditLog` (`@/lib/platform/audit`), `createAdminClient`, and Task 3's `inactiveParamsFromEnv`, `inactiveRunDate`, `selectInactiveStudents`, `sendStageBatch`, `InactiveStage`.
- Produces (called from Task 5's page): `sendStageCampaign(formData): Promise<void>`, `sendToOneStudent(formData): Promise<void>`.

**Ordering constraint:** this task **adds** the two new actions and keeps the existing `sendReengagementCampaign` intact, so the tree still builds (the current page still imports it). Task 5 removes `sendReengagementCampaign` when it rewrites its only caller.

**Testing note:** server actions in this repo are not unit-tested (the existing `sendReengagementCampaign` has none). Gate: `npx tsc --noEmit` + review. Do not fabricate a test harness for server actions.

- [ ] **Step 1: Add imports and helpers**

At the top of `app/admin/reengagement/actions.ts`, add these imports alongside the existing ones (keep the existing `reengagement` imports for now — Task 5 prunes them):

```ts
import {
  inactiveParamsFromEnv,
  inactiveRunDate,
  selectInactiveStudents,
  sendStageBatch,
} from "@/lib/platform/inactive-students";
import type { InactiveStage } from "@/lib/platform/stage-email-core";
```

Add a stage validator below the existing `value`/`fail` helpers:

```ts
const STAGES = ["s1", "s2", "s3", "s4"] as const;

function requireStage(raw: string): InactiveStage {
  if (!(STAGES as readonly string[]).includes(raw)) {
    throw new Error("Choose a valid stage.");
  }
  return raw as InactiveStage;
}
```

- [ ] **Step 2: Add `sendStageCampaign`**

```ts
/**
 * Bulk send to everyone currently in one stage. Like the legacy campaign it does
 * not read REENGAGEMENT_ENABLED: super-admin + the typed SEND confirmation is the
 * deliberate enable, and this never arms the cron. Same audience/cooldown/
 * unsubscribe guarantees via the shared batch.
 */
export async function sendStageCampaign(formData: FormData) {
  const session = await requirePermission("settings.manage", "/admin/reengagement");
  let redirectTo = "/admin/reengagement";
  try {
    const stage = requireStage(value(formData, "stage"));
    requireActionConfirmation(value(formData, "confirmation"), "SEND");
    const reason = requireAdminReason(value(formData, "reason"));
    const admin = createAdminClient();
    if (!admin) throw new Error("Platform database is not configured.");

    const params = inactiveParamsFromEnv();
    const runDate = inactiveRunDate();
    const students = await selectInactiveStudents(admin, params, stage);
    if (!students.length) throw new Error("No students are eligible in that stage right now.");

    const result = await sendStageBatch(admin, runDate, students);
    await writeAuditLog({
      actorId: session.user.id,
      action: "reengagement.sent",
      targetType: "email_campaign",
      targetId: runDate,
      reason,
      metadata: {
        stage,
        mode: "bulk",
        candidates: result.candidates,
        emailed: result.emailed,
        failed: result.failed,
        quiet_days: params.quietDays,
        cooldown_days: params.cooldownDays,
        batch_limit: params.limit,
      },
    });

    const summary = result.failed
      ? `${stage.toUpperCase()}: ${result.emailed} emailed, ${result.failed} failed`
      : `${stage.toUpperCase()}: ${result.emailed} emailed`;
    redirectTo =
      result.emailed === 0
        ? `/admin/reengagement?error=${encodeURIComponent(`No emails were sent — ${result.failed} attempt(s) failed. Check the SMTP configuration.`)}`
        : `/admin/reengagement?notice=${encodeURIComponent(summary)}`;
  } catch (error) {
    fail(error instanceof Error ? error.message : "Stage send failed.");
  }
  revalidatePath("/admin/reengagement");
  redirect(redirectTo);
}
```

- [ ] **Step 3: Add `sendToOneStudent`**

```ts
/**
 * One-off send to a single student in a stage. No typed SEND phrase (reserved
 * for bulk), but still super-admin only, still audited, and still gated by the
 * same eligibility + cooldown: the student is re-selected from the live
 * audience, so a no-longer-eligible id sends nothing.
 */
export async function sendToOneStudent(formData: FormData) {
  const session = await requirePermission("settings.manage", "/admin/reengagement");
  let redirectTo = "/admin/reengagement";
  try {
    const stage = requireStage(value(formData, "stage"));
    const userId = value(formData, "user_id");
    if (!userId) throw new Error("Missing the student to email.");
    const reason = requireAdminReason(value(formData, "reason") || "Individual re-engagement send");
    const admin = createAdminClient();
    if (!admin) throw new Error("Platform database is not configured.");

    const params = inactiveParamsFromEnv();
    const runDate = inactiveRunDate();
    const student = (await selectInactiveStudents(admin, params, stage)).find((s) => s.user_id === userId);
    if (!student) throw new Error("That student is no longer eligible (already emailed, opted out, or now active).");

    const result = await sendStageBatch(admin, runDate, [student]);
    await writeAuditLog({
      actorId: session.user.id,
      action: "reengagement.sent",
      targetType: "email_campaign",
      targetId: runDate,
      reason,
      metadata: { stage, mode: "single", user_id: userId, emailed: result.emailed, failed: result.failed },
    });

    redirectTo =
      result.emailed === 1
        ? `/admin/reengagement?notice=${encodeURIComponent("Sent 1 email.")}`
        : `/admin/reengagement?error=${encodeURIComponent("The email could not be sent (already nudged today, or SMTP failed).")}`;
  } catch (error) {
    fail(error instanceof Error ? error.message : "Individual send failed.");
  }
  revalidatePath("/admin/reengagement");
  redirect(redirectTo);
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add app/admin/reengagement/actions.ts
git commit -m "Add bulk and per-student stage send actions"
```

---

### Task 5: Admin page (stage view) + nav label

**Files:**
- Modify: `app/admin/reengagement/page.tsx` (full rewrite of the body)
- Modify: `app/admin/reengagement/actions.ts` (remove the now-dead `sendReengagementCampaign` + its unused imports)
- Modify: `app/admin/layout.tsx:27` (nav label → "Inactive students")

**Interfaces:**
- Consumes: Task 3's `inactiveParamsFromEnv`, `countInactiveByStage`, `selectInactiveStudents`; Task 1's `STAGE_META`, `InactiveStage`; Task 4's `sendStageCampaign`, `sendToOneStudent`; existing `AdminPageHeader`, `AdminFeedback`, `AdminStatCard`, `AdminDataTable`, `AdminConfirmationFields`, `AdminEmptyState`, `type AdminColumn`; `formatAdminDate` from `@/lib/platform/admin-format`.

**Ordering constraint:** this task removes `sendReengagementCampaign` (its only caller is this page, replaced here) in the same commit as the page rewrite, so the tree builds at the boundary.

**Testing note:** admin server components are not unit-tested here. Gate: `npx tsc --noEmit` + review + the manual smoke check in Step 5.

- [ ] **Step 1: Rewrite `app/admin/reengagement/page.tsx`**

```tsx
import {
  AdminConfirmationFields,
  AdminDataTable,
  AdminEmptyState,
  AdminFeedback,
  AdminPageHeader,
  AdminStatCard,
  type AdminColumn,
} from "@/components/admin/admin-ui";
import { requirePermission } from "@/lib/platform/admin-auth";
import { formatAdminDate } from "@/lib/platform/admin-format";
import {
  countInactiveByStage,
  inactiveParamsFromEnv,
  selectInactiveStudents,
  type InactiveStudent,
} from "@/lib/platform/inactive-students";
import { STAGE_META, type InactiveStage } from "@/lib/platform/stage-email-core";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendStageCampaign, sendToOneStudent } from "./actions";

export const dynamic = "force-dynamic";

const STAGE_ORDER: InactiveStage[] = ["s1", "s2", "s3", "s4"];

function clampQuiet(raw: string | undefined, fallback: number) {
  const value = Number(raw);
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.min(90, Math.round(value)));
}

function whereStopped(student: InactiveStudent) {
  const label = STAGE_META[student.stage].label;
  const course = student.context?.course_title?.trim();
  return student.stage === "s4" && course ? `${label} — ${course}` : label;
}

export default async function AdminReengagementPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string; quiet?: string }>;
}) {
  const params = await searchParams;
  await requirePermission("settings.manage", "/admin/reengagement");
  const admin = createAdminClient();
  const base = inactiveParamsFromEnv();
  const quietDays = clampQuiet(params.quiet, base.quietDays);
  const knobs = { ...base, quietDays };

  let counts: Record<InactiveStage, number> | null = null;
  let listsByStage: Partial<Record<InactiveStage, InactiveStudent[]>> = {};
  let previewError: string | null = null;

  if (!admin) {
    previewError = "Database is not configured.";
  } else {
    try {
      counts = await countInactiveByStage(admin, knobs);
      for (const stage of STAGE_ORDER) {
        if (counts[stage] > 0) {
          listsByStage[stage] = await selectInactiveStudents(admin, knobs, stage);
        }
      }
    } catch (error) {
      previewError = error instanceof Error ? error.message : "Could not read the audience.";
    }
  }

  const cronEnabled = process.env.REENGAGEMENT_ENABLED === "true";

  const columns = (stage: InactiveStage): AdminColumn<InactiveStudent>[] => [
    {
      key: "student",
      header: "Student",
      render: (s) => (
        <>
          <strong>{s.display_name || s.email || "Unknown"}</strong>
          <small>{s.email ?? "No email on file"}</small>
        </>
      ),
    },
    { key: "stopped", header: "Where they stopped", render: (s) => whereStopped(s) },
    {
      key: "last",
      header: "Last active",
      render: (s) => (s.last_activity_at ? formatAdminDate(s.last_activity_at) : "No activity yet"),
    },
    {
      key: "send",
      header: "Action",
      render: (s) =>
        s.email ? (
          <form action={sendToOneStudent}>
            <input type="hidden" name="stage" value={stage} />
            <input type="hidden" name="user_id" value={s.user_id} />
            <input type="hidden" name="reason" value={`Individual ${stage.toUpperCase()} re-engagement`} />
            <button className="admin-button admin-button-small" type="submit">Send</button>
          </form>
        ) : (
          <span>—</span>
        ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Lifecycle email"
        title="Inactive students"
        description={`Students who signed up, went quiet for ${quietDays}+ days, and are grouped by the furthest step they reached. Sending here carries a one-click unsubscribe and a ${knobs.cooldownDays}-day cooldown, and never turns the daily cron on or off.`}
      />
      <AdminFeedback error={params.error ?? previewError ?? undefined} notice={params.notice} />

      <section className="admin-panel">
        <form className="admin-filters" method="get">
          <label>
            Quiet for at least (days)
            <input name="quiet" type="number" min={1} max={90} defaultValue={quietDays} />
          </label>
          <div className="admin-filter-actions">
            <button className="admin-button" type="submit">Apply</button>
          </div>
        </form>
      </section>

      <section className="admin-stat-grid" aria-label="Inactive stages">
        {STAGE_ORDER.map((stage) => (
          <AdminStatCard
            key={stage}
            label={STAGE_META[stage].label}
            value={counts ? counts[stage] : "—"}
            detail={STAGE_META[stage].blurb}
            unavailable={counts === null}
          />
        ))}
        <AdminStatCard
          label="Automatic daily cron"
          value={cronEnabled ? "On" : "Off"}
          detail={cronEnabled ? "The daily job also nudges never-started students" : "REENGAGEMENT_ENABLED is not set to true"}
        />
      </section>

      {STAGE_ORDER.map((stage) => {
        const rows = listsByStage[stage] ?? [];
        const count = counts ? counts[stage] : 0;
        if (!count) return null;
        const capped = count > rows.length;
        return (
          <section className="admin-panel" key={stage} aria-label={STAGE_META[stage].label}>
            <div className="admin-panel-heading">
              <div>
                <span className="eyebrow">{stage.toUpperCase()}</span>
                <h2>{STAGE_META[stage].label} · {count}</h2>
              </div>
            </div>

            <form action={sendStageCampaign} className="admin-form">
              <input type="hidden" name="stage" value={stage} />
              <p>
                This emails the <strong>{rows.length}</strong> eligible student
                {rows.length === 1 ? "" : "s"} shown below
                {capped ? ` (of ${count} in this stage; capped at ${knobs.limit} per send)` : ""}.
                Each carries a one-click unsubscribe and a {knobs.cooldownDays}-day hold.
              </p>
              <AdminConfirmationFields phrase="SEND" reasonLabel={`Why send to ${STAGE_META[stage].label}?`} />
              <button className="admin-button" type="submit">Send to all of {stage.toUpperCase()}</button>
            </form>

            <AdminDataTable
              caption={`${STAGE_META[stage].label} — inactive students`}
              columns={columns(stage)}
              rows={rows}
              rowKey={(s) => s.user_id}
              emptyTitle="No one to email"
              emptyDescription="No eligible students in this stage right now."
            />
          </section>
        );
      })}

      {counts && STAGE_ORDER.every((stage) => counts![stage] === 0) ? (
        <AdminEmptyState
          title="No inactive students"
          description="No verified, opted-in students are quiet and outside the cooldown window at this threshold."
        />
      ) : null}
    </>
  );
}
```

- [ ] **Step 2: Remove the dead legacy action**

In `app/admin/reengagement/actions.ts`, delete the entire `sendReengagementCampaign` function and remove the now-unused imports `reengagementParamsFromEnv`, `reengagementRunDate`, `selectReengagementCandidates`, `sendReengagementBatch` (from `@/lib/platform/reengagement`). Keep everything Task 4 added. (The cron in `app/api/cron/daily/route.ts` imports those from `reengagement.ts` directly and is unaffected.)

- [ ] **Step 3: Update the nav label**

In `app/admin/layout.tsx`, line 27, change the label only (leave href and permission):

```ts
  ["Inactive students", "/admin/reengagement", "settings.manage"],
```

- [ ] **Step 4: Typecheck and full suite**

Run: `npx tsc --noEmit` then `npm run test:platform`
Expected: typecheck clean; full suite green. Confirm no remaining reference to `sendReengagementCampaign` anywhere:
Run: `grep -rn "sendReengagementCampaign" app lib` → expected: no matches.

- [ ] **Step 5: Manual smoke check (build only — no real email)**

Run: `npm run build`
Expected: the build compiles the `/admin/reengagement` route with no type or import errors. Do **not** trigger a real send here; live sending is gated behind the deployed super-admin UI and must follow the audience-count verification in the spec.

- [ ] **Step 6: Commit**

```bash
git add app/admin/reengagement/page.tsx app/admin/reengagement/actions.ts app/admin/layout.tsx
git commit -m "Show inactive students by stage with bulk and per-student send"
```

---

## Self-Review

**Spec coverage:**
- Four-stage funnel + "gone quiet N days" → Task 2 (SQL classifier).
- Admin view with per-stage counts + drill-down (where stopped + last active) → Task 5.
- Bulk-per-stage send + per-user send → Task 4 (actions) + Task 5 (forms).
- Fixed per-stage templates with name + where-stopped personalization → Task 1.
- Reuse consent/unsubscribe/cooldown/dedupe → Task 3 (`kind='reengagement'`, shared `reengagement:${runDate}` key, cooldown in the RPC).
- Exclude activated + staff; off-by-default cron unchanged → Task 2 (filters) + Global Constraints + Task 4 (no `REENGAGEMENT_ENABLED` read).
- Count/list semantics = eligible-to-email; per-row send skips `SEND`; quiet default 7 (clamped 1–90) → Tasks 2/4/5, matching the spec's Open Decisions.

**Placeholder scan:** no TBD/TODO; every code step carries complete code.

**Type consistency:** `InactiveStage`/`StageContext` defined in Task 1 and imported everywhere; `InactiveStudent`/`InactiveParams` defined in Task 3 and consumed by Tasks 4–5; RPC names (`select_inactive_students_by_stage`, `count_inactive_students_by_stage`) identical in Tasks 2 and 3; `sendStageCampaign`/`sendToOneStudent` signatures match between Task 4 (definition) and Task 5 (form `action={}`); notification `action_url` is relative in both `stageNotification` (Task 1) and its use (Task 3).

**Test distribution (deliberate):** Task 1 (pure templates) carries full automated tests. Tasks 2–5 (SQL, server-only glue, server actions, server component) are gated by `tsc` + review + documented manual/sanity checks, consistent with this codebase's existing conventions (`reengagement.ts`, `sendReengagementCampaign`, and admin pages have no unit tests). This is called out per-task so a reviewer treats it as intentional, not a gap.

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-08-11-inactive-students-by-stage.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**




