# Checkpoint 1 production prerequisites

Status date: 2026-08-12. This is an operational inventory only; no production
system was accessed or changed while preparing it.

| Prerequisite | Required verification before enabling sends | Status |
| --- | --- | --- |
| Supabase migrations | Apply and verify `202608100001_ai_quota_refund_on_failure.sql`, `202608100002_reengagement_reminders.sql`, `202608110001_inactive_students_by_stage.sql`, and `202608110002_notifications_service_role_grants.sql`. Confirm service_role has only `USAGE` on `public` and `SELECT`, `INSERT`, `UPDATE` on `public.notifications`; do not grant `public` or `authenticated`. | Unverified |
| Vercel callbacks and cron | Verify the deployed daily cron route, `CRON_SECRET`, callback URLs, and Vercel Cron schedule against the intended production project. | Unverified |
| Flutterwave | Confirm the production/Live mode keys, callback and webhook signature settings, and that no test-mode transaction can grant paid access. | Unverified |
| Brevo sender | Verify the approved sender/domain, SMTP credentials, transactional logs, bounce handling, and owner-only test send before any batch delivery. | Unverified |
| AI providers | Verify current production provider keys, model availability, quota/account limits, and fallback behaviour without assuming local environment files match Vercel. | Unverified |
| Unsubscribe signing | Set a dedicated, high-entropy `UNSUBSCRIBE_SECRET` in Vercel. Verify signed GET confirmation plus POST and RFC 8058 one-click unsubscribe behaviour. | Unverified |
| Re-engagement gate | Keep `REENGAGEMENT_ENABLED` absent or other than exactly `true` until the owner approves the rendered preview and a one-address test send. | Disabled by default |

Completion evidence should record the operator, time, deployment URL, migration
versions, and test-send result. It must not record passwords, SMTP credentials,
recipient addresses, or provider secrets.
