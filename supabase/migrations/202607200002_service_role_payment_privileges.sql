insert into public.membership_plans (plan_key, name, amount_kobo, currency, duration_days, active)
values ('semester-pass', 'NOUN Compass Semester Pass', 250000, 'NGN', 180, true)
on conflict (plan_key) do update set
  name = excluded.name,
  amount_kobo = excluded.amount_kobo,
  currency = excluded.currency,
  duration_days = excluded.duration_days,
  active = excluded.active;

grant usage on schema public to service_role;

grant select, insert, update on table public.membership_plans to service_role;
grant select, insert, update on table public.payment_attempts to service_role;
grant select, insert, update on table public.payment_events to service_role;
grant select, insert, update on table public.memberships to service_role;
grant select, insert, update on table public.audit_logs to service_role;
grant select on table public.profiles to service_role;

grant execute on function public.activate_semester_pass(text, timestamptz) to service_role;
