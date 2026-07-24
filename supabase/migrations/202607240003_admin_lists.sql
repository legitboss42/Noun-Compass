create or replace function public.admin_list_memberships(
  p_query text default null,
  p_status public.membership_status default null,
  p_source text default null,
  p_expiring_soon boolean default false,
  p_offset integer default 0,
  p_limit integer default 25
)
returns table (
  id uuid,
  user_id uuid,
  email text,
  display_name text,
  plan_key text,
  plan_name text,
  status public.membership_status,
  source text,
  payment_reference text,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz,
  days_remaining integer,
  total_count bigint
)
language sql
security definer
set search_path = public, auth
as $$
  select
    memberships.id,
    memberships.user_id,
    users.email::text,
    profiles.display_name,
    memberships.plan_key,
    membership_plans.name,
    memberships.status,
    memberships.source,
    memberships.payment_reference,
    memberships.starts_at,
    memberships.ends_at,
    memberships.created_at,
    case
      when memberships.ends_at is null then null
      else ceil(extract(epoch from (memberships.ends_at - now())) / 86400)::integer
    end,
    count(*) over()
  from public.memberships
  join auth.users on users.id = memberships.user_id
  left join public.profiles on profiles.id = memberships.user_id
  join public.membership_plans on membership_plans.plan_key = memberships.plan_key
  where
    (
      nullif(trim(p_query), '') is null
      or users.email ilike '%' || trim(p_query) || '%'
      or coalesce(profiles.display_name, '') ilike '%' || trim(p_query) || '%'
      or memberships.user_id::text = trim(p_query)
      or coalesce(memberships.payment_reference, '') ilike '%' || trim(p_query) || '%'
    )
    and (p_status is null or memberships.status = p_status)
    and (nullif(p_source, '') is null or memberships.source = p_source)
    and (
      not p_expiring_soon
      or (
        memberships.status = 'active'
        and memberships.ends_at > now()
        and memberships.ends_at <= now() + interval '7 days'
      )
    )
  order by memberships.created_at desc
  offset greatest(p_offset, 0)
  limit least(greatest(p_limit, 1), 100);
$$;

create or replace function public.admin_list_payments(
  p_query text default null,
  p_status text default null,
  p_review_status text default null,
  p_from date default null,
  p_to date default null,
  p_activation_issue boolean default false,
  p_offset integer default 0,
  p_limit integer default 25
)
returns table (
  id uuid,
  reference text,
  provider_transaction_id text,
  user_id uuid,
  email text,
  display_name text,
  amount_kobo integer,
  currency text,
  status text,
  review_status text,
  review_note text,
  paid_at timestamptz,
  membership_id uuid,
  membership_status public.membership_status,
  latest_processing_error text,
  created_at timestamptz,
  total_count bigint
)
language sql
security definer
set search_path = public, auth
as $$
  select
    payment_attempts.id,
    payment_attempts.reference,
    payment_attempts.provider_response->>'transaction_id',
    payment_attempts.user_id,
    payment_attempts.email,
    profiles.display_name,
    payment_attempts.amount_kobo,
    payment_attempts.currency,
    payment_attempts.status,
    payment_attempts.review_status,
    payment_attempts.review_note,
    payment_attempts.paid_at,
    memberships.id,
    memberships.status,
    event_rows.processing_error,
    payment_attempts.created_at,
    count(*) over()
  from public.payment_attempts
  left join public.profiles on profiles.id = payment_attempts.user_id
  left join public.memberships on memberships.payment_reference = payment_attempts.reference
  left join lateral (
    select payment_events.processing_error
    from public.payment_events
    where payment_events.reference = payment_attempts.reference
      and payment_events.processing_error is not null
    order by payment_events.received_at desc
    limit 1
  ) event_rows on true
  where
    (
      nullif(trim(p_query), '') is null
      or payment_attempts.reference ilike '%' || trim(p_query) || '%'
      or payment_attempts.email ilike '%' || trim(p_query) || '%'
      or payment_attempts.user_id::text = trim(p_query)
      or coalesce(payment_attempts.provider_response->>'transaction_id', '') = trim(p_query)
    )
    and (nullif(p_status, '') is null or payment_attempts.status = p_status)
    and (
      nullif(p_review_status, '') is null
      or payment_attempts.review_status = p_review_status
    )
    and (p_from is null or payment_attempts.created_at >= p_from::timestamptz)
    and (p_to is null or payment_attempts.created_at < (p_to + 1)::timestamptz)
    and (
      not p_activation_issue
      or (payment_attempts.status = 'success' and memberships.id is null)
    )
  order by payment_attempts.created_at desc
  offset greatest(p_offset, 0)
  limit least(greatest(p_limit, 1), 100);
$$;

create or replace function public.admin_list_support_tickets(
  p_query text default null,
  p_status text default null,
  p_priority text default null,
  p_category text default null,
  p_assignment text default null,
  p_assigned_user uuid default null,
  p_offset integer default 0,
  p_limit integer default 25
)
returns table (
  id uuid,
  ticket_number text,
  user_id uuid,
  email text,
  display_name text,
  subject text,
  category text,
  priority text,
  status text,
  assigned_to uuid,
  assigned_email text,
  last_response_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  total_count bigint
)
language sql
security definer
set search_path = public, auth
as $$
  select
    support_tickets.id,
    'NC-' || upper(left(replace(support_tickets.id::text, '-', ''), 10)),
    support_tickets.user_id,
    users.email::text,
    profiles.display_name,
    support_tickets.subject,
    support_tickets.category,
    support_tickets.priority,
    support_tickets.status,
    support_tickets.assigned_to,
    assignee.email::text,
    message_rows.last_response_at,
    support_tickets.created_at,
    support_tickets.updated_at,
    count(*) over()
  from public.support_tickets
  join auth.users on users.id = support_tickets.user_id
  left join public.profiles on profiles.id = support_tickets.user_id
  left join auth.users assignee on assignee.id = support_tickets.assigned_to
  left join lateral (
    select max(support_messages.created_at) as last_response_at
    from public.support_messages
    where support_messages.ticket_id = support_tickets.id
  ) message_rows on true
  where
    (
      nullif(trim(p_query), '') is null
      or support_tickets.subject ilike '%' || trim(p_query) || '%'
      or users.email ilike '%' || trim(p_query) || '%'
      or support_tickets.id::text = trim(p_query)
    )
    and (nullif(p_status, '') is null or support_tickets.status = p_status)
    and (nullif(p_priority, '') is null or support_tickets.priority = p_priority)
    and (nullif(p_category, '') is null or support_tickets.category = p_category)
    and (
      nullif(p_assignment, '') is null
      or (p_assignment = 'unassigned' and support_tickets.assigned_to is null)
      or (p_assignment = 'mine' and support_tickets.assigned_to = p_assigned_user)
    )
  order by
    case support_tickets.priority
      when 'urgent' then 1
      when 'high' then 2
      when 'normal' then 3
      else 4
    end,
    support_tickets.updated_at desc
  offset greatest(p_offset, 0)
  limit least(greatest(p_limit, 1), 100);
$$;

revoke all on function public.admin_list_memberships(
  text, public.membership_status, text, boolean, integer, integer
) from public, anon, authenticated;
revoke all on function public.admin_list_payments(
  text, text, text, date, date, boolean, integer, integer
) from public, anon, authenticated;
revoke all on function public.admin_list_support_tickets(
  text, text, text, text, text, uuid, integer, integer
) from public, anon, authenticated;

grant execute on function public.admin_list_memberships(
  text, public.membership_status, text, boolean, integer, integer
) to service_role;
grant execute on function public.admin_list_payments(
  text, text, text, date, date, boolean, integer, integer
) to service_role;
grant execute on function public.admin_list_support_tickets(
  text, text, text, text, text, uuid, integer, integer
) to service_role;
