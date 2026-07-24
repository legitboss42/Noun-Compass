# Mobile Navigation and Study Planner Plan

Date: 2026-07-24

## Existing resources to reuse

- App Router layouts: `app/layout.tsx`, `app/dashboard/layout.tsx`.
- Public chrome: `components/site-shell.tsx`, `components/homepage/homepage.tsx`, `components/homepage/home-interactions.tsx`.
- Existing auth helpers: `requireUser()`, `getCurrentUser()`, Supabase server/client helpers.
- Membership gate: `membershipIsActive()` and the existing `memberships` table.
- Existing dashboard routes: `/dashboard`, `/dashboard/profile`, `/dashboard/practice`, `/dashboard/support`.
- Existing public student routes: `/exam-prep`, `/course-materials`, `/tools/study-planner`, `/membership`.
- Existing notification and email preference tables.
- Existing daily cron route: `app/api/cron/daily/route.ts`.
- Existing Brevo SMTP implementation in `lib/contact-mail.ts`.

## Findings

- The public homepage header is rendered globally from `app/layout.tsx`, so the public hamburger remains visible on authenticated dashboard pages.
- The large mobile "Student Workspace" panel is the dashboard sidebar from `app/dashboard/layout.tsx`.
- The fixed bottom navigation is `MobileBottomNavigation` in `components/homepage/home-interactions.tsx`.
- The bottom nav active state uses loose `href` matching. Since signed-in Account currently points to `/dashboard`, it can mark Account active on the dashboard.
- Dashboard pages use their own layout, but that layout does not currently provide a compact authenticated mobile header.
- Study Planner data is stored only in browser localStorage under `noun-compass-study-planner-v1`.
- Profiles do not store a timezone. The app already formats student dates in `Africa/Lagos`.
- Notifications and email preferences exist. Transactional email support exists through Brevo SMTP, but no Study Planner reminder workflow exists yet.

## Navigation strategy

- Keep the public header and public mobile menu for public pages.
- Mark the dashboard shell with `data-auth-shell="student"` and hide public chrome there.
- Add a compact authenticated mobile header to the dashboard layout.
- Preserve the existing desktop dashboard sidebar.
- Hide the large sidebar on mobile and replace its secondary actions with a drawer.
- Reuse one pathname-aware student navigation helper for active state mapping.
- Switch the mobile bottom navigation to authenticated destinations when a Supabase session is present.

## Membership enforcement strategy

- Keep the visible Study Planner free.
- Enforce premium calendar export and reminder persistence in server actions and route handlers.
- Use the user's own Supabase session for ordinary writes and membership reads.
- Do not expose service-role credentials to browser code.

## Calendar integration strategy

- Store the latest premium plan and generated sessions in Supabase.
- Provide a native `.ics` calendar export route for paid members.
- Keep calendar integration free and provider-neutral.

## Reminder strategy

- Add persisted session reminder fields.
- Extend the existing daily cron route to create reminder notifications for upcoming saved study sessions.
- Send email reminders only when SMTP is configured and the user's email preferences allow reminders.
- Use notification dedupe keys so repeated cron runs do not duplicate reminders.

## Schema changes

- Add `study_plans`.
- Add `study_plan_sessions`.
- Add `study_reminders` to `email_preferences`.
- Add indexes and owner-only RLS policies for study plan tables.

## Testing plan

- Add unit tests for student mobile route matching.
- Add unit tests for Study Planner calendar generation and premium reminder windows.
- Run `git diff --check`.
- Run `npm run lint`.
- Run `npx tsc --noEmit`.
- Run `npm run test:platform`.
- Run `npm run build`.
- Use Chrome only for final mobile dashboard and Study Planner visual verification if a live controlled session is available.
