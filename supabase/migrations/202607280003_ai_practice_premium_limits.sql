alter table public.ai_practice_sessions
  drop constraint if exists ai_practice_sessions_question_count_check;

alter table public.ai_practice_sessions
  add constraint ai_practice_sessions_question_count_check
  check (question_count between 1 and 100);

