create table if not exists public.ai_practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  material_key text not null,
  course_code text not null,
  course_title text not null,
  material_url text not null,
  source_label text not null default 'Official NOUN eCourseware',
  mode text not null default 'quick-practice' check (mode in ('quick-practice', 'revision-quiz', 'mock-style')),
  difficulty smallint not null default 1 check (difficulty between 1 and 3),
  question_count integer not null check (question_count between 1 and 15),
  generated_questions jsonb not null,
  responses jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  score integer,
  model text,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists ai_practice_sessions_user_created_idx
  on public.ai_practice_sessions(user_id, created_at desc);

create index if not exists ai_practice_sessions_course_created_idx
  on public.ai_practice_sessions(course_code, created_at desc);

alter table public.ai_practice_sessions enable row level security;

drop policy if exists "ai practice sessions own read" on public.ai_practice_sessions;
create policy "ai practice sessions own read"
on public.ai_practice_sessions
for select
to authenticated
using (user_id = auth.uid() or public.is_staff());

drop policy if exists "ai practice sessions own insert" on public.ai_practice_sessions;
create policy "ai practice sessions own insert"
on public.ai_practice_sessions
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "ai practice sessions own update" on public.ai_practice_sessions;
create policy "ai practice sessions own update"
on public.ai_practice_sessions
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant select, insert, update on table public.ai_practice_sessions to authenticated;
grant select, insert, update, delete on table public.ai_practice_sessions to service_role;

