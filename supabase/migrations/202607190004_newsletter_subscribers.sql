create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email) and char_length(email) between 5 and 254),
  status text not null default 'subscribed' check (status in ('subscribed', 'unsubscribed')),
  consent_source text not null,
  consent_version text not null,
  consented_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  brevo_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;
revoke all on table public.newsletter_subscribers from anon, authenticated;
grant select, insert, update, delete on table public.newsletter_subscribers to service_role;

create index if not exists newsletter_subscribers_status_sync_idx
on public.newsletter_subscribers(status, brevo_synced_at);
