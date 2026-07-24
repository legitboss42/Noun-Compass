create or replace function public.admin_overview_metrics()
returns jsonb
language sql
security definer
set search_path = public, auth
as $$
  select jsonb_build_object(
    'total_users', (select count(*) from auth.users),
    'users_today', (select count(*) from auth.users where created_at >= date_trunc('day', now())),
    'users_this_week', (select count(*) from auth.users where created_at >= date_trunc('week', now())),
    'active_memberships', (
      select count(*) from public.memberships
      where status = 'active' and ends_at > now()
    ),
    'memberships_expiring_7d', (
      select count(*) from public.memberships
      where status = 'active' and ends_at > now() and ends_at <= now() + interval '7 days'
    ),
    'successful_payments', (
      select count(*) from public.payment_attempts where status = 'success'
    ),
    'failed_or_pending_payments', (
      select count(*) from public.payment_attempts
      where status in ('initialized', 'failed', 'abandoned')
    ),
    'verified_revenue_kobo', (
      select coalesce(sum(amount_kobo), 0) from public.payment_attempts where status = 'success'
    ),
    'open_support_tickets', (
      select count(*) from public.support_tickets
      where status in ('open', 'in-progress', 'waiting-on-student')
    ),
    'unresolved_question_reports', (
      select count(*) from public.question_reports where status in ('open', 'reviewing')
    ),
    'total_question_banks', (select count(*) from public.question_banks),
    'published_questions', (
      select count(*) from public.questions where status = 'published'
    ),
    'recent_signups', coalesce((
      select jsonb_agg(row_data order by created_at desc)
      from (
        select id, email, created_at
        from auth.users
        order by created_at desc
        limit 5
      ) row_data
    ), '[]'::jsonb),
    'recent_payments', coalesce((
      select jsonb_agg(row_data order by created_at desc)
      from (
        select reference, user_id, email, amount_kobo, currency, status, created_at
        from public.payment_attempts
        order by created_at desc
        limit 5
      ) row_data
    ), '[]'::jsonb),
    'recent_support', coalesce((
      select jsonb_agg(row_data order by updated_at desc)
      from (
        select id, subject, status, priority, user_id, updated_at
        from public.support_tickets
        order by updated_at desc
        limit 5
      ) row_data
    ), '[]'::jsonb)
  );
$$;

create or replace function public.admin_analytics(
  p_from date default (current_date - 29),
  p_to date default current_date
)
returns jsonb
language sql
security definer
set search_path = public, auth
as $$
  with bounds as (
    select p_from::timestamptz as starts_at, (p_to + 1)::timestamptz as ends_at
  )
  select jsonb_build_object(
    'range', jsonb_build_object('from', p_from, 'to', p_to),
    'users', jsonb_build_object(
      'signups', (
        select count(*) from auth.users, bounds
        where users.created_at >= bounds.starts_at and users.created_at < bounds.ends_at
      ),
      'active_users', (
        select count(distinct user_id) from public.practice_sessions, bounds
        where started_at >= bounds.starts_at and started_at < bounds.ends_at
      ),
      'premium_users', (
        select count(distinct user_id) from public.memberships
        where status = 'active' and ends_at > now()
      ),
      'free_users', (
        select greatest(
          (select count(*) from auth.users) -
          (select count(distinct user_id) from public.memberships where status = 'active' and ends_at > now()),
          0
        )
      ),
      'signups_by_day', coalesce((
        select jsonb_agg(jsonb_build_object('label', day, 'value', count) order by day)
        from (
          select created_at::date as day, count(*) as count
          from auth.users, bounds
          where users.created_at >= bounds.starts_at and users.created_at < bounds.ends_at
          group by created_at::date
        ) rows
      ), '[]'::jsonb),
      'profiles_by_level', coalesce((
        select jsonb_agg(jsonb_build_object('label', level, 'value', count) order by level)
        from (
          select level, count(*) as count
          from public.profiles
          where level is not null
          group by level
        ) rows
      ), '[]'::jsonb),
      'profiles_by_programme', coalesce((
        select jsonb_agg(jsonb_build_object('label', programme, 'value', count) order by count desc)
        from (
          select programme, count(*) as count
          from public.profiles
          where programme is not null and programme <> ''
          group by programme
          order by count(*) desc
          limit 10
        ) rows
      ), '[]'::jsonb)
    ),
    'revenue', jsonb_build_object(
      'verified_revenue_kobo', (
        select coalesce(sum(amount_kobo), 0) from public.payment_attempts, bounds
        where payment_attempts.status = 'success'
          and payment_attempts.created_at >= bounds.starts_at
          and payment_attempts.created_at < bounds.ends_at
      ),
      'successful_transactions', (
        select count(*) from public.payment_attempts, bounds
        where payment_attempts.status = 'success'
          and payment_attempts.created_at >= bounds.starts_at
          and payment_attempts.created_at < bounds.ends_at
      ),
      'failed_transactions', (
        select count(*) from public.payment_attempts, bounds
        where payment_attempts.status in ('failed', 'abandoned')
          and payment_attempts.created_at >= bounds.starts_at
          and payment_attempts.created_at < bounds.ends_at
      ),
      'payment_conversion_percent', (
        select case when count(*) = 0 then null else
          round(100.0 * count(*) filter (where status = 'success') / count(*), 1)
        end
        from public.payment_attempts, bounds
        where payment_attempts.created_at >= bounds.starts_at
          and payment_attempts.created_at < bounds.ends_at
      ),
      'membership_activations', (
        select count(*) from public.memberships, bounds
        where memberships.starts_at >= bounds.starts_at
          and memberships.starts_at < bounds.ends_at
      ),
      'memberships_expiring_7d', (
        select count(*) from public.memberships
        where status = 'active' and ends_at > now() and ends_at <= now() + interval '7 days'
      )
    ),
    'practice', jsonb_build_object(
      'sessions_started', (
        select count(*) from public.practice_sessions, bounds
        where started_at >= bounds.starts_at and started_at < bounds.ends_at
      ),
      'sessions_completed', (
        select count(*) from public.practice_sessions, bounds
        where status = 'completed' and started_at >= bounds.starts_at and started_at < bounds.ends_at
      ),
      'average_score', (
        select round(avg(score), 1) from public.practice_sessions, bounds
        where status = 'completed' and started_at >= bounds.starts_at and started_at < bounds.ends_at
      ),
      'usage_by_mode', coalesce((
        select jsonb_agg(jsonb_build_object('label', mode, 'value', count) order by count desc)
        from (
          select mode, count(*) as count
          from public.practice_sessions, bounds
          where started_at >= bounds.starts_at and started_at < bounds.ends_at
          group by mode
        ) rows
      ), '[]'::jsonb),
      'most_attempted_courses', coalesce((
        select jsonb_agg(jsonb_build_object('label', course_code, 'value', count) order by count desc)
        from (
          select question_banks.course_code, count(*) as count
          from public.practice_sessions
          join public.question_banks on question_banks.id = practice_sessions.bank_id
          cross join bounds
          where practice_sessions.started_at >= bounds.starts_at
            and practice_sessions.started_at < bounds.ends_at
          group by question_banks.course_code
          order by count(*) desc
          limit 10
        ) rows
      ), '[]'::jsonb),
      'most_reported_questions', coalesce((
        select jsonb_agg(jsonb_build_object('label', question_id, 'value', count) order by count desc)
        from (
          select question_id, count(*) as count
          from public.question_reports, bounds
          where question_reports.created_at >= bounds.starts_at
            and question_reports.created_at < bounds.ends_at
          group by question_id
          order by count(*) desc
          limit 10
        ) rows
      ), '[]'::jsonb)
    ),
    'support', jsonb_build_object(
      'open_tickets', (
        select count(*) from public.support_tickets
        where status in ('open', 'in-progress', 'waiting-on-student')
      ),
      'average_resolution_hours', (
        select round(avg(extract(epoch from (updated_at - created_at)) / 3600)::numeric, 1)
        from public.support_tickets, bounds
        where status in ('resolved', 'closed')
          and support_tickets.updated_at >= bounds.starts_at
          and support_tickets.updated_at < bounds.ends_at
      ),
      'by_category', coalesce((
        select jsonb_agg(jsonb_build_object('label', category, 'value', count) order by count desc)
        from (
          select category, count(*) as count
          from public.support_tickets, bounds
          where support_tickets.created_at >= bounds.starts_at
            and support_tickets.created_at < bounds.ends_at
          group by category
        ) rows
      ), '[]'::jsonb),
      'by_priority', coalesce((
        select jsonb_agg(jsonb_build_object('label', priority, 'value', count) order by count desc)
        from (
          select priority, count(*) as count
          from public.support_tickets, bounds
          where support_tickets.created_at >= bounds.starts_at
            and support_tickets.created_at < bounds.ends_at
          group by priority
        ) rows
      ), '[]'::jsonb)
    )
  );
$$;

revoke all on function public.admin_overview_metrics() from public, anon, authenticated;
revoke all on function public.admin_analytics(date, date) from public, anon, authenticated;
grant execute on function public.admin_overview_metrics() to service_role;
grant execute on function public.admin_analytics(date, date) to service_role;
