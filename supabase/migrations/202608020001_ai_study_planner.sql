alter table public.study_plans
  add column if not exists ai_plan_payload jsonb not null default '{}'::jsonb,
  add column if not exists ai_model text,
  add column if not exists ai_generated_at timestamptz,
  add column if not exists ai_generation_window_started_at timestamptz,
  add column if not exists ai_generation_count integer not null default 0;

alter table public.study_plans
  drop constraint if exists study_plans_ai_generation_count_check;

alter table public.study_plans
  add constraint study_plans_ai_generation_count_check
  check (ai_generation_count between 0 and 100);

create index if not exists study_plans_ai_generated_idx
  on public.study_plans(user_id, ai_generated_at desc);

create table if not exists public.ai_study_planner_usage (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null,
  generation_count integer not null default 0 check (generation_count between 0 and 100),
  updated_at timestamptz not null default now()
);

alter table public.ai_study_planner_usage enable row level security;

revoke all on table public.ai_study_planner_usage from public;
revoke all on table public.ai_study_planner_usage from anon;
revoke all on table public.ai_study_planner_usage from authenticated;
grant select, insert, update, delete on table public.ai_study_planner_usage to service_role;

drop function if exists public.claim_ai_study_planner_generation(uuid, integer);

create or replace function public.claim_ai_study_planner_weekly_generation(
  p_user_id uuid,
  p_weekly_limit integer
)
returns table (
  allowed boolean,
  generation_count integer,
  window_started_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_window_start timestamptz := date_trunc('week', timezone('Africa/Lagos', now())) at time zone 'Africa/Lagos';
  v_usage public.ai_study_planner_usage%rowtype;
begin
  if p_user_id is null or p_weekly_limit < 1 or p_weekly_limit > 20 then
    raise exception 'Invalid AI planner quota request';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));

  select * into v_usage
  from public.ai_study_planner_usage
  where user_id = p_user_id
  for update;

  if not found then
    insert into public.ai_study_planner_usage (
      user_id,
      window_started_at,
      generation_count
    ) values (
      p_user_id,
      v_window_start,
      1
    )
    returning * into v_usage;

    return query select true, 1, v_window_start;
    return;
  end if;

  if v_usage.window_started_at < v_window_start then
    update public.ai_study_planner_usage
    set window_started_at = v_window_start,
        generation_count = 1,
        updated_at = now()
    where user_id = p_user_id;

    return query select true, 1, v_window_start;
    return;
  end if;

  if v_usage.generation_count >= p_weekly_limit then
    return query select false, v_usage.generation_count, v_window_start;
    return;
  end if;

  update public.ai_study_planner_usage
  set generation_count = generation_count + 1,
      updated_at = now()
  where user_id = p_user_id
  returning generation_count into v_usage.generation_count;

  return query select true, v_usage.generation_count, v_window_start;
end;
$$;

revoke all on function public.claim_ai_study_planner_weekly_generation(uuid, integer) from public;
revoke all on function public.claim_ai_study_planner_weekly_generation(uuid, integer) from anon;
revoke all on function public.claim_ai_study_planner_weekly_generation(uuid, integer) from authenticated;
grant execute on function public.claim_ai_study_planner_weekly_generation(uuid, integer) to service_role;
