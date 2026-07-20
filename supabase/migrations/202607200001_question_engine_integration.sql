alter table public.questions add column if not exists module_label text;
alter table public.questions add column if not exists unit_label text;
alter table public.questions add column if not exists concept_key text;
alter table public.questions add column if not exists question_type text not null default 'multiple_choice';
alter table public.questions add column if not exists engine_question_id uuid unique;

alter table public.question_versions add column if not exists source_module text;
alter table public.question_versions add column if not exists source_section text;
alter table public.question_versions add column if not exists page_start integer;
alter table public.question_versions add column if not exists page_end integer;
alter table public.question_versions add column if not exists source_chunk_id uuid;
alter table public.question_versions add column if not exists source_evidence_hash text;
alter table public.question_versions add column if not exists generation_model text;
alter table public.question_versions add column if not exists prompt_version text;
alter table public.question_versions add column if not exists confidence numeric(5,4) check (confidence between 0 and 1);
alter table public.question_versions add column if not exists cognitive_level text;

create index if not exists questions_bank_module_unit_idx on public.questions(bank_id,module_label,unit_label,status);
create index if not exists questions_bank_concept_idx on public.questions(bank_id,concept_key,status);

create table if not exists public.question_bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id,question_id)
);

create table if not exists public.question_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id),
  question_version_id uuid not null references public.question_versions(id),
  session_id uuid references public.practice_sessions(id) on delete set null,
  report_type text not null check (report_type in ('wrong_answer','unclear_question','duplicate_question','poor_explanation','incorrect_reference','formatting_issue')),
  details text check (char_length(details) <= 1000),
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  resolution_notes text,
  created_at timestamptz not null default now()
);

create index if not exists question_reports_status_idx on public.question_reports(status,created_at);
create index if not exists question_reports_question_idx on public.question_reports(question_id,status);

alter table public.question_bookmarks enable row level security;
alter table public.question_reports enable row level security;

grant select,insert,delete on public.question_bookmarks to authenticated;
grant select,insert on public.question_reports to authenticated;

drop policy if exists "bookmarks own" on public.question_bookmarks;
create policy "bookmarks own" on public.question_bookmarks for all to authenticated
using (user_id=auth.uid()) with check (user_id=auth.uid());

drop policy if exists "reports own read" on public.question_reports;
create policy "reports own read" on public.question_reports for select to authenticated
using (user_id=auth.uid() or public.is_staff());

drop policy if exists "reports own insert" on public.question_reports;
create policy "reports own insert" on public.question_reports for insert to authenticated
with check (
  user_id=auth.uid()
  and exists(select 1 from public.question_versions v where v.id=question_version_id and v.question_id=question_id)
  and (session_id is null or exists(select 1 from public.practice_sessions s where s.id=session_id and s.user_id=auth.uid()))
);
