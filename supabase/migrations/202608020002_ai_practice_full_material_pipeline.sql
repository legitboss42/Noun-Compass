create table if not exists public.ai_material_manifests (
  id uuid primary key default gen_random_uuid(),
  material_key text not null,
  course_code text not null,
  course_title text not null,
  material_url text not null,
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  page_count integer not null check (page_count > 0),
  chunk_count integer not null check (chunk_count > 0),
  status text not null default 'ready' check (status in ('extracting', 'ready', 'failed')),
  extracted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (material_key, content_hash)
);

create table if not exists public.ai_material_chunks (
  id uuid primary key default gen_random_uuid(),
  manifest_id uuid not null references public.ai_material_manifests(id) on delete cascade,
  chunk_index integer not null check (chunk_index >= 0),
  heading text not null check (char_length(heading) between 1 and 180),
  page_start integer not null check (page_start > 0),
  page_end integer not null check (page_end >= page_start),
  char_count integer not null check (char_count > 0),
  chunk_text text not null,
  created_at timestamptz not null default now(),
  unique (manifest_id, chunk_index)
);

alter table public.ai_practice_sessions
  add column if not exists material_manifest_id uuid references public.ai_material_manifests(id) on delete set null,
  add column if not exists batch_count integer not null default 0,
  add column if not exists completed_batch_count integer not null default 0,
  add column if not exists coverage_manifest jsonb not null default '{}'::jsonb,
  add column if not exists generation_error text;

alter table public.ai_practice_sessions
  drop constraint if exists ai_practice_sessions_status_check;

alter table public.ai_practice_sessions
  add constraint ai_practice_sessions_status_check
  check (status in ('generating', 'active', 'completed', 'abandoned', 'failed'));

alter table public.ai_practice_sessions
  drop constraint if exists ai_practice_sessions_batch_count_check;

alter table public.ai_practice_sessions
  add constraint ai_practice_sessions_batch_count_check
  check (batch_count between 0 and 100 and completed_batch_count between 0 and batch_count);

create table if not exists public.ai_practice_generation_batches (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ai_practice_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  batch_index integer not null check (batch_index >= 0),
  target_count integer not null check (target_count between 1 and 15),
  coverage jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'generating', 'completed', 'failed')),
  attempt_count integer not null default 0 check (attempt_count between 0 and 5),
  questions jsonb not null default '[]'::jsonb,
  model text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, batch_index)
);

create index if not exists ai_material_manifest_key_extracted_idx
  on public.ai_material_manifests(material_key, extracted_at desc);

create index if not exists ai_material_chunks_manifest_idx
  on public.ai_material_chunks(manifest_id, chunk_index);

create index if not exists ai_practice_batches_session_status_idx
  on public.ai_practice_generation_batches(session_id, status, batch_index);

alter table public.ai_material_manifests enable row level security;
alter table public.ai_material_chunks enable row level security;
alter table public.ai_practice_generation_batches enable row level security;

revoke all on table public.ai_material_manifests from public, anon, authenticated;
revoke all on table public.ai_material_chunks from public, anon, authenticated;
revoke all on table public.ai_practice_generation_batches from public, anon, authenticated;

grant select, insert, update, delete on table public.ai_material_manifests to service_role;
grant select, insert, update, delete on table public.ai_material_chunks to service_role;
grant select, insert, update, delete on table public.ai_practice_generation_batches to service_role;

revoke select, insert, update on table public.ai_practice_sessions from authenticated;
grant select (
  id,
  user_id,
  material_key,
  course_code,
  course_title,
  material_url,
  source_label,
  mode,
  difficulty,
  question_count,
  status,
  score,
  model,
  error_message,
  created_at,
  completed_at,
  material_manifest_id,
  batch_count,
  completed_batch_count,
  generation_error
) on table public.ai_practice_sessions to authenticated;

create or replace function public.claim_ai_practice_generation_batch(
  p_session_id uuid,
  p_user_id uuid
)
returns table (
  id uuid,
  batch_index integer,
  target_count integer,
  coverage jsonb,
  attempt_count integer
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_batch_id uuid;
begin
  if p_session_id is null or p_user_id is null then
    raise exception 'Invalid practice batch claim';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_session_id::text, 0));

  update public.ai_practice_generation_batches as stale
  set status = 'failed',
      error_message = 'Generation was interrupted and can be resumed.',
      updated_at = now()
  where stale.session_id = p_session_id
    and stale.user_id = p_user_id
    and stale.status = 'generating'
    and stale.updated_at < now() - interval '5 minutes'
    and stale.attempt_count < 5;

  select candidate.id into v_batch_id
  from public.ai_practice_generation_batches as candidate
  where candidate.session_id = p_session_id
    and candidate.user_id = p_user_id
    and candidate.status in ('pending', 'failed')
    and candidate.attempt_count < 5
    and exists (
      select 1
      from public.ai_practice_sessions as session
      where session.id = candidate.session_id
        and session.user_id = p_user_id
        and session.status = 'generating'
    )
  order by candidate.batch_index
  for update skip locked
  limit 1;

  if v_batch_id is null then
    return;
  end if;

  return query
  update public.ai_practice_generation_batches as claimed
  set status = 'generating',
      attempt_count = claimed.attempt_count + 1,
      error_message = null,
      started_at = now(),
      updated_at = now()
  where claimed.id = v_batch_id
  returning claimed.id, claimed.batch_index, claimed.target_count, claimed.coverage, claimed.attempt_count;
end;
$$;

revoke all on function public.claim_ai_practice_generation_batch(uuid, uuid) from public, anon, authenticated;
grant execute on function public.claim_ai_practice_generation_batch(uuid, uuid) to service_role;
