create table if not exists public.user_tool_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_key text not null check (tool_key in ('fee-checker', 'cgpa-calculator', 'study-planner', 'result-checker')),
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, tool_key)
);

create index if not exists user_tool_activity_user_updated_idx
  on public.user_tool_activity(user_id, updated_at desc);

alter table public.user_tool_activity enable row level security;

drop policy if exists "tool activity own read" on public.user_tool_activity;
create policy "tool activity own read"
on public.user_tool_activity
for select
to authenticated
using (user_id = auth.uid() or public.is_staff());

drop policy if exists "tool activity own write" on public.user_tool_activity;
create policy "tool activity own write"
on public.user_tool_activity
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "tool activity own update" on public.user_tool_activity;
create policy "tool activity own update"
on public.user_tool_activity
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant select, insert, update on table public.user_tool_activity to authenticated;
grant select, insert, update, delete on table public.user_tool_activity to service_role;
