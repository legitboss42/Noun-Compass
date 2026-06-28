# NounCompass Phase 4 Site Inventory

## Audit

- Audit date: 2026-06-19
- Local build status: pass
- Local crawl status: 52 public sitemap URLs returned `200`
- Sitemap URL count: 52 public URLs
- Generated routes in build output: 58 total routes including metadata and API routes
- Article count: 30
- Image file count under `public/images`: 51

`Indexed` below means index intent from local code and crawl state, not live Google index confirmation.

## Route Inventory

| Route | Type | Status | Indexed | Notes |
| --- | --- | --- | --- | --- |
| / | Homepage | 200 | Intended | Healthy content-first homepage, crawl verified |
| /about | Policy/Trust | 200 | Intended | Trust page, linked in footer |
| /admission | Category | 200 | Intended | Category hub, sitemap-listed |
| /authors/editorial-team | Author | 200 | Intended | Visible from footer and article trust elements |
| /authors/victor | Author | 200 | Intended | Linked from author boxes; not an orphan |
| /contact | Policy/Trust | 200 | Intended | Contact/trust page |
| /copyright-policy | Policy/Trust | 200 | Intended | Policy page |
| /corrections-policy | Policy/Trust | 200 | Intended | Policy page |
| /course-materials | Tool/Library | 200 | Intended | Dynamic search/library page, canonical to base route |
| /disclaimer | Policy/Trust | 200 | Intended | Policy page |
| /editorial-policy | Policy/Trust | 200 | Intended | Policy page |
| /examinations | Category | 200 | Intended | Category hub, sitemap-listed |
| /fees | Tool | 200 | Intended | Tool page with client fee checker and server API |
| /gst | Category | 200 | Intended | Category hub, sitemap-listed |
| /portal | Category | 200 | Intended | Category hub, sitemap-listed |
| /privacy-policy | Policy/Trust | 200 | Intended | Policy page |
| /results | Category | 200 | Intended | Category hub, sitemap-listed |
| /student-guides | Category | 200 | Intended | Dynamic search hub, canonical to base route |
| /study-centres | Category | 200 | Intended | Category hub, sitemap-listed |
| /takedown-policy | Policy/Trust | 200 | Intended | Policy page |
| /terms | Policy/Trust | 200 | Intended | Policy page |
| /tools | Tool | 200 | Intended | Tool landing page |
| /articles/fix-missing-noun-e-wallet-balance | Article | 200 | Intended | fees article; featured image and internal links verified |
| /articles/gst302-summary | Article | 200 | Intended | gst article; featured image and internal links verified |
| /articles/how-to-apply-for-noun-admission | Article | 200 | Intended | admission article; featured image and internal links verified |
| /articles/how-to-check-noun-results | Article | 200 | Intended | results article; featured image and internal links verified |
| /articles/how-to-generate-remita-for-noun | Article | 200 | Intended | fees article; featured image and internal links verified |
| /articles/how-to-pay-noun-school-fees | Article | 200 | Intended | fees article; featured image and internal links verified |
| /articles/how-to-register-noun-courses | Article | 200 | Intended | portal article; featured image and internal links verified |
| /articles/noun-admission-requirements | Article | 200 | Intended | admission article; featured image and internal links verified |
| /articles/noun-compulsory-fee | Article | 200 | Intended | fees article; featured image and internal links verified |
| /articles/noun-core-courses-vs-electives | Article | 200 | Intended | portal article; featured image and internal links verified |
| /articles/noun-course-materials-pdf | Article | 200 | Intended | student-guides article; featured image and internal links verified |
| /articles/noun-e-exam-vs-pop | Article | 200 | Intended | examinations article; featured image and internal links verified |
| /articles/noun-e-wallet-refund | Article | 200 | Intended | fees article; featured image and internal links verified |
| /articles/noun-exam-registration-guide | Article | 200 | Intended | examinations article; featured image and internal links verified |
| /articles/noun-financial-statement | Article | 200 | Intended | fees article; featured image and internal links verified |
| /articles/noun-graduation-clearance-fee-convocation-costs | Article | 200 | Intended | student-guides article; featured image and internal links verified |
| /articles/noun-installment-payment | Article | 200 | Intended | fees article; featured image and internal links verified |
| /articles/noun-late-registration-fee | Article | 200 | Intended | fees article; featured image and internal links verified |
| /articles/noun-maximum-credit-units | Article | 200 | Intended | portal article; featured image and internal links verified |
| /articles/noun-missing-course-code | Article | 200 | Intended | portal article; featured image and internal links verified |
| /articles/noun-portal-password-reset | Article | 200 | Intended | portal article; featured image and internal links verified |
| /articles/noun-postgraduate-school-fees | Article | 200 | Intended | fees article; featured image and internal links verified |
| /articles/noun-registration-slip-printout | Article | 200 | Intended | portal article; featured image and internal links verified |
| /articles/noun-school-fees-new-students | Article | 200 | Intended | fees article; featured image and internal links verified |
| /articles/noun-school-fees-returning-students | Article | 200 | Intended | fees article; featured image and internal links verified |
| /articles/noun-study-centres-in-lagos | Article | 200 | Intended | study-centres article; featured image and internal links verified |
| /articles/noun-support-ticket-guide | Article | 200 | Intended | student-guides article; featured image and internal links verified |
| /articles/nouonline-student-dashboard | Article | 200 | Intended | portal article; featured image and internal links verified |
| /articles/register-carryover-courses-noun | Article | 200 | Intended | portal article; featured image and internal links verified |
| /articles/update-profile-nouonline | Article | 200 | Intended | portal article; featured image and internal links verified |
| /sitemap.xml | Metadata route | 200 | Yes | 52 public URLs emitted locally |
| /robots.txt | Metadata route | 200 | No | Allows public pages and disallows /api/ |
| /api/fees | API route | 200 | No | Public JSON feed for fee checker; disallowed in robots |
| /api/course-materials/download | API route | 200 (HEAD sample) | No | Download proxy route with X-Robots-Tag noindex headers |
| /_not-found | Hidden route | 200 | No | Framework not-found surface; not in sitemap |

## Findings

- Orphan pages found: none in the audited public route set
- Broken public routes found: none in the local crawl
- Hidden routes found: `/_not-found`, `/api/fees`, `/api/course-materials/download`
- Draft routes found: none
- Test routes found: none
- Query-state routes found:
  - `/student-guides?q=...`
  - `/course-materials?q=...&faculty=...&page=...`
  - These canonicalize to the base route and are not separate sitemap entries

## Notes

- Article image links and linked public assets were verified locally with `49` referenced assets returning `200`.
- The sitemap includes all public page routes and all `30` article routes.
- Search Console index status cannot be confirmed from the repo alone; only index intent and crawl readiness were verified here.
