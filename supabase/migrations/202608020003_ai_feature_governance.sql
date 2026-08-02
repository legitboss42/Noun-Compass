create table if not exists public.ai_feature_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null check (feature in (
    'performance-coach', 'course-qa', 'answer-explanation',
    'admission-guidance', 'fee-explanation', 'academic-support',
    'support-draft', 'admin-content-review'
  )),
  request_hash text not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  provider text,
  model text,
  input_chars integer not null default 0 check (input_chars >= 0),
  output_chars integer not null default 0 check (output_chars >= 0),
  error_code text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists ai_feature_usage_user_feature_created_idx
  on public.ai_feature_usage(user_id, feature, created_at desc);
create index if not exists ai_feature_usage_created_idx
  on public.ai_feature_usage(created_at desc);

create table if not exists public.ai_feature_cache (
  cache_key text primary key,
  feature text not null,
  user_id uuid references auth.users(id) on delete cascade,
  response_json jsonb not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_feature_cache_expiry_idx
  on public.ai_feature_cache(expires_at);
create index if not exists ai_feature_cache_user_feature_idx
  on public.ai_feature_cache(user_id, feature, updated_at desc);

alter table public.ai_feature_usage enable row level security;
alter table public.ai_feature_cache enable row level security;

revoke all on table public.ai_feature_usage from public, anon, authenticated;
revoke all on table public.ai_feature_cache from public, anon, authenticated;
grant select, insert, update, delete on table public.ai_feature_usage to service_role;
grant select, insert, update, delete on table public.ai_feature_cache to service_role;

create or replace function public.claim_ai_feature_request(
  p_user_id uuid,
  p_feature text,
  p_request_hash text,
  p_window_started_at timestamptz,
  p_user_limit integer,
  p_global_limit integer
)
returns table (allowed boolean, usage_id uuid, user_count integer, global_count integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_count integer;
  v_global_count integer;
  v_usage_id uuid;
begin
  if p_user_id is null or p_feature is null or p_user_limit < 1 or p_global_limit < 1 then
    raise exception 'Invalid AI quota request';
  end if;

  perform pg_advisory_xact_lock(hashtext('ai-feature:' || p_user_id::text || ':' || p_feature));
  perform pg_advisory_xact_lock(hashtext('ai-feature-global:' || p_window_started_at::date::text));

  select count(*)::integer into v_user_count
  from public.ai_feature_usage
  where user_id = p_user_id
    and feature = p_feature
    and created_at >= p_window_started_at;

  select count(*)::integer into v_global_count
  from public.ai_feature_usage
  where created_at >= p_window_started_at;

  if v_user_count >= p_user_limit or v_global_count >= p_global_limit then
    return query select false, null::uuid, v_user_count, v_global_count;
    return;
  end if;

  insert into public.ai_feature_usage (user_id, feature, request_hash)
  values (p_user_id, p_feature, p_request_hash)
  returning id into v_usage_id;

  return query select true, v_usage_id, v_user_count + 1, v_global_count + 1;
end;
$$;

revoke all on function public.claim_ai_feature_request(uuid, text, text, timestamptz, integer, integer)
  from public, anon, authenticated;
grant execute on function public.claim_ai_feature_request(uuid, text, text, timestamptz, integer, integer)
  to service_role;

-- Keep expired cached answers and old usage rows from growing indefinitely.
-- The existing daily cron may safely execute these bounded deletes with the service role.
