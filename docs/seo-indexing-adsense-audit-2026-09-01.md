# NounCompass SEO, Indexing, and AdSense Reapplication Audit

Date reviewed: 2026-09-01
Property checked: `sc-domain:nouncompass.me`
Primary canonical host: `https://nouncompass.me`

## Audit

Live Search Console was checked in the in-app Browser, and local SEO tooling was run against production.

Search Console overview:

- Total web search clicks: 185
- Total impressions: 13.5K
- Average CTR: 1.4%
- Average position: 8.7
- Indexed pages: 107
- Not indexed pages: 209
- Search Console last update shown in UI: 9.5 hours before review
- Page indexing report last update: 2026-08-21

Production SEO audit:

- Target: `https://nouncompass.me`
- Crawled pages: 30
- Sitemap URLs: 85
- Lighthouse average score: 0.9075
- PageSpeed average score: 0.985
- Critical technical SEO issues: 0
- High-priority technical SEO issues: 0
- Search Console API: connected

Sitemap URL Inspection:

- URLs inspected from sitemap: 85
- Submitted and indexed: 55
- Not indexed from sitemap inspection: 30
- API errors: 0
- Canonical mismatches recorded by Google: 6

## Page Rankings

Top Search Console pages by clicks in the audited 3-month window:

| Page | Clicks | Impressions | CTR | Avg. position |
| --- | ---: | ---: | ---: | ---: |
| `/articles/how-to-pay-noun-school-fees` | 53 | 2,738 | 1.94% | 7.16 |
| `/articles/how-to-generate-remita-for-noun` | 10 | 599 | 1.67% | 7.72 |
| `/articles/how-noun-students-apply-for-nelfund` | 9 | 135 | 6.67% | 5.19 |
| `/fees` | 5 | 112 | 4.46% | 10.28 |
| `/articles/how-to-read-noun-cgpa-class-of-degree-and-outstanding-credit` | 4 | 66 | 6.06% | 7.59 |
| `/articles/how-to-check-noun-results` | 3 | 51 | 5.88% | 9.53 |
| `/articles/how-to-check-outstanding-courses-on-noun-result-statement` | 3 | 111 | 2.70% | 6.77 |
| `/articles/is-noun-eligible-for-nelfund` | 3 | 45 | 6.67% | 8.22 |
| `/tools/result-checker` | 3 | 50 | 6.00% | 10.70 |
| `/tools/cgpa-calculator` | 3 | 412 | 0.73% | 11.06 |

Important CTR opportunities:

- `/articles/register-carryover-courses-noun`: 2,558 impressions, 0.08% CTR, average position 7.82.
- `/tools/cgpa-calculator`: 412 impressions, 0.73% CTR, average position 11.06.
- `/articles/how-to-generate-remita-for-noun`: low CTR on `noun remita payment`, `noun remita payment portal`, and `how to generate rrr on noun portal`.
- `/articles/how-to-pay-noun-school-fees`: low CTR on e-wallet funding queries.

## Why Pages Are Not Indexed

Live Search Console reported 209 not indexed URLs across 7 reasons:

| Reason | Count | Cause | Fix status |
| --- | ---: | --- | --- |
| Page with redirect | 58 | Mostly stale `www`/host-canonical history and older crawl records. Current sampled preferred URLs return `200`, and `www` redirects to non-`www` with `308`. | Monitor and request recrawl for priority URLs; no source redirect defect found. |
| Crawled - currently not indexed | 39 | Mostly Google quality/selection delay or non-content URL noise. Search Console marks this as Google-system driven. | Improve content value and internal prominence for priority pages. |
| Duplicate, Google chose different canonical than user | 7 | Google still has mixed `www` and non-`www` canonical history. | Current canonical host is correct; keep sitemap non-`www` and monitor recrawl. |
| Excluded by `noindex` tag | 69 | Intentional private, account, dashboard, admin, query/filter, and utility states. | Keep excluded. Do not request indexing. |
| Blocked by robots.txt | 34 | Intentional API, account, dashboard, admin, and sensitive parameter blocks. | Keep blocked. Do not index API/download/private routes. |
| Soft 404 | 1 | Isolated URL quality/state issue in GSC. | Monitor after next crawl; inspect exact URL if it persists. |
| Not found (404) | 1 | Old or malformed URL discovered by Google. | Monitor; keep real 404 for invalid URLs. |

The not-indexed total is not equal to 209 public content problems. Most excluded URLs should remain excluded for AdSense and privacy compliance.

## Exact Non-Excluded URL Findings

The relevant Search Console buckets were exported from the live Page Indexing report and checked against current production.

`Page with redirect` examples are mostly `www` variants that now correctly redirect to the preferred non-`www` URL. Examples include:

- `https://www.nouncompass.me/results`
- `https://www.nouncompass.me/fees`
- `https://www.nouncompass.me/portal`
- `https://www.nouncompass.me/articles/how-to-pay-noun-school-fees`
- `https://www.nouncompass.me/articles/register-carryover-courses-noun`
- `https://www.nouncompass.me/articles/how-to-check-noun-results`
- `https://www.nouncompass.me/articles/noun-portal-password-reset`

Current live result: these resolve to `200` on `https://nouncompass.me/...` after one redirect, with the matching non-`www` canonical. These `www` URLs should not be indexed separately.

Older non-`www` rows in the same bucket now return `200` with self-canonicals and no redirect, including:

- `https://nouncompass.me/articles/noun-core-courses-vs-electives`
- `https://nouncompass.me/articles/how-to-verify-a-noun-study-centre-before-you-travel`
- `https://nouncompass.me/articles/noun-e-exam-vs-pop`
- `https://nouncompass.me/articles/noun-study-centres-in-abuja`
- `https://nouncompass.me/articles/noun-maximum-credit-units`
- `https://nouncompass.me/articles/nelfund-requirements-for-noun-students`
- `https://nouncompass.me/about`

Current live result: these look like stale Search Console history. They should be recrawled, not redirected or noindexed.

`Duplicate, Google chose different canonical than user` contained 7 URLs:

- `https://nouncompass.me/articles/noun-installment-payment`
- `https://nouncompass.me/articles/nelfund-application-status-meanings-explained`
- `https://nouncompass.me/articles/nouonline-student-dashboard`
- `https://nouncompass.me/authors/editorial-team`
- `https://www.nouncompass.me/articles/is-noun-eligible-for-nelfund`
- `https://www.nouncompass.me/tools/study-planner`
- `https://www.nouncompass.me/articles/how-to-generate-remita-for-noun`

Current live result: the article/tool URLs resolve to the preferred non-`www` pages with correct canonicals. A real issue was found for `/authors/editorial-team`, which redirected to an external Web Growth profile. That was fixed by replacing author/reviewer redirects with first-party NounCompass profile pages.

`Crawled - currently not indexed` contained 39 URLs. All but one were generated assets such as article `opengraph-image` routes, font files, `favicon.ico`, or `manifest.webmanifest`. The one real page was:

- `https://nouncompass.me/articles/is-noun-eligible-for-nelfund`

Current live result: this article returns `200` with a matching self-canonical. It should be recrawled, and Google may still be consolidating it with the older `www` canonical record.

`Soft 404` contained:

- `https://www.nouncompass.me/articles/how-to-fix-missing-noun-e-wallet-balance`

Current live result: this old URL redirects to `https://nouncompass.me/articles/fix-missing-noun-e-wallet-balance` and then returns `200` with the correct canonical. This is an old slug/host variant and should not be indexed separately.

`Not found (404)` contained:

- `http://nouncompass.me/`

Current live result: this now redirects to `https://nouncompass.me/` and returns `200` with the homepage canonical. This is stale HTTP history.

## Fixes

Implemented in this pass:

- Rewrote SEO title/description for `register-carryover-courses-noun` to target the high-impression carryover query set more directly.
- Rewrote SEO title/description for `how-to-generate-remita-for-noun` to match `RRR`, Remita, portal payment, and e-wallet intent.
- Rewrote SEO title/description for `how-to-pay-noun-school-fees` to better cover Remita, e-wallet funding, portal balance, receipt proof, and duplicate-payment risk.
- Rewrote CGPA calculator metadata to better match `noun cgpa calculator`, quality points, degree class, and outstanding-credit intent.
- Replaced external redirects for `/authors/editorial-team`, `/authors/victor`, `/reviewers/student-workflow`, and `/reviewers/student-finance` with first-party NounCompass trust/profile pages.
- Added the author and reviewer profile pages to the sitemap.

No change was made to intentional `noindex`, `robots.txt`, API, admin, dashboard, account, download, or filtered-search exclusions.

## Priorities

1. Deploy the metadata changes and re-run live checks.
2. Request indexing only for priority public URLs that currently return `200`, are in the sitemap, and have non-`www` self-canonicals.
3. Do not request indexing for query strings, dashboard/account/admin pages, API endpoints, downloads, images, fonts, or old host variants.
4. Keep building original content around high-demand fee, Remita, results, CGPA, and registration topics.
5. Watch whether Google consolidates mixed `www` rows after recrawl.

## AdSense Approval Chances Audit

Current approval chance estimate: moderate, roughly 60-70% if the application is submitted after deployment and a short recrawl window.

Strengths:

- Core trust pages exist: About, Contact, Privacy Policy, Terms, Disclaimer, Editorial Policy, Corrections Policy, Copyright Policy, Takedown Policy, Academic Integrity, and Refund Policy.
- Sitemap, robots, metadata, canonicals, schema, HTTPS, and navigation are present.
- Search Console confirms real organic activity, with 107 indexed pages and 13.5K impressions in the current 3-month view.
- Public content is student-help focused and repeatedly distinguishes NounCompass from official NOUN channels.
- No critical or high technical SEO issues were found by the production audit.

Risks before reapplying:

- Mixed `www`/non-`www` canonical history is still visible in Search Console, even though current redirects and live canonicals look correct.
- `course-materials` is useful but download-oriented, which is reviewer-sensitive for AdSense. Keep ad density low or avoid ads there at first.
- Some pages are tools or gated account workflows; AdSense approval should lean on open informational content, not signed-in-only value.
- CTR is low on some pages already ranking on page one, especially carryover registration and CGPA queries.
- Core Web Vitals field data is unavailable in GSC, and the audit found LCP around 3.7s in the sampled run.

Decision:

- Search Console health: suitable for continued indexing and monitoring.
- AdSense readiness: close, but apply after deployment of the CTR metadata fixes and a short live verification pass.
- Recommended first ad strategy after approval: conservative, content-first placements on article pages only. Avoid aggressive ads above the fold, avoid ads inside forms/tools, and avoid download-adjacent placements on `course-materials`.

## Final Checklist

- [x] Live Search Console checked.
- [x] Page indexing counts captured.
- [x] Page ranking and CTR opportunities captured.
- [x] Production SEO audit run.
- [x] Sitemap URL Inspection run.
- [x] CTR metadata fixes implemented.
- [ ] Deploy changes.
- [ ] Re-run production audit after deployment.
- [ ] Request indexing for priority public URLs only.
- [ ] Apply for AdSense after deployment and live verification.
