-- Lock down SECURITY DEFINER helpers so they cannot be called directly through
-- PostgREST RPC by anonymous or ordinary authenticated users.
--
-- These functions are still used internally by triggers and RLS policies. The
-- intent here is to remove direct external EXECUTE privileges, not to change
-- the function bodies or weaken RLS.

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.has_role(public.user_role) from public, anon, authenticated;
revoke all on function public.is_staff() from public, anon, authenticated;

grant execute on function public.handle_new_user() to service_role;
grant execute on function public.has_role(public.user_role) to service_role;
grant execute on function public.is_staff() to service_role;

do $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'rls_auto_enable'
      and pg_get_function_identity_arguments(p.oid) = ''
  ) then
    revoke all on function public.rls_auto_enable() from public, anon, authenticated;
    grant execute on function public.rls_auto_enable() to service_role;
  end if;
end
$$;
