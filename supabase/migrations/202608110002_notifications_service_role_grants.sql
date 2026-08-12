-- notifications: service_role table privileges
--
-- The daily cron and the re-engagement/inactive-student sends write to
-- public.notifications through the service-role admin client (insert the row,
-- then set emailed_at). This project grants service_role explicitly per table
-- rather than relying on the default auto-grant, and notifications was never
-- included -- so those writes failed with "42501: permission denied for table
-- notifications" and were swallowed by `if (insertError) continue`, producing
-- 0 emailed / 0 failed. RLS is unaffected (service_role bypasses it); this is
-- the SQL-level table grant it was missing.

grant usage on schema public to service_role;

grant select, insert, update on table public.notifications to service_role;
