grant usage on schema public to anon, authenticated;

grant select on table
  public.academic_terms,
  public.exam_schedule_versions,
  public.exam_schedule_entries,
  public.notices,
  public.question_banks,
  public.questions,
  public.membership_plans
to anon, authenticated;

grant select on table
  public.profiles,
  public.user_roles,
  public.email_preferences,
  public.practice_sessions,
  public.practice_responses,
  public.practice_session_questions,
  public.revision_state,
  public.payment_attempts,
  public.memberships,
  public.support_tickets,
  public.support_messages,
  public.notifications
to authenticated;

grant insert, update on table public.profiles to authenticated;
grant insert, update, delete on table public.email_preferences to authenticated;
grant insert, update, delete on table public.practice_sessions to authenticated;
grant insert, update, delete on table public.practice_responses to authenticated;
grant insert, update, delete on table public.revision_state to authenticated;
grant insert on table public.support_tickets to authenticated;
grant insert on table public.support_messages to authenticated;
grant update on table public.notifications to authenticated;

drop policy if exists "profiles own insert" on public.profiles;
create policy "profiles own insert"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());
