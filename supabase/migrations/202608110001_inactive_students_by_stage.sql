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