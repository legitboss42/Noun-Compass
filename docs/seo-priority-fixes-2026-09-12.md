# Priority SEO Fixes — 2026-09-12

Branch: `fix/priority-seo-2026-09-12`
Property: `sc-domain:nouncompass.me`
Latest settled Search Console window reviewed: 2026-08-13 through 2026-09-09

## Baseline

- 190 clicks
- 12,184 impressions
- 1.56% CTR
- Average position 7.77
- 89 sitemap URLs tracked
- 55 indexed
- 34 not indexed
- Indexing health score 81
- 25 URLs classified by Google as `Page with redirect`
- 9 URLs classified as `Duplicate, Google chose different canonical than user`

## Indexing diagnosis

### Page with redirect

All 25 currently tracked sitemap URLs in this bucket were audited live. Every one currently returns HTTP 200, is indexable, and has a self-referencing non-www canonical. No current application redirect defect was found.

Decision: no redirect or canonical code changes. These classifications are stale Google crawl/history states and should clear through recrawl rather than by redirecting healthy canonical pages.

### Duplicate canonical

All 9 current duplicate-canonical URLs return HTTP 200, are indexable, and are self-canonical.

Eight cases still have material Search Console visibility attributed to the old `www.nouncompass.me` host. The old-host variants were audited and each performs one 308 redirect to the equivalent non-www URL, then resolves to the correct 200 self-canonical page.

Decision: preserve the host redirect and canonical architecture. Do not create new redirects or merge distinct pages merely to make the Search Console bucket disappear.

The exception is `/authors/editorial-team`. It had no meaningful recent search visibility and remained a thin collective profile after a previous identity-link correction. The page is strengthened in this batch so Google and readers receive a clearer entity distinction between:

- the collective NOUN Compass Editorial Team byline,
- the named founder profile at `/authors/victor`, and
- the Student Workflow and Student Finance review roles.

### Enugu regression

`/articles/noun-study-centres-in-enugu` is currently classified as a Google-selected canonical duplicate, but live inspection shows successful crawling, indexing allowed, and a self-canonical page. Search Analytics still assigns 59 impressions and 1 click to the old `www` URL versus only 1 impression to the non-www URL in the settled window.

Decision: no Enugu content merge or canonical change. The evidence points to host consolidation, not competing Enugu content.

## CTR and search-intent changes

### Carryover guide

Current performance: 2,542 impressions, 5 clicks, average position 6.58.

The page was written primarily as a registration tutorial, while the dominant search demand is about the carryover pass mark and scores below 40. The new priority intent leads with that question and preserves registration guidance as a secondary next step.

Current NOUN FAQ guidance used for the factual callout:

- undergraduate students generally require 40% and above to pass,
- Nursing programmes require 50% and above,
- postgraduate programmes typically require 50% and above.

Official source: https://nou.edu.ng/faqs/

### Remita guide

The dedicated Remita article receives most impressions for `noun remita payment portal`, but the school-fees article also competes for some of that intent.

The Remita page now explicitly owns `NOUN Remita Payment Portal` / RRR generation intent and surfaces the published NOUN wallet-payment route: Manage Wallet → Load Wallet → amount → Pay → save RRR → Check Payment Status.

Official source: https://nou.edu.ng/procedure-for-registration-returning-students/

### School-fees guide

The school-fees article receives strong visibility for e-wallet funding and portal-payment queries. It now leads more clearly on paying school fees and funding the NOUN e-wallet, while linking Remita/RRR-specific intent to the dedicated Remita guide.

### CGPA calculator

The search query `noun cgpa calculator` has strong page-one visibility but weak CTR. The title is shortened from a long multi-clause title to the query-led `NOUN CGPA Calculator & GPA Checker`, with a concise description covering GPA, CGPA, grade points, and degree class.

### Result checker

The result-checker title is shortened and clarified to `NOUN Result Checker: Open Your Official Result`. The description makes clear that NounCompass validates the matriculation-number format and then opens the official result statement rather than claiming to host the academic record itself.

### Fees checker

No change. The current title `NOUN Fees Checker (2026): Cost by Programme` is already within a healthy snippet length, the H1 matches the task, and `fees checker` produced a 7.4% CTR in the latest settled data. Rewriting a healthy snippet without evidence would add risk for no defensible gain.

## Regression coverage

A new platform regression test covers:

- carryover pass-mark intent and official source,
- Remita versus school-fee intent separation,
- application of article overrides to metadata, visible copy, and schema,
- concise CGPA and result-checker metadata,
- Editorial Team entity separation and reviewer links,
- preservation of the healthy fees-checker snippet.

A dependency-free local TDD harness was run before repository changes:

- RED: 0 passed / 5 failed against the current source snapshot
- GREEN: 5 passed / 0 failed against the proposed behaviour

The branch build and rendered-page checks must pass before this batch is considered complete.

## Deployment status

No production deployment is authorized by this commit batch. Production must remain on `main` until separate deployment authorization is provided.
