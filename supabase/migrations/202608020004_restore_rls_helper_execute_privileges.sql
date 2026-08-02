-- RLS policies call these helpers while evaluating student and public reads.
-- The helpers expose only boolean authorization decisions and retain their
-- fixed search_path. Revoking EXECUTE from callers made otherwise-valid RLS
-- policies fail with 42501 instead of returning the permitted rows.

grant execute on function public.has_role(public.user_role) to anon, authenticated;
grant execute on function public.is_staff() to anon, authenticated;

