# Phase 7.2A Results Cluster Report

Last updated: 2026-06-19

## Executive Summary

This phase turned the previously thin Results & Academic Records area into a real workflow cluster built from verified portal research. The old results coverage relied heavily on one generic article. The new cluster now reflects the actual path observed during research:

`Student Portal` -> `My progress` -> `Support` / `eTicketing` -> `Support portal` -> `Result statement` -> `ERP statement of result`

The content deliberately avoids unverified transcript, carryover, and result-correction claims.

## Articles Created

### Updated pillar

- `content/articles/how-to-check-noun-results.mdx`

### New supporting articles

- `content/articles/how-to-open-your-noun-result-statement-from-the-support-portal.mdx`
- `content/articles/how-to-find-noun-results-on-my-progress.mdx`
- `content/articles/why-your-noun-result-grade-is-not-showing.mdx`
- `content/articles/how-to-read-noun-cgpa-class-of-degree-and-outstanding-credit.mdx`
- `content/articles/how-to-check-outstanding-courses-on-noun-result-statement.mdx`
- `content/articles/why-noun-course-registration-slip-says-register-for-the-current-semester-first.mdx`
- `content/articles/how-to-use-noun-support-or-e-ticketing-for-result-problems.mdx`

## Screenshots Used

The cluster uses only verified privacy-safe results screenshots:

- `results-full-grade-table-safe.png`
- `results-summary-stats-safe.png`
- `results-performance-standing-safe.png`
- `results-outstanding-courses-safe.png`
- `results-registration-slip-blocked-safe.png`

## Internal Links Added

The new cluster now connects results content directly to:

- the results pillar itself
- `My progress` navigation help
- Support portal result-statement help
- grade-not-showing troubleshooting
- CGPA / class-of-degree interpretation
- outstanding-courses interpretation
- registration-slip blocker help
- Support / e-Ticketing workflow help
- course registration
- exam registration
- TMA / eLearn cluster
- broader support-ticket guidance

This creates a clearer student journey:

`TMA` -> `Exams` -> `Results` -> `CGPA` -> `Outstanding Courses` -> `Support`

## Verified Workflows Used

The new articles were limited to these verified observations:

- `My progress` is the visible in-portal results entry point
- historical periods such as `2024_1` and `2024_2` are shown inline
- the result table includes a `Grade` column
- the visible rows on the observed account showed dashes
- the `My progress` page instructs students to use `Support` and `eTicketing`
- the Support portal login route is `https://support.nou.edu.ng/login/`
- the Support dashboard includes `Result statement`
- `Result statement` opens the ERP page at `https://erp.nou.edu.ng/stsor`
- the ERP page displays the full grade table
- the ERP page displays summary statistics
- the ERP page displays `CGPA`
- the ERP page displays `Current class of degree`
- the ERP page displays `Outstanding credit`
- the ERP page displays `Outstanding Courses`
- the ERP page includes `Export as PDF` and `Print`
- the registration-slip route can be blocked by the `register for the current semester first` message

## Authority Improvements

Before this phase:

- Results authority depended mainly on one article
- Results & Academic Records was scored `5/10` in the topical authority audit
- Site-wide topical authority score was `62/100`

After this phase:

- the results cluster now has one pillar plus seven supporting pages
- the cluster now covers navigation, deeper statement access, missing-grade troubleshooting, academic summary interpretation, outstanding-course checks, registration-proof blockers, and support escalation
- the results area now feels research-backed instead of generic
- the site gives Google a clearer NOUN-specific academic-records ecosystem

### Updated score

- `Updated Topical Authority Score: 74/100`

Why this moved:

- Results & Academic Records is no longer a single-page cluster
- the internal ecosystem from exams and TMA into results is much stronger
- the content now demonstrates direct NOUN portal familiarity and Support-portal familiarity

Why the score is not higher yet:

- transcript workflow is still unverified
- explicit carryover workflow is still unverified
- result-correction workflow is still unverified
- NELFUND remains a missing authority branch
- national study-centre depth is still missing

## Remaining Unverified Areas

These were intentionally excluded from the cluster because they were not verified in the live research session:

- transcript content
- carryover workflow content
- result-correction workflow content
- complaint-resolution outcomes after ticket submission

## Validation Results

Commands run:

- `npm.cmd run lint`
- `npx.cmd tsc --noEmit`
- `npm.cmd run build`

Results:

- `lint`: passed
- `tsc --noEmit`: passed
- `build`: passed

Build note:

- the first sandboxed build failed because `next/font` could not fetch Google Geist fonts under restricted network conditions
- the rerun outside the sandbox completed successfully

## Files Changed

- `components/article-elements.tsx`
- `content/articles/how-to-check-noun-results.mdx`
- `content/articles/how-to-open-your-noun-result-statement-from-the-support-portal.mdx`
- `content/articles/how-to-find-noun-results-on-my-progress.mdx`
- `content/articles/why-your-noun-result-grade-is-not-showing.mdx`
- `content/articles/how-to-read-noun-cgpa-class-of-degree-and-outstanding-credit.mdx`
- `content/articles/how-to-check-outstanding-courses-on-noun-result-statement.mdx`
- `content/articles/why-noun-course-registration-slip-says-register-for-the-current-semester-first.mdx`
- `content/articles/how-to-use-noun-support-or-e-ticketing-for-result-problems.mdx`
- `docs/phase-7-2-results-cluster-report.md`

## Recommended Next Authority Cluster

The next best cluster to build is:

- `NELFUND & student finance`

Reason:

- it is still completely missing from the authority map
- it has strong student value
- it fits directly beside fees, payment, and support content
- it would raise the site-wide authority score faster than polishing already-stronger clusters
