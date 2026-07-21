# NOUN Compass Website Status Report

Date: 2026-07-21

## Status Summary

- Local build status: passing
- Repo state: active local changes are present and not committed in this snapshot
- Scope of this report: repo-backed status, not a live production or live database audit

## Current Local Change State

The following current-turn files are modified or newly added locally:

- `app/layout.tsx`
- `app/globals.css`
- `components/scroll-reset.tsx`
- `components/back-to-top-button.tsx`

These changes implement global scroll-reset behavior and a floating back-to-top button.

## What Is Implemented

### Public website

- Homepage
- Admissions section
- Fees section
- Portal section
- Results section
- Examinations section
- Study centres section
- GST section
- Student guides section
- Course materials section
- Tools hub
- Membership page
- Contact and trust/legal pages

### Content system

- Filesystem MDX article publishing
- Auto-generated article routes
- Category archives
- Related reads
- FAQ rendering
- Article metadata
- Structured data
- Sitemap integration

### Student tools

- Result checker
- School fees checker
- Study planner
- CGPA calculator
- Free exam diagnostic

### Student platform

- Sign up
- Sign in
- Password reset
- Semester profile setup
- Dashboard
- Practice dashboard
- Support area
- Payment callback flow
- Payment receipt page

### Premium and payments

- Semester Pass pricing page
- Flutterwave checkout initialization
- Flutterwave payment verification
- Flutterwave webhook handling
- 180-day one-time access model

### Exam practice engine

- Diagnostic mode
- Practice mode
- Timed mock mode
- Revision scheduling
- Bookmarks
- Question reports
- Answer review and scoring

### Editorial, trust, and SEO

- About page
- Contact page
- Privacy Policy
- Terms
- Disclaimer
- Editorial Policy
- Corrections Policy
- Copyright Policy
- Takedown Policy
- Refund Policy
- Academic Integrity Policy
- Open Graph images
- Twitter images
- JSON-LD structured data
- Sitemap generation
- Robots output

### UX behaviors recently implemented

- All pages force-start at the top on load
- Refresh starts at the top
- Internal route changes reset to the top
- Same-page re-entry clicks reset to the top
- Floating back-to-top button appears after scroll begins

### Editorial profile routing

- Author, reviewer, and editorial profile surfaces are routed to:
  - `https://webgrowth.info/victorious/`

## Numbers

### Route and surface counts

- `48` `page.tsx` route components
- `15` API route handlers
- `59` article posts in `content/articles`
- `127` static pages generated in the last successful local build
- `8` main content categories
- `10` primary nav items
- `4` configured social profiles

### Exam preparation and practice counts

- `5` seeded exam-practice course banks:
  - `GST101`
  - `GST102`
  - `GST107`
  - `GST201`
  - `GST302`

### Content/data snapshot counts

These values come from repo snapshots and source files, not from a fresh live crawl today.

- Official course-material snapshot:
  - `10` source pages
  - `2,658` source rows
  - `2,635` unique materials
  - `2,582` unique course codes
- Puredu fee snapshot:
  - `614` programme/level/semester combinations
  - `473` captured
  - `141` empty
  - `4,141` course rows
- NOUN Update fee snapshot:
  - `628` combinations
  - `360` captured
  - `268` empty
  - `2,920` course rows
- Curricula snapshot:
  - `99` curriculum rows

## Backend Status

### Backend implementation summary

- Supabase-backed auth and application data model
- Profile creation on new-user signup
- Role model and staff role helpers
- Membership activation workflow
- Row-level security across core platform tables
- Admin surfaces for questions and schedule management
- Local pilot question-store fallback path also exists in code

### Backend schema stats

- `6` Supabase migration files
- `29` tables defined in migrations
- `27` RLS policies defined in migrations

### Main backend domains implemented

- Profiles
- User roles
- Email preferences
- Academic terms
- Exam schedule versions
- Exam schedule entries
- Notices
- Question banks
- Questions
- Question versions
- Question options
- Practice sessions
- Practice responses
- Practice session question assignments
- Revision state
- Membership plans
- Payment attempts
- Payment events
- Memberships
- Entitlement adjustments
- Support tickets
- Support messages
- Content reviews
- Notifications
- Audit logs
- Cron runs
- Newsletter subscribers
- Question bookmarks
- Question reports

### Available API endpoints

- `/api/newsletter`
- `/api/contact`
- `/api/webhooks/flutterwave`
- `/api/questions/[question-id]/bookmark`
- `/api/checkout/verify`
- `/api/question-reports`
- `/api/tools/study-planner/courses`
- `/api/checkout/initialize`
- `/api/results`
- `/api/course-materials/download`
- `/api/practice/sessions`
- `/api/cron/daily`
- `/api/practice/sessions/[session-id]/complete`
- `/api/practice/sessions/[session-id]/answer`
- `/api/fees`

## Tool and Feature Notes

### Tools hub

The tools hub currently exposes five user-facing tool paths:

- Result checker
- School fees checker
- Study planner
- CGPA calculator
- Free exam diagnostic

### Membership model

- Price: `NGN 2,500`
- Access duration: `180 days`
- One-time payment, not auto-renewing

## Validation Status

Validated successfully in this session:

- `git diff --check`
- `npm.cmd run build`

Last validated build result in this session:

- Next.js `16.2.9`
- Static generation completed successfully for `127` pages

## What This Report Does Not Confirm

This report does not confirm live production values such as:

- live user count
- live payment count
- live revenue
- live membership count
- live ticket volume
- live newsletter subscriber count
- live database row counts
- live deployment health

Those values require a live database, hosting, or analytics inspection rather than repo-only inspection.
