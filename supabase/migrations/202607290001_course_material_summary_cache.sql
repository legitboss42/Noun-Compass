create table if not exists public.course_material_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  material_key text not null,
  course_code text not null,
  course_title text not null,
  material_title text not null,
  material_url text not null,
  source_label text not null default 'Official NOUN eCourseware',
  model text,
  summary_payload jsonb not null,
  generated_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, material_key)
);

create index if not exists course_material_summaries_user_expires_idx
  on public.course_material_summaries(user_id, expires_at desc);

create index if not exists course_material_summaries_user_course_idx
  on public.course_material_summaries(user_id, course_code);

alter table public.course_material_summaries enable row level security;

drop policy if exists "course material summaries own read" on public.course_material_summaries;
create policy "course material summaries own read"
on public.course_material_summaries
for select
to authenticated
using (user_id = auth.uid() or public.is_staff());

drop policy if exists "course material summaries own insert" on public.course_material_summaries;
create policy "course material summaries own insert"
on public.course_material_summaries
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "course material summaries own update" on public.course_material_summaries;
create policy "course material summaries own update"
on public.course_material_summaries
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant select, insert, update on table public.course_material_summaries to authenticated;
grant select, insert, update, delete on table public.course_material_summaries to service_role;
