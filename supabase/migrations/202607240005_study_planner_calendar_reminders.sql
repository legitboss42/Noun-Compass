alter table public.email_preferences
  add column if not exists study_reminders boolean not null default true;

create table if not exists public.study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  timezone text not null default 'Africa/Lagos' check (char_length(timezone) between 1 and 64),
  reminder_minutes_before integer not null default 60 check (reminder_minutes_before between 15 and 1440),
  reminders_enabled boolean not null default true,
  source_payload jsonb not null default '{}'::jsonb,
  last_generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.study_plan_sessions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.study_plans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 140),
  course_code text check (course_code is null or course_code ~ '^[A-Z]{2,5}[0-9]{3}$'),
  course_title text check (course_title is null or char_length(course_title) <= 180),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reminder_sent_at timestamptz,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists study_plans_user_idx
  on public.study_plans(user_id);

create index if not exists study_plan_sessions_user_starts_idx
  on public.study_plan_sessions(user_id, starts_at);

create index if not exists study_plan_sessions_reminder_idx
  on public.study_plan_sessions(starts_at)
  where reminder_sent_at is null;

alter table public.study_plans enable row level security;
alter table public.study_plan_sessions enable row level security;

drop policy if exists "study plans own access" on public.study_plans;
create policy "study plans own access"
on public.study_plans
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "study sessions own access" on public.study_plan_sessions;
create policy "study sessions own access"
on public.study_plan_sessions
for all
using (
  user_id = auth.uid()
  and exists (
    select 1 from public.study_plans
    where study_plans.id = study_plan_sessions.plan_id
      and study_plans.user_id = auth.uid()
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.study_plans
    where study_plans.id = study_plan_sessions.plan_id
      and study_plans.user_id = auth.uid()
  )
);

grant select, insert, update, delete on table public.study_plans to authenticated;
grant select, insert, update, delete on table public.study_plan_sessions to authenticated;
grant select, insert, update, delete on table public.study_plans to service_role;
grant select, insert, update, delete on table public.study_plan_sessions to service_role;
