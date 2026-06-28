# Phase 8 Canonical and Indexation Audit

Last updated: 2026-06-26

## Summary

Base-route canonical coverage is strong. The main pre-fix risk was parameterized search and filter states under `student-guides` and `course-materials`, which were still indexable despite behaving like discovery/filter views. That issue was remediated in Phase 8.

## Findings

| Page | Canonical Status | Indexation Status | Issue | Fix |
| --- | --- | --- | --- | --- |
| Base static routes | Good | Indexable | Self-canonical via shared metadata helper | None |
| Article routes | Good | Indexable | Self-canonical via article `generateMetadata()` | None |
| `/student-guides` base route | Good | Indexable | Base guide archive should index | None |
| `/student-guides?q=*` | Fixed | Noindex, follow | Search-result state should not be treated like a standalone index target | Fixed in Phase 8 |
| `/course-materials` base route | Good | Indexable | Main library route should index | None |
| `/course-materials?q=*` | Fixed | Noindex, follow | Filter/search state created index-bloat risk | Fixed in Phase 8 |
| `/course-materials?faculty=*` | Fixed | Noindex, follow | Filter state created index-bloat risk | Fixed in Phase 8 |
| `/course-materials?page=*` | Fixed | Noindex, follow | Pagination/search combinations should not compete with the hub | Fixed in Phase 8 |
| Sitemap static routes | Fixed | Indexable | Static last-modified values were stale | Updated in Phase 8 |

## Canonical Verdict

- No self-conflicting canonical pattern found in the audited templates.
- No accidental canonical overlap was found among base routes.
- The main canonical/indexation risk was parameter-driven indexation, and it was corrected.
