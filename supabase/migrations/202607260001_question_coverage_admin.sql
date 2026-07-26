create table if not exists public.question_course_coverage (
  course_code text primary key check (course_code ~ '^[A-Z]{2,5}[0-9]{3,4}$'),
  course_title text not null,
  level integer check (level between 100 and 900),
  semester smallint check (semester in (1,2)),
  official_material_count integer not null default 0 check (official_material_count >= 0),
  public_course_metadata_count integer not null default 0 check (public_course_metadata_count >= 0),
  public_quiz_metadata_count integer not null default 0 check (public_quiz_metadata_count >= 0),
  material_ready boolean not null default false,
  blueprint_ready boolean not null default false,
  draft_question_count integer not null default 0 check (draft_question_count >= 0),
  approved_question_count integer not null default 0 check (approved_question_count >= 0),
  published_question_count integer not null default 0 check (published_question_count >= 0),
  demand_score numeric(7,3) not null default 0 check (demand_score between 0 and 100),
  readiness_score numeric(7,3) not null default 0 check (readiness_score between 0 and 100),
  priority_score numeric(7,3) not null default 0 check (priority_score between 0 and 100),
  computed_at timestamptz not null,
  synced_at timestamptz not null default now()
);

create index if not exists question_course_coverage_priority_idx
  on public.question_course_coverage(priority_score desc,course_code);
create index if not exists question_course_coverage_readiness_idx
  on public.question_course_coverage(material_ready,blueprint_ready,published_question_count);

alter table public.question_course_coverage enable row level security;
revoke all on public.question_course_coverage from anon, authenticated;
grant select on public.question_course_coverage to authenticated;
grant select,insert,update,delete on public.question_course_coverage to service_role;

drop policy if exists "staff read course coverage" on public.question_course_coverage;
create policy "staff read course coverage"
on public.question_course_coverage for select to authenticated
using (public.is_staff());

comment on table public.question_course_coverage is
  'Sanitised private-engine aggregates for authorised administrators. Contains no third-party content or private source payloads.';
