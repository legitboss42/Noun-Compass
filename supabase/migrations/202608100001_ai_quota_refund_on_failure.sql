-- Failed AI requests were permanently consuming student allowance.
--
-- claim_ai_feature_request inserted a usage row before the provider call, and
-- the counting query counted every row in the window regardless of status. The
-- application marked the row 'failed' when the call errored, but nothing read
-- that column, so a provider outage silently spent a student's whole daily
-- allowance and, on the free tier, their entire day.
--
-- A request now counts only once it has produced an answer. Failures never
-- count, and a request still 'pending' well past any provider timeout is
-- treated as abandoned rather than delivered.
--
-- Refunding without limit would be its own hole: a provider that returns an
-- empty completion has still generated and billed the tokens, so unlimited
-- retries would spend real money against a quota that never advances. Each
-- account and the platform therefore keep a small allowance of extra attempts,
-- after which the window closes regardless of outcome.

drop function if exists public.claim_ai_feature_request(uuid, text, text, timestamptz, integer, integer);

create or replace function public.claim_ai_feature_request(
  p_user_id uuid,
  p_feature text,
  p_request_hash text,
  p_window_started_at timestamptz,
  p_user_limit integer,
  p_global_limit integer,
  p_user_attempt_grace integer default 3,
  p_global_attempt_grace integer default 25
)
returns table (allowed boolean, usage_id uuid, user_count integer, global_count integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_count integer;
  v_user_attempts integer;
  v_global_count integer;
  v_global_attempts integer;
  v_usage_id uuid;
  -- Every caller aborts its provider fetch well inside this, so a row still
  -- pending afterwards belongs to a request that died with its server.
  v_pending_grace constant interval := interval '15 minutes';
begin
  if p_user_id is null or p_feature is null or p_user_limit < 1 or p_global_limit < 1 then
    raise exception 'Invalid AI quota request';
  end if;
  if p_user_attempt_grace < 0 or p_global_attempt_grace < 0 then
    raise exception 'Invalid AI quota attempt grace';
  end if;

  perform pg_advisory_xact_lock(hashtext('ai-feature:' || p_user_id::text || ':' || p_feature));
  perform pg_advisory_xact_lock(hashtext('ai-feature-global:' || p_window_started_at::date::text));

  select
    count(*) filter (
      where usage.status = 'completed'
         or (usage.status = 'pending' and usage.created_at > now() - v_pending_grace)
    )::integer,
    count(*)::integer
  into v_user_count, v_user_attempts
  from public.ai_feature_usage as usage
  where usage.user_id = p_user_id
    and usage.feature = p_feature
    and usage.created_at >= p_window_started_at;

  select
    count(*) filter (
      where usage.status = 'completed'
         or (usage.status = 'pending' and usage.created_at > now() - v_pending_grace)
    )::integer,
    count(*)::integer
  into v_global_count, v_global_attempts
  from public.ai_feature_usage as usage
  where usage.created_at >= p_window_started_at;

  if v_user_count >= p_user_limit
    or v_global_count >= p_global_limit
    or v_user_attempts >= p_user_limit + p_user_attempt_grace
    or v_global_attempts >= p_global_limit + p_global_attempt_grace
  then
    return query select false, null::uuid, v_user_count, v_global_count;
    return;
  end if;

  insert into public.ai_feature_usage (user_id, feature, request_hash)
  values (p_user_id, p_feature, p_request_hash)
  returning id into v_usage_id;

  return query select true, v_usage_id, v_user_count + 1, v_global_count + 1;
end;
$$;

revoke all on function public.claim_ai_feature_request(uuid, text, text, timestamptz, integer, integer, integer, integer)
  from public, anon, authenticated;
grant execute on function public.claim_ai_feature_request(uuid, text, text, timestamptz, integer, integer, integer, integer)
  to service_role;

-- The study planner burns a weekly slot the same way, and a free account holds
-- exactly one per week: a single provider failure cost a student every AI
-- timetable until the following Monday. The planner falls back to the
-- deterministic schedule in that case, which needs no quota, so the slot goes
-- back. Only the claiming window may be released, so a release arriving after
-- the week has rolled over cannot refund against the new one.
create or replace function public.release_ai_study_planner_weekly_generation(
  p_user_id uuid,
  p_window_started_at timestamptz
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_generation_count integer;
begin
  if p_user_id is null or p_window_started_at is null then
    raise exception 'Invalid AI planner quota release';
  end if;

  -- Same key the claim takes, so a release cannot interleave with a claim.
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));

  update public.ai_study_planner_usage as usage
  set generation_count = usage.generation_count - 1,
      updated_at = now()
  where usage.user_id = p_user_id
    and usage.window_started_at = p_window_started_at
    and usage.generation_count > 0
  returning usage.generation_count into v_generation_count;

  if v_generation_count is null then
    select usage.generation_count into v_generation_count
    from public.ai_study_planner_usage as usage
    where usage.user_id = p_user_id;
  end if;

  return coalesce(v_generation_count, 0);
end;
$$;

revoke all on function public.release_ai_study_planner_weekly_generation(uuid, timestamptz)
  from public, anon, authenticated;
grant execute on function public.release_ai_study_planner_weekly_generation(uuid, timestamptz)
  to service_role;
