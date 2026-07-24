-- Additive operations-dashboard support. Existing RLS remains enabled and
-- privileged writes continue through permission-checked server code.

alter table public.memberships
  alter column payment_reference drop not null;

alter table public.memberships
  add column if not exists source text not null default 'payment'
    check (source in ('payment', 'manual')),
  add column if not exists granted_by uuid references auth.users(id),
  add column if not exists revoked_at timestamptz,
  add column if not exists revocation_reason text;

update public.memberships
set source = 'payment'
where source is null;

alter table public.support_tickets
  add column if not exists priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high', 'urgent'));

alter table public.payment_attempts
  add column if not exists review_status text not null default 'unreviewed'
    check (review_status in ('unreviewed', 'manual-review', 'reviewed')),
  add column if not exists review_note text,
  add column if not exists reviewed_by uuid references auth.users(id),
  add column if not exists reviewed_at timestamptz;

create table if not exists public.support_ticket_history (
  id bigint generated always as identity primary key,
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  actor_id uuid references auth.users(id),
  action text not null,
  previous_value text,
  new_value text,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.platform_settings (
  key text primary key check (
    key in (
      'platform_name',
      'support_email',
      'contact_email',
      'current_academic_term',
      'maintenance_notice',
      'membership_plan_visible',
      'checkout_available',
      'diagnostic_available',
      'question_reports_available',
      'newsletter_available',
      'public_announcement'
    )
  ),
  value_json jsonb not null,
  description text not null,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

alter table public.audit_logs
  add column if not exists reason text,
  add column if not exists previous_state jsonb,
  add column if not exists resulting_state jsonb;

create index if not exists profiles_created_at_idx
  on public.profiles(created_at desc);
create index if not exists user_roles_role_user_idx
  on public.user_roles(role, user_id);
create index if not exists memberships_status_expiry_idx
  on public.memberships(status, ends_at);
create index if not exists memberships_source_created_idx
  on public.memberships(source, created_at desc);
create index if not exists payment_attempts_status_created_idx
  on public.payment_attempts(status, created_at desc);
create index if not exists payment_attempts_user_created_idx
  on public.payment_attempts(user_id, created_at desc);
create index if not exists payment_attempts_review_idx
  on public.payment_attempts(review_status, created_at desc);
create index if not exists support_tickets_queue_idx
  on public.support_tickets(status, priority, updated_at desc);
create index if not exists support_tickets_assignee_idx
  on public.support_tickets(assigned_to, status);
create index if not exists support_ticket_history_ticket_idx
  on public.support_ticket_history(ticket_id, created_at);
create index if not exists practice_sessions_created_idx
  on public.practice_sessions(started_at desc, status);
create index if not exists audit_logs_entity_idx
  on public.audit_logs(entity_type, entity_id, created_at desc);

alter table public.support_ticket_history enable row level security;
alter table public.platform_settings enable row level security;

drop policy if exists "staff read support ticket history" on public.support_ticket_history;
create policy "staff read support ticket history"
on public.support_ticket_history for select to authenticated
using (public.is_staff());

drop policy if exists "super admin read platform settings" on public.platform_settings;
create policy "super admin read platform settings"
on public.platform_settings for select to authenticated
using (public.has_role('super_admin'));

revoke insert, update, delete on public.support_ticket_history from authenticated;
revoke insert, update, delete on public.platform_settings from authenticated;

grant select on public.support_ticket_history to authenticated;
grant select on public.platform_settings to authenticated;
grant select, insert, update on public.support_ticket_history to service_role;
grant select, insert, update on public.platform_settings to service_role;
grant select, insert, update on public.entitlement_adjustments to service_role;
grant select, insert, update on public.support_tickets to service_role;
grant select, insert, update on public.support_messages to service_role;
grant select, insert, update, delete on public.user_roles to service_role;
grant select, insert, update on public.question_reports to service_role;

create or replace function public.admin_list_users(
  p_query text default null,
  p_role public.user_role default null,
  p_membership_status public.membership_status default null,
  p_programme text default null,
  p_level integer default null,
  p_account_status text default null,
  p_sort text default 'newest',
  p_offset integer default 0,
  p_limit integer default 25
)
returns table (
  user_id uuid,
  email text,
  email_confirmed_at timestamptz,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  banned_until timestamptz,
  providers jsonb,
  display_name text,
  programme text,
  level integer,
  study_centre text,
  roles public.user_role[],
  membership_status public.membership_status,
  membership_ends_at timestamptz,
  total_count bigint
)
language sql
security definer
set search_path = public, auth
as $$
  with directory as (
    select
      users.id as user_id,
      users.email::text,
      users.email_confirmed_at,
      users.created_at,
      users.last_sign_in_at,
      users.banned_until,
      coalesce(users.raw_app_meta_data->'providers', '[]'::jsonb) as providers,
      profiles.display_name,
      profiles.programme,
      profiles.level,
      profiles.study_centre,
      coalesce(role_rows.roles, array[]::public.user_role[]) as roles,
      membership_rows.status as membership_status,
      membership_rows.ends_at as membership_ends_at
    from auth.users
    left join public.profiles on profiles.id = users.id
    left join lateral (
      select array_agg(user_roles.role order by user_roles.role) as roles
      from public.user_roles
      where user_roles.user_id = users.id
    ) role_rows on true
    left join lateral (
      select memberships.status, memberships.ends_at
      from public.memberships
      where memberships.user_id = users.id
      order by
        (memberships.status = 'active' and memberships.ends_at > now()) desc,
        memberships.created_at desc
      limit 1
    ) membership_rows on true
  )
  select
    directory.*,
    count(*) over() as total_count
  from directory
  where
    (
      nullif(trim(p_query), '') is null
      or directory.email ilike '%' || trim(p_query) || '%'
      or coalesce(directory.display_name, '') ilike '%' || trim(p_query) || '%'
      or directory.user_id::text = trim(p_query)
    )
    and (p_role is null or p_role = any(directory.roles))
    and (p_membership_status is null or directory.membership_status = p_membership_status)
    and (
      nullif(trim(p_programme), '') is null
      or coalesce(directory.programme, '') ilike '%' || trim(p_programme) || '%'
    )
    and (p_level is null or directory.level = p_level)
    and (
      p_account_status is null
      or (p_account_status = 'suspended' and directory.banned_until > now())
      or (p_account_status = 'active' and (directory.banned_until is null or directory.banned_until <= now()))
    )
  order by
    case when p_sort = 'oldest' then directory.created_at end asc,
    case when p_sort = 'last-active' then directory.last_sign_in_at end desc nulls last,
    directory.created_at desc
  offset greatest(p_offset, 0)
  limit least(greatest(p_limit, 1), 100);
$$;

revoke all on function public.admin_list_users(
  text,
  public.user_role,
  public.membership_status,
  text,
  integer,
  text,
  text,
  integer,
  integer
) from public, anon, authenticated;

grant execute on function public.admin_list_users(
  text,
  public.user_role,
  public.membership_status,
  text,
  integer,
  text,
  text,
  integer,
  integer
) to service_role;
