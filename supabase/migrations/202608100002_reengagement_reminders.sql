-- Re-engagement nudges for students who signed up but never started.
--
-- The flag defaults to true, matching study/deadline/revision/membership
-- reminders rather than product_updates. The distinction is deliberate:
-- product_updates is marketing to a list, while this is a lifecycle message to
-- someone who created an account and asked us to help them study. Every send
-- carries a one-click unsubscribe, and clearing it is what turns this off.
alter table public.email_preferences
  add column if not exists reengagement_reminders boolean not null default true;

-- Candidate selection lives in SQL because it spans auth.users and four
-- activity tables. Doing it over PostgREST would mean pulling every user into
-- the function and filtering in TypeScript.
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
  select u.id, u.email::text, coalesce(p.display_name, '')
  from auth.users u
  join public.email_preferences ep on ep.user_id = u.id
  left join public.profiles p on p.id = u.id
  where u.email_confirmed_at is not null
    and u.created_at <= now() - make_interval(days => greatest(p_grace_days, 0))
    and ep.reengagement_reminders = true
    -- Onboarding does not count as activity. Someone who filled in their
    -- programme and then never opened a tool is exactly who this is for.
    and not exists (select 1 from public.user_tool_activity a where a.user_id = u.id)
    and not exists (select 1 from public.practice_sessions s where s.user_id = u.id)
    and not exists (select 1 from public.ai_practice_sessions s where s.user_id = u.id)
    and not exists (select 1 from public.study_plans sp where sp.user_id = u.id)
    and not exists (
      select 1 from public.notifications n
      where n.user_id = u.id
        and n.kind = 'reengagement'
        and n.emailed_at is not null
        and n.emailed_at >= now() - make_interval(days => greatest(p_cooldown_days, 1))
    )
  order by u.created_at asc
  limit greatest(least(p_limit, 500), 0);
$$;

revoke all on function public.select_reengagement_candidates(integer, integer, integer)
  from public, anon, authenticated;
grant execute on function public.select_reengagement_candidates(integer, integer, integer)
  to service_role;

-- Sanity check before enabling the cron. Run with the service role:
--   select count(*) from public.select_reengagement_candidates(3, 14, 500);
-- Compare against total verified accounts to confirm the filter is not
-- selecting active students:
--   select count(*) from auth.users where email_confirmed_at is not null;
