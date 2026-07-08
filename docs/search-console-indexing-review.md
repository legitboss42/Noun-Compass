# NounCompass Search Console Indexing Review

Date reviewed: July 8, 2026
Property checked: `sc-domain:nouncompass.me`
Property type: Domain property
Ownership verified: Yes

## Overview

- Indexed pages: `99`
- Not indexed pages: `118`
- Manual actions: None
- Security issues: None
- Crawl requests in the last 90 days: `3.57K`
- Property added in Search Console: `June 19, 2026`

## Sitemap Status

- Submitted sitemap: `https://nouncompass.me/sitemap.xml`
- Status: `Success`
- Submitted: `June 28, 2026`
- Last read by Google: `July 8, 2026`
- Currently discovered pages from live sitemap: `81`

Live sitemap and robots checks were clean:

- `https://nouncompass.me/sitemap.xml` loads successfully
- `https://nouncompass.me/robots.txt` loads successfully
- Preferred canonical host is non-`www`
- No live sitemap URL breakage was found in the sampled validation pass

## Not Indexed Issue Review

### A. Should remain not indexed

| Issue | Count | Example URLs | Why this is normal |
| --- | ---: | --- | --- |
| Excluded by `noindex` tag | 46 | `https://www.nouncompass.me/student-guides?q=GST302`, `https://www.nouncompass.me/course-materials?q=CIT104` | Query/filter states are intentionally non-indexable and should stay that way. |
| Blocked by robots.txt | 26 | `https://www.nouncompass.me/api/course-materials/download?...` | API and download endpoints should not be indexed. |
| Crawled - currently not indexed | 20 | `.../opengraph-image`, `favicon.ico?...`, `manifest.webmanifest`, font assets | Mostly non-content assets and host-variant noise. |
| Not found (404) | 1 | `http://nouncompass.me/` | HTTP variant noise, not a production content problem. |

### B. Valid pages that should be indexed

| URL | Current state | Likely cause | Classification |
| --- | --- | --- | --- |
| `https://nouncompass.me/tools/study-planner` | URL is not on Google | Missing from sitemap and unknown to Google | Needs code/config fix + indexing request |
| `https://nouncompass.me/reviewers/student-workflow` | URL is not on Google | Missing from sitemap and unknown to Google | Needs code/config fix + indexing request |
| `https://nouncompass.me/reviewers/student-finance` | URL is not on Google | Missing from sitemap and unknown to Google | Needs code/config fix + indexing request |

### C. Valid but likely delayed by Google

| Issue | Count | Example URLs | Assessment |
| --- | ---: | --- | --- |
| Page with redirect | 22 | `https://nouncompass.me/articles/is-noun-eligible-for-nelfund`, `https://nouncompass.me/articles/noun-study-centres-in-abuja` | High chance of stale Google history. Live checks returned `200` on the preferred non-`www` URLs with correct canonicals. |
| Discovered - currently not indexed | 3 | `https://www.nouncompass.me/authors/editorial-team`, `https://www.nouncompass.me/contact`, `https://www.nouncompass.me/fees` | Mostly `www` host discovery noise. Non-`www` live URLs are valid. |

## Live URL Inspection Findings

Priority URLs were inspected directly in Search Console.

| URL | Search Console result | Crawl allowed | Indexing allowed | Sitemap presence | Notes |
| --- | --- | --- | --- | --- | --- |
| `https://nouncompass.me/fees` | URL is on Google | Yes | Yes | Yes | Healthy. |
| `https://nouncompass.me/tools/cgpa-calculator` | URL is on Google | Yes | Yes | No on the live sitemap snapshot used during review | Already indexed despite sitemap omission. |
| `https://nouncompass.me/tools/study-planner` | URL is not on Google | Yes | Yes | No | True sitemap discovery gap. |
| `https://nouncompass.me/reviewers/student-workflow` | URL is not on Google | Yes | Yes | No | True sitemap discovery gap. |
| `https://nouncompass.me/reviewers/student-finance` | URL is not on Google | Yes | Yes | No | True sitemap discovery gap. |
| `https://nouncompass.me/articles/is-noun-eligible-for-nelfund` | URL is not on Google, labeled `Page with redirect` | Yes | Yes | Yes | Live HTML now serves `200` with non-`www` canonical. This looks like Google delay/stale canonical history, not a current site bug. |

## URL Classification

### Should be indexed

- Homepage and main hub pages
- `/fees`
- `/portal`
- `/results`
- `/study-centres`
- `/tools/cgpa-calculator`
- `/tools/study-planner`
- `/reviewers/student-workflow`
- `/reviewers/student-finance`
- High-value article pages such as:
  - `/articles/how-to-generate-remita-for-noun`
  - `/articles/how-to-pay-noun-school-fees`
  - `/articles/is-noun-eligible-for-nelfund`
  - `/articles/how-noun-students-apply-for-nelfund`
  - `/articles/nelfund-approval-and-disbursement-guide-for-noun-students`
  - `/articles/how-to-check-noun-results`
  - `/articles/nouonline-student-dashboard`
  - `/articles/noun-elearn-and-tma-guide`
  - `/articles/full-list-of-verified-noun-study-centres-in-nigeria`

### Should remain not indexed

- Search and filter states under `/student-guides` and `/course-materials`
- API and download endpoints
- Manifest, icon, OG-image, and font asset URLs

### Needs investigation only

- `www` host variants that Google discovered but should consolidate naturally to the preferred non-`www` host
- Old redirect-bucket article URLs that now return `200` cleanly on the preferred canonical host

## Fixes Implemented In The Codebase

### Sitemap fixes

Added the missing public pages to `app/sitemap.ts`:

- `/tools/cgpa-calculator`
- `/tools/study-planner`
- `/reviewers/student-workflow`
- `/reviewers/student-finance`

Also removed misleading build-time `lastModified` dates from static sitemap entries so the sitemap better reflects stable static routes.

### Indexing hardening

Added explicit `X-Robots-Tag: noindex, nofollow, noarchive` response headers to non-indexable API routes:

- `app/api/contact/route.ts`
- `app/api/fees/route.ts`
- `app/api/tools/study-planner/courses/route.ts`

These changes reinforce the intended Search Console behavior for API responses and reduce future index-noise.

## URLs Submitted For Indexing

Indexing requests were submitted in Search Console for:

- `https://nouncompass.me/tools/study-planner`
- `https://nouncompass.me/reviewers/student-workflow`
- `https://nouncompass.me/reviewers/student-finance`
- `https://nouncompass.me/articles/is-noun-eligible-for-nelfund`

At submission time, Search Console displayed the live-test flow: `Testing if live URL can be indexed`.

## Root Cause Summary

Most not-indexed URLs are not bugs.

Real issues found:

1. Public utility/reviewer pages were missing from the sitemap.
2. Google still has stale redirect/canonical history for at least one important article.

Normal or acceptable noise:

1. Query/filter URLs excluded by `noindex`
2. API routes blocked by robots or `X-Robots-Tag`
3. Asset URLs not indexed
4. `www` host variants discovered before canonical consolidation

## Next Actions

1. Deploy the sitemap and API header fixes.
2. Recheck the sitemap in Search Console after deployment so discovered page count increases beyond `81`.
3. Monitor the four submitted URLs for indexing changes over the next several days.
4. Do not request indexing for query/filter states or API endpoints.
5. If `Page with redirect` persists on major article URLs after Google recrawls, inspect internal links and Search Console referring pages again.
