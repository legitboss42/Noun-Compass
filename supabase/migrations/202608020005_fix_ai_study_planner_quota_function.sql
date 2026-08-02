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

  select usage.* into v_usage
  from public.ai_study_planner_usage as usage
  where usage.user_id = p_user_id
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
    update public.ai_study_planner_usage as usage
    set window_started_at = v_window_start,
        generation_count = 1,
        updated_at = now()
    where usage.user_id = p_user_id;

    return query select true, 1, v_window_start;
    return;
  end if;

  if v_usage.generation_count >= p_weekly_limit then
    return query select false, v_usage.generation_count, v_window_start;
    return;
  end if;

  update public.ai_study_planner_usage as usage
  set generation_count = usage.generation_count + 1,
      updated_at = now()
  where usage.user_id = p_user_id
  returning usage.generation_count into v_usage.generation_count;

  return query select true, v_usage.generation_count, v_window_start;
end;
$$;

revoke all on function public.claim_ai_study_planner_weekly_generation(uuid, integer) from public, anon, authenticated;
grant execute on function public.claim_ai_study_planner_weekly_generation(uuid, integer) to service_role;

