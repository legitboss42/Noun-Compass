# Checkpoint 3 — Editorial and SEO Remediation Report

Date: 2026-08-12

Scope: the 59 existing MDX article URLs only

Decision boundary: no new articles, payment/email changes, or AdSense implementation

## Audit

The repository contains exactly 59 MDX files with 59 unique frontmatter slugs.
All required base frontmatter fields are present. Ten articles contain both a
`sourceReviewSummary` and one or more `reviewedSources`; 49 do not. Those ten
records are preserved as repository-recorded evidence, but none was represented
as rechecked on 2026-08-12.

No current URL-level Google Search Console export or verified query/page dataset
was available in the checkout. GSC evidence is therefore recorded as
`unavailable-unverified` on all 59 dispositions. This checkpoint did not browse
and source-verify all 59 articles, and it does not claim that it did.

Disposition result:

| Decision | Count | Indexable | Meaning |
| --- | ---: | --- | --- |
| Keep | 10 | Yes | Distinct useful intent with existing source-review evidence; current recheck still required. |
| Rewrite | 49 | Yes | Distinct useful intent, but a full current source review and editorial rewrite/check is required. |
| Merge | 0 | No applicable targets | No duplicate intent was strong enough to justify losing an original URL without GSC evidence. |
| Retire | 0 | No applicable targets | No page was proven unsupported and valueless enough to remove. |

## Issues

1. Existing `updatedAt` values were being emitted as current sitemap,
   Open Graph, visible last-checked, and schema dates without a separately
   verified editorial review state.
2. The active article template implied that every assigned review desk had
   already checked every source.
3. Static sitemap routes received the build time as `lastModified`, creating a
   freshness claim unrelated to content changes.
4. The active editorial profile misspelled `Victorious` as `Victoious`.
5. Old phase/report documents can be mistaken for current product, route,
   deployment, test, Search Console, or AdSense truth.
6. `docs/course-material-coverage.md` contained one malformed UTF-8 replacement
   character.
7. Current source freshness remains incomplete for all 59 pages; 49 have no
   structured source-review block in frontmatter.

## Fixes

- Added `lib/editorial-dispositions.ts`, with an explicit slug, URL, intent,
  cluster, GSC evidence state, source evidence, current review state, review
  date, decision, canonical target, author, reviewer, status, indexability,
  date-metadata state, and AdSense-readiness state for every original URL.
- Made article static generation and sitemap article inclusion follow the
  manifest's indexable set.
- Removed generated static and unverified article `lastModified` values from the
  sitemap.
- Suppressed visible, Open Graph, and BlogPosting date claims until a manifest
  date is verified; MDX frontmatter dates were not bulk changed.
- Kept the existing permanent legacy alias
  `/articles/how-to-fix-missing-noun-e-wallet-balance` →
  `/articles/fix-missing-noun-e-wallet-balance`; its target is live and it does
  not create a chain.
- Corrected `Victorious` on active editorial surfaces and changed reviewer copy
  to distinguish assignment from completed source verification.
- Added `docs/README.md` as a historical-snapshot convention and current-doc
  index.
- Repaired the malformed course-coverage character without altering coverage
  counts or course data.
- Added a scored next-content backlog without creating or publishing content.

## Priorities

1. Complete current first-party source checks and substantive editorial review
   for the 49 `rewrite` pages, starting with fees, NELFUND, deadlines,
   admissions, and study-centre travel claims.
2. Recheck the ten `keep` pages and record a real review date only after the
   official sources and workflow claims are genuinely reviewed.
3. Obtain URL/query-level GSC evidence and revisit keep/rewrite/merge decisions;
   do not infer consolidation from title similarity alone.
4. Verify production canonicals, redirects, robots, sitemap, and rendered schema
   after deployment. Local code is not proof of production state.
5. Reassess AdSense only after the source-review backlog and full public-site
   quality review are complete.

## Implementation Steps

1. Wrote a failing contract test before the manifest existed.
2. Added and integrated the 59-record manifest.
3. Removed unverified date claims and corrected editorial wording.
4. Added documentation governance and the unpublished backlog.
5. Ran the targeted contract, platform suite, and TypeScript check; fresh
   command results are recorded below. A build remains a separate gate.

## Code

Key implementation files:

- `lib/editorial-dispositions.ts`
- `app/sitemap.ts`
- `app/articles/[slug]/page.tsx`
- `components/article-elements.tsx`
- `tests/platform/editorial-content.test.ts`

The manifest is intentionally conservative: all 59 pages are blocked from an
AdSense-readiness claim, all current review dates are `null`, all GSC states are
unavailable/unverified, and no page receives a merge/retire outcome without
supporting evidence.

## Verification

- `npx tsx --test tests/platform/editorial-content.test.ts` — **7 passed, 0 failed**.
- `npm run test:platform` — **149 passed, 0 failed**.
- `npx tsc --noEmit` — **exit 0, no diagnostics**.
- `git diff --check` — **exit 0**.

A production build and deployment crawl were not run in this checkpoint. They
remain separate gates and must not be inferred from the passing tests or
TypeScript check.

## Remaining Editorial Blockers

- 49 articles require a full current source review and rewrite/check.
- 10 articles with existing evidence require a current source recheck.
- No article has a Checkpoint 3 review date.
- No URL-level GSC evidence informed disposition decisions.
- No production crawl or rendered-schema validation is part of the local test
  result.
- AdSense application readiness remains blocked; this checkpoint must not be
  described as full editorial completion or AdSense-ready.

## Final Checklist

- [x] Exactly 59 original URLs inventoried and covered by the manifest.
- [x] Valid decisions and canonical-target semantics enforced.
- [x] No redirect chains; legacy article alias terminates at live content.
- [x] Sitemap omits generated static and unverified article dates.
- [x] Required metadata/source fields and internal related slugs validated.
- [x] Active author typo and stale removed-bank availability claims guarded.
- [x] Robots continues to allow public articles and disallow private/API areas.
- [x] Malformed course-material coverage text repaired.
- [x] Historical reports labelled through a documented convention/index.
- [x] Next-content work is backlog-only; no new article published.
- [ ] Current source review completed for all 59 articles.
- [ ] URL-level GSC evidence reviewed.
- [ ] Production behavior verified after deployment.
- [ ] AdSense readiness established.

## Fix Round 1 — Reader-Visible Review Language

Review identified 65 dated or verification-oriented assertions in public MDX
bodies that could be read as current even though every manifest disposition had
a pending current review. A failing regression scan was added first. The scan
covers `Last Reviewed`, `last reviewed on`, dated `reviewed on` phrases,
`sources were reviewed`, `reviewed sources`, and equivalent dated source-review
or `verified on` language whenever `reviewedAt` is null.

The affected wording across 40 articles now describes the June observations as
an **earlier editorial pass** or **previous editorial record**. Every affected
article states once that a current source recheck is pending. Source URLs,
historical observations, and frontmatter dates were preserved; no article was
marked currently verified.

The manifest review state is now a discriminated union:

- `reviewVerification: "pending"` requires `reviewedAt: null` and unverified
  date metadata.
- `reviewVerification: "verified"` requires a string `reviewedAt`, checked
  official sources, and verified publication/update metadata.

Article metadata, schema, and visible review dates consume the verified branch's
dates when that branch is eventually used. All 59 current records remain on the
pending branch.

Fresh fix-round verification:

- `npx tsx --test tests/platform/editorial-content.test.ts` — **8 passed, 0 failed**.
- `npx tsc --noEmit` — **exit 0, no diagnostics**.
- Full platform suite was intentionally not rerun in this bounded fix round;
  the earlier 149-test result remains historical evidence, not a fresh claim.

## Fix Round 2 — Semantic Freshness Claims

A second RED/GREEN scan extended the pending-review contract beyond the first
round's literal phrases. It now checks article bodies and reader-visible
frontmatter (`description`, `seoDescription`, `sourceReviewSummary`, and review
highlights) for semantic equivalents including live reviews, review/check
completion dates, verification passes, dated confirmation, `current verified`,
`as of` verification phrasing, reviewed sessions, and date-adjacent
verified/confirmed/checked/reviewed language.

Residual claims were rewritten as observations or classifications from an
earlier editorial pass. This included three newly affected TMA articles,
historical results-workflow observations, NELFUND announcement references, the
study-centre directory, and seven study-centre descriptions used in metadata and
article decks. Useful historical evidence remains, while current truth is not
implied. Each pending article with historical editorial evidence has exactly one
`A current source recheck is pending.` notice.

The scan has four narrowly documented non-editorial exceptions:

- prospective `future`/`another verification pass` instructions;
- instructions to confirm account-specific decisions on official NOUN pages;
- student task-state language about reviewing an old activity; and
- navigation language that names a safer verification route.

Fresh fix-round verification:

- `npx tsx --test tests/platform/editorial-content.test.ts` — **9 passed, 0 failed**.
- `npx tsc --noEmit` — **exit 0, no diagnostics**.
- Full platform suite was intentionally not rerun in this bounded fix round.
