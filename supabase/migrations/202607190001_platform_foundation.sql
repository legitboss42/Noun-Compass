create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('student', 'support_agent', 'content_editor', 'academic_reviewer', 'super_admin');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.content_status as enum ('draft', 'review', 'published', 'retired');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.membership_status as enum ('pending', 'active', 'expired', 'refunded', 'revoked');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 100),
  programme text check (char_length(programme) <= 160),
  level integer check (level between 100 and 900),
  semester smallint check (semester in (1, 2)),
  entry_mode text check (entry_mode in ('normal', 'direct-entry')),
  study_centre text check (char_length(study_centre) <= 180),
  exam_mode text check (exam_mode in ('e-exam', 'pop', 'mixed')),
  selected_course_codes text[] not null default '{}',
  available_study_days text[] not null default '{}',
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.user_role not null default 'student',
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table if not exists public.email_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  deadline_reminders boolean not null default true,
  revision_reminders boolean not null default true,
  membership_reminders boolean not null default true,
  product_updates boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.academic_terms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  session_code text not null unique,
  starts_on date,
  ends_on date,
  source_url text not null,
  source_checksum text,
  status public.content_status not null default 'draft',
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exam_schedule_versions (
  id uuid primary key default gen_random_uuid(),
  academic_term_id uuid not null references public.academic_terms(id) on delete cascade,
  label text not null,
  exam_mode text not null check (exam_mode in ('e-exam', 'pop', 'mixed')),
  source_url text not null,
  source_checksum text not null,
  status public.content_status not null default 'draft',
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (academic_term_id, exam_mode, source_checksum)
);

create table if not exists public.exam_schedule_entries (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.exam_schedule_versions(id) on delete cascade,
  course_code text not null check (course_code ~ '^[A-Z]{2,5}[0-9]{3}$'),
  course_title text,
  exam_date date not null,
  starts_at time not null,
  venue text,
  created_at timestamptz not null default now(),
  unique (version_id, course_code)
);

create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience jsonb not null default '{}'::jsonb,
  source_url text,
  starts_at timestamptz,
  expires_at timestamptz,
  status public.content_status not null default 'draft',
  created_by uuid references auth.users(id),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.question_banks (
  id uuid primary key default gen_random_uuid(),
  course_code text not null unique check (course_code ~ '^[A-Z]{2,5}[0-9]{3}$'),
  course_title text not null,
  exam_mode text not null check (exam_mode in ('e-exam', 'pop', 'mixed')),
  description text not null,
  source_url text not null,
  status public.content_status not null default 'draft',
  created_by uuid references auth.users(id),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  bank_id uuid not null references public.question_banks(id) on delete cascade,
  topic text not null,
  learning_objective text not null,
  difficulty smallint not null default 1 check (difficulty between 1 and 3),
  sample boolean not null default false,
  status public.content_status not null default 'draft',
  current_version integer not null default 1,
  created_by uuid references auth.users(id),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.question_versions (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  version integer not null,
  prompt text not null,
  explanation text not null,
  source_unit text not null,
  source_page text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (question_id, version)
);

create table if not exists public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_version_id uuid not null references public.question_versions(id) on delete cascade,
  label text not null,
  option_text text not null,
  is_correct boolean not null default false,
  position smallint not null,
  unique (question_version_id, position)
);

create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bank_id uuid not null references public.question_banks(id),
  mode text not null check (mode in ('diagnostic', 'practice', 'timed-mock')),
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  score integer,
  question_count integer not null default 0
);

create table if not exists public.practice_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.practice_sessions(id) on delete cascade,
  question_version_id uuid not null references public.question_versions(id),
  selected_option_id uuid references public.question_options(id),
  correct boolean not null,
  duration_ms integer check (duration_ms >= 0),
  answered_at timestamptz not null default now(),
  unique (session_id, question_version_id)
);

create table if not exists public.practice_session_questions (
  session_id uuid not null references public.practice_sessions(id) on delete cascade,
  question_version_id uuid not null references public.question_versions(id),
  position smallint not null,
  primary key (session_id, question_version_id),
  unique (session_id, position)
);

create table if not exists public.revision_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  box smallint not null default 1 check (box between 1 and 5),
  due_at timestamptz not null default now(),
  last_correct boolean,
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create table if not exists public.membership_plans (
  plan_key text primary key,
  name text not null,
  amount_kobo integer not null check (amount_kobo > 0),
  currency text not null default 'NGN',
  duration_days integer not null check (duration_days > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.membership_plans (plan_key, name, amount_kobo, currency, duration_days)
values ('semester-pass', 'NOUN Compass Semester Pass', 250000, 'NGN', 180)
on conflict (plan_key) do update set
  name = excluded.name,
  amount_kobo = excluded.amount_kobo,
  currency = excluded.currency,
  duration_days = excluded.duration_days;

create table if not exists public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  user_id uuid not null references auth.users(id),
  plan_key text not null references public.membership_plans(plan_key),
  email text not null,
  amount_kobo integer not null,
  currency text not null,
  status text not null default 'initialized' check (status in ('initialized', 'success', 'failed', 'abandoned', 'refunded', 'chargeback')),
  provider_response jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  reference text,
  event_type text not null,
  payload_hash text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  plan_key text not null references public.membership_plans(plan_key),
  payment_reference text not null unique references public.payment_attempts(reference),
  status public.membership_status not null default 'pending',
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists memberships_user_status_idx on public.memberships(user_id, status, ends_at desc);

create table if not exists public.entitlement_adjustments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  membership_id uuid references public.memberships(id),
  previous_ends_at timestamptz,
  new_ends_at timestamptz,
  reason text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null check (char_length(subject) between 5 and 140),
  category text not null check (category in ('account', 'membership', 'payment', 'academic-content', 'technical', 'other')),
  status text not null default 'open' check (status in ('open', 'in-progress', 'waiting-on-student', 'resolved', 'closed')),
  assigned_to uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_id uuid not null references auth.users(id),
  body text not null check (char_length(body) between 2 and 5000),
  internal_note boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.content_reviews (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  decision text not null check (decision in ('submitted', 'approved', 'changes-requested', 'retired')),
  notes text,
  reviewer_id uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null,
  action_url text,
  dedupe_key text not null,
  read_at timestamptz,
  emailed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, dedupe_key)
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.cron_runs (
  id uuid primary key default gen_random_uuid(),
  job_key text not null,
  run_date date not null,
  status text not null check (status in ('running', 'success', 'failed')),
  details jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (job_key, run_date)
);

create or replace function public.has_role(required_role public.user_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id = auth.uid() and role = required_role)
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('support_agent', 'content_editor', 'academic_reviewer', 'super_admin')
  )
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''));
  insert into public.user_roles (user_id, role) values (new.id, 'student');
  insert into public.email_preferences (user_id) values (new.id);
  return new;
end;
$$;

create or replace function public.activate_semester_pass(p_reference text, p_paid_at timestamptz)
returns public.memberships
language plpgsql
security definer
set search_path = public
as $$
declare
  attempt public.payment_attempts;
  existing_membership public.memberships;
  active_end timestamptz;
  access_start timestamptz;
  access_end timestamptz;
begin
  select * into attempt from public.payment_attempts where reference = p_reference for update;
  if not found then raise exception 'Unknown payment reference'; end if;
  perform pg_advisory_xact_lock(hashtext(attempt.user_id::text));

  select * into existing_membership from public.memberships where payment_reference = p_reference;
  if found then return existing_membership; end if;

  select max(ends_at) into active_end
  from public.memberships
  where user_id = attempt.user_id and status = 'active' and ends_at > p_paid_at;

  access_start := p_paid_at;
  access_end := greatest(coalesce(active_end, p_paid_at), p_paid_at) + make_interval(days => 180);

  update public.payment_attempts
  set status = 'success', paid_at = p_paid_at, updated_at = now()
  where reference = p_reference;

  insert into public.memberships (user_id, plan_key, payment_reference, status, starts_at, ends_at)
  values (attempt.user_id, attempt.plan_key, attempt.reference, 'active', access_start, access_end)
  returning * into existing_membership;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, details)
  values (attempt.user_id, 'membership.activated', 'membership', existing_membership.id::text,
    jsonb_build_object('reference', p_reference, 'ends_at', access_end));

  return existing_membership;
end;
$$;

revoke all on function public.activate_semester_pass(text, timestamptz) from public, anon, authenticated;
grant execute on function public.activate_semester_pass(text, timestamptz) to service_role;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.email_preferences enable row level security;
alter table public.academic_terms enable row level security;
alter table public.exam_schedule_versions enable row level security;
alter table public.exam_schedule_entries enable row level security;
alter table public.notices enable row level security;
alter table public.question_banks enable row level security;
alter table public.questions enable row level security;
alter table public.question_versions enable row level security;
alter table public.question_options enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.practice_responses enable row level security;
alter table public.practice_session_questions enable row level security;
alter table public.revision_state enable row level security;
alter table public.membership_plans enable row level security;
alter table public.payment_attempts enable row level security;
alter table public.payment_events enable row level security;
alter table public.memberships enable row level security;
alter table public.entitlement_adjustments enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
alter table public.content_reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.cron_runs enable row level security;

create policy "profiles own read" on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy "profiles own update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "roles own read" on public.user_roles for select using (user_id = auth.uid() or public.has_role('super_admin'));
create policy "preferences own" on public.email_preferences for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "published terms read" on public.academic_terms for select using (status = 'published' or public.is_staff());
create policy "published schedules read" on public.exam_schedule_versions for select using (status = 'published' or public.is_staff());
create policy "published schedule entries read" on public.exam_schedule_entries for select using (
  exists(select 1 from public.exam_schedule_versions v where v.id = version_id and (v.status = 'published' or public.is_staff()))
);
create policy "published notices read" on public.notices for select using (status = 'published' or public.is_staff());
create policy "published banks read" on public.question_banks for select using (status = 'published' or public.is_staff());
create policy "sample question metadata read" on public.questions for select using ((status = 'published' and sample) or public.is_staff());
create policy "plans public read" on public.membership_plans for select using (active = true or public.is_staff());
create policy "sessions own" on public.practice_sessions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "responses own" on public.practice_responses for all using (
  exists(select 1 from public.practice_sessions s where s.id = session_id and s.user_id = auth.uid())
) with check (exists(select 1 from public.practice_sessions s where s.id = session_id and s.user_id = auth.uid()));
create policy "session questions own read" on public.practice_session_questions for select using (
  exists(select 1 from public.practice_sessions s where s.id = session_id and s.user_id = auth.uid())
);
create policy "revision own" on public.revision_state for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "attempts own read" on public.payment_attempts for select using (user_id = auth.uid() or public.has_role('super_admin'));
create policy "memberships own read" on public.memberships for select using (user_id = auth.uid() or public.has_role('super_admin'));
create policy "tickets own or staff" on public.support_tickets for select using (user_id = auth.uid() or public.is_staff());
create policy "tickets own insert" on public.support_tickets for insert with check (user_id = auth.uid());
create policy "ticket messages read" on public.support_messages for select using (
  exists(select 1 from public.support_tickets t where t.id = ticket_id and (t.user_id = auth.uid() or public.is_staff()))
  and (internal_note = false or public.is_staff())
);
create policy "ticket messages insert" on public.support_messages for insert with check (
  sender_id = auth.uid() and exists(select 1 from public.support_tickets t where t.id = ticket_id and (t.user_id = auth.uid() or public.is_staff()))
);
create policy "notifications own" on public.notifications for select using (user_id = auth.uid());
create policy "notifications own update" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Staff writes are intentionally server-only through the service-role client.
-- The service role bypasses RLS; every corresponding route must also call requireRole().
revoke update, delete on public.audit_logs from authenticated;
revoke update, delete on public.payment_events from authenticated;
