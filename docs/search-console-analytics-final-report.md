# NounCompass Search Console + Google Analytics Final Report

Date completed: July 8, 2026

## 1. Search Console Property Checked

- Property: `sc-domain:nouncompass.me`
- Property type: Domain property
- Ownership verified: Yes
- Manual actions: None
- Security issues: None

## 2. Indexed Page Count

- Indexed pages: `99`
- Not indexed pages: `118`

## 3. Not-Indexed Issue Categories

| Issue category | Count | Assessment |
| --- | ---: | --- |
| Excluded by `noindex` tag | 46 | Normal and intentional for query/filter URLs |
| Blocked by `robots.txt` | 26 | Normal and intentional for API/download endpoints |
| Page with redirect | 22 | Mostly likely Google delay or stale canonical/redirect memory |
| Crawled - currently not indexed | 20 | Mostly assets and non-content URLs, not a core problem |
| Discovered - currently not indexed | 3 | Mostly `www` host discovery noise |
| Not found (404) | 1 | Normal variant noise (`http://nouncompass.me/`) |

## 4. URLs That Should Be Indexed

- `https://nouncompass.me/tools/study-planner`
- `https://nouncompass.me/reviewers/student-workflow`
- `https://nouncompass.me/reviewers/student-finance`
- `https://nouncompass.me/fees`
- `https://nouncompass.me/portal`
- `https://nouncompass.me/results`
- `https://nouncompass.me/study-centres`
- High-value article pages in the fees, portal, results, study-centre, and NELFUND clusters

## 5. URLs That Should Remain Not Indexed

- Filter/search states under `/student-guides` and `/course-materials`
- API and download endpoints
- Manifest, icon, OG-image, and font asset URLs

## 6. Fixes Implemented

Implemented in the codebase:

- Added missing public pages to `app/sitemap.ts`
  - `/tools/cgpa-calculator`
  - `/tools/study-planner`
  - `/reviewers/student-workflow`
  - `/reviewers/student-finance`
- Removed misleading build-time `lastModified` dates from static sitemap entries
- Added `X-Robots-Tag: noindex, nofollow, noarchive` to:
  - `app/api/contact/route.ts`
  - `app/api/fees/route.ts`
  - `app/api/tools/study-planner/courses/route.ts`

## 7. URLs Submitted For Indexing

- `https://nouncompass.me/tools/study-planner`
- `https://nouncompass.me/reviewers/student-workflow`
- `https://nouncompass.me/reviewers/student-finance`
- `https://nouncompass.me/articles/is-noun-eligible-for-nelfund`

## 8. Sitemap Status

- Live sitemap URL: `https://nouncompass.me/sitemap.xml`
- Current Search Console status: `Success`
- Current discovered pages in live Search Console snapshot: `81`
- Sitemap issue found: four public pages were missing from the sitemap
- Expected outcome after deploy: those pages become eligible for sitemap-led discovery

## 9. Robots Status

- `https://nouncompass.me/robots.txt` loads correctly
- Main content routes are crawlable
- API routes are intentionally non-indexable
- No accidental `noindex` was found on priority content pages during the review

## 10. Google Analytics Daily Page Views

The GA explorer surface exposed completed daily rows through `July 6, 2026`.

| Date | Page views | Users | Sessions | Organic users |
| --- | ---: | ---: | ---: | ---: |
| 2026-06-27 | 18 | 8 | 11 | 0 |
| 2026-06-28 | 4 | 3 | 4 | 0 |
| 2026-06-29 | 5 | 2 | 2 | 0 |
| 2026-06-30 | 7 | 4 | 5 | 2 |
| 2026-07-01 | 4 | 3 | 3 | 0 |
| 2026-07-02 | 3 | 2 | 2 | 1 |
| 2026-07-03 | 5 | 5 | 5 | 0 |
| 2026-07-04 | 6 | 3 | 5 | 1 |
| 2026-07-05 | 12 | 11 | 11 | 2 |
| 2026-07-06 | 15 | 13 | 13 | 1 |

Headline GA totals:

- Last 7 days: `45` views, `37` active users, `36` new users
- Last 28 days: `79` views, `52` active users, `61` sessions

## 11. Top Pages By Views

| Page | Views |
| --- | ---: |
| `NOUN Student Guides for Admission, Fees, Portal, and Results` | 50 |
| `Step-by-Step Guide: How to Generate Remita for NOUN Payments | NOUN Compass` | 6 |
| `NOUN Admission Guides | NOUN Compass` | 3 |
| `NOUN CGPA Calculator and Grade Point Estimator | NOUN Compass` | 3 |
| `How to Pay NOUN School Fees with Remita | NOUN Compass` | 2 |
| `NOUN Course Registration Guide: Choose and Verify Your Courses | NOUN Compass` | 2 |
| `NOUN Portal Password Reset (Nouonline) | Recover Login Access | NOUN Compass` | 2 |

## 12. Organic Search Performance

- Organic search sessions in the last 28 days: `9`
- Organic search users in the last 28 days: `7`
- Organic search engagement rate: `55.56%`
- Organic search average engagement time per session: `1m 15s`

This is low volume but relatively strong-quality traffic.

## 13. Monetization Readiness Recommendation

### AdSense application

Borderline but improving.

Why:

- Trust pages and technical SEO foundations are in place
- No manual action or security issue was found
- Sitemap and robots are healthy overall
- Organic search quality is promising
- Total traffic volume is still modest
- Important utility/reviewer pages still need discovery and indexing gains

Recommendation:

- Keep improving index coverage and internal linking first
- Continue publishing original, student-help content in the already-performing clusters
- Hold off on adding ads until the newly exposed pages are discovered and traffic stabilizes upward

### Student assistance lead capture

Ready now.

The site already has intent around admission, fees, portal help, NELFUND, and result support. Lead capture can be strengthened safely without waiting for full AdSense readiness.

### Email list capture

Ready to test carefully.

Focus on useful student resources, not aggressive popups. A simple guide/download or update-alert offer is a better fit than a hard sell.

### More content publishing

Recommended.

Best next clusters:

- Fees and Remita
- Portal and password recovery
- Results, CGPA, and statement workflows
- Study centres
- NELFUND support

### Performance optimization first

Important, but not the main blocker in this review.

The bigger indexing opportunity was sitemap completeness and content discovery, not a robots/canonical failure.

## 14. Remaining Actions

1. Deploy the sitemap and API header fixes.
2. Resubmit or recheck the sitemap after deploy.
3. Monitor the four submitted URLs for indexing changes.
4. Strengthen internal links from the main student-guide hub to tools, reviewer pages, fees, portal, and results.
5. Watch whether the stale `Page with redirect` article URLs clear after Google recrawls.
6. Keep improving CTR on pages already earning impressions.
7. Grow search traffic before treating unindexed query/filter URLs as a problem.

## Validation

- `npm run lint` passed with 1 pre-existing warning in `scripts/seo-audit/search-console.mjs`
- `npx tsc --noEmit` passed
- `npm run build` passed
