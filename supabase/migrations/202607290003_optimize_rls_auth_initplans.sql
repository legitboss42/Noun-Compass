-- Optimize RLS policies flagged by Supabase's auth_rls_initplan lint.
--
-- The access rules are intentionally unchanged. Direct auth/helper calls are
-- wrapped in scalar subselects so PostgreSQL can evaluate them once per
-- statement instead of once per row.

drop policy if exists "profiles own read" on public.profiles;
create policy "profiles own read"
on public.profiles
for select
using (id = (select auth.uid()) or (select public.is_staff()));

drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own update"
on public.profiles
for update
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists "profiles own insert" on public.profiles;
create policy "profiles own insert"
on public.profiles
for insert
to authenticated
with check (id = (select auth.uid()));

drop policy if exists "roles own read" on public.user_roles;
create policy "roles own read"
on public.user_roles
for select
using (user_id = (select auth.uid()) or (select public.has_role('super_admin')));

drop policy if exists "preferences own" on public.email_preferences;
create policy "preferences own"
on public.email_preferences
for all
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "sessions own" on public.practice_sessions;
create policy "sessions own"
on public.practice_sessions
for all
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "responses own" on public.practice_responses;
create policy "responses own"
on public.practice_responses
for all
using (
  exists (
    select 1
    from public.practice_sessions s
    where s.id = session_id
      and s.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.practice_sessions s
    where s.id = session_id
      and s.user_id = (select auth.uid())
  )
);

drop policy if exists "session questions own read" on public.practice_session_questions;
create policy "session questions own read"
on public.practice_session_questions
for select
using (
  exists (
    select 1
    from public.practice_sessions s
    where s.id = session_id
      and s.user_id = (select auth.uid())
  )
);

drop policy if exists "revision own" on public.revision_state;
create policy "revision own"
on public.revision_state
for all
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "attempts own read" on public.payment_attempts;
create policy "attempts own read"
on public.payment_attempts
for select
using (user_id = (select auth.uid()) or (select public.has_role('super_admin')));

drop policy if exists "memberships own read" on public.memberships;
create policy "memberships own read"
on public.memberships
for select
using (user_id = (select auth.uid()) or (select public.has_role('super_admin')));

drop policy if exists "tickets own or staff" on public.support_tickets;
create policy "tickets own or staff"
on public.support_tickets
for select
using (user_id = (select auth.uid()) or (select public.is_staff()));

drop policy if exists "tickets own insert" on public.support_tickets;
create policy "tickets own insert"
on public.support_tickets
for insert
with check (user_id = (select auth.uid()));

drop policy if exists "ticket messages read" on public.support_messages;
create policy "ticket messages read"
on public.support_messages
for select
to authenticated
using (
  (
    internal_note = false
    and exists (
      select 1
      from public.support_tickets ticket
      where ticket.id = ticket_id
        and (ticket.user_id = (select auth.uid()) or (select public.is_staff()))
    )
  )
  or (
    internal_note = true
    and (select public.is_staff())
  )
);

drop policy if exists "ticket messages insert" on public.support_messages;
create policy "ticket messages insert"
on public.support_messages
for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and (internal_note = false or (select public.is_staff()))
  and exists (
    select 1
    from public.support_tickets ticket
    where ticket.id = ticket_id
      and (ticket.user_id = (select auth.uid()) or (select public.is_staff()))
  )
);

drop policy if exists "notifications own" on public.notifications;
create policy "notifications own"
on public.notifications
for select
using (user_id = (select auth.uid()));

drop policy if exists "notifications own update" on public.notifications;
create policy "notifications own update"
on public.notifications
for update
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "bookmarks own" on public.question_bookmarks;
create policy "bookmarks own"
on public.question_bookmarks
for all
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "reports own read" on public.question_reports;
create policy "reports own read"
on public.question_reports
for select
to authenticated
using (user_id = (select auth.uid()) or (select public.is_staff()));

drop policy if exists "reports own insert" on public.question_reports;
create policy "reports own insert"
on public.question_reports
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.question_versions v
    where v.id = question_version_id
      and v.question_id = question_id
  )
  and (
    session_id is null
    or exists (
      select 1
      from public.practice_sessions s
      where s.id = session_id
        and s.user_id = (select auth.uid())
    )
  )
);

drop policy if exists "study plans own access" on public.study_plans;
create policy "study plans own access"
on public.study_plans
for all
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "study sessions own access" on public.study_plan_sessions;
create policy "study sessions own access"
on public.study_plan_sessions
for all
using (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.study_plans
    where study_plans.id = study_plan_sessions.plan_id
      and study_plans.user_id = (select auth.uid())
  )
)
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.study_plans
    where study_plans.id = study_plan_sessions.plan_id
      and study_plans.user_id = (select auth.uid())
  )
);

drop policy if exists "ai practice sessions own read" on public.ai_practice_sessions;
create policy "ai practice sessions own read"
on public.ai_practice_sessions
for select
to authenticated
using (user_id = (select auth.uid()) or (select public.is_staff()));

drop policy if exists "ai practice sessions own insert" on public.ai_practice_sessions;
create policy "ai practice sessions own insert"
on public.ai_practice_sessions
for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "ai practice sessions own update" on public.ai_practice_sessions;
create policy "ai practice sessions own update"
on public.ai_practice_sessions
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "tool activity own read" on public.user_tool_activity;
create policy "tool activity own read"
on public.user_tool_activity
for select
to authenticated
using (user_id = (select auth.uid()) or (select public.is_staff()));

drop policy if exists "tool activity own write" on public.user_tool_activity;
create policy "tool activity own write"
on public.user_tool_activity
for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "tool activity own update" on public.user_tool_activity;
create policy "tool activity own update"
on public.user_tool_activity
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "course material summaries own read" on public.course_material_summaries;
create policy "course material summaries own read"
on public.course_material_summaries
for select
to authenticated
using (user_id = (select auth.uid()) or (select public.is_staff()));

drop policy if exists "course material summaries own insert" on public.course_material_summaries;
create policy "course material summaries own insert"
on public.course_material_summaries
for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "course material summaries own update" on public.course_material_summaries;
create policy "course material summaries own update"
on public.course_material_summaries
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));
