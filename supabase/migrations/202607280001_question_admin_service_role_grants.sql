grant usage on schema public to service_role;

grant select, insert, update, delete on table
  public.question_banks,
  public.questions,
  public.question_versions,
  public.question_options,
  public.question_bookmarks,
  public.question_reports,
  public.practice_session_questions
to service_role;

