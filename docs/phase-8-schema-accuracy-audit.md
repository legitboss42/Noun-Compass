# Phase 8 Schema Accuracy Audit

Last updated: 2026-06-26

## Findings

| Page | Schema Issue | Severity | Reason | Fix |
| --- | --- | --- | --- | --- |
| Article template before Phase 8 | `HowTo` schema overuse | Critical | The template inferred HowTo steps from generic numbered lists and broad guide content, which was too aggressive and not ideal for current Google support | Fixed: removed `HowTo` schema generation |
| Article template before Phase 8 | Empty `FAQPage` risk | High | `FAQPage` JSON-LD could render even when no FAQ content was meaningfully present | Fixed: FAQ schema now renders only when FAQs exist |
| Article template before Phase 8 | Author type too generic | Medium | Every article author was marked as `Organization`, even when the visible author was a person | Fixed: Victor-authored pages now emit `Person` |
| Article template before Phase 8 | Breadcrumb name used raw category slug | Low | `student-guides` and similar slugs were not ideal breadcrumb names in JSON-LD | Fixed: breadcrumb labels now use category names |
| Category hubs before Phase 8 | No hub-level schema | Medium | Search engines had metadata but no structured page-type clarity for hub/list pages | Fixed: `CollectionPage` + `BreadcrumbList` added |
| Course materials hub before Phase 8 | No library-level schema | Medium | The page clearly behaves like a library/listing surface | Fixed: `CollectionPage` + `BreadcrumbList` added |
| Author pages before Phase 8 | No author/profile schema | Medium | Visible author/editor identity existed without supporting profile markup | Fixed: `ProfilePage` schema added |
| Fees checker | `WebApplication` schema present | Low | Schema matches visible tool behavior and should remain | No change |
| Trust / policy pages | Limited schema specificity | Low | These pages are understandable without extra schema, but they do not expose richer page types | Acceptable to document rather than expand now |

## Accuracy Verdict

- No fake review, rating, or aggregate schema found.
- No unsupported ecommerce-style rich-result schema found.
- The highest-risk structured-data problem was template-level `HowTo` overuse, and it was removed.
- Remaining schema gaps are mostly coverage opportunities, not accuracy failures.
