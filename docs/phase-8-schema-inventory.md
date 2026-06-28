# Phase 8 Schema Inventory

Last updated: 2026-06-26

## Current Schema Coverage

| Page Type | Schema Present | Validity Risk | Notes |
| --- | --- | --- | --- |
| Sitewide layout | `Organization`, `WebSite` | Low | `WebSite` added in Phase 8 |
| Homepage | Sitewide only | Medium | No dedicated homepage `WebPage` or `ItemList` schema |
| Article pages | `Article`, `BreadcrumbList`, conditional `FAQPage` | Low to Medium | `HowTo` removed in Phase 8 because it was overbroad |
| Category hubs | `CollectionPage`, `BreadcrumbList` | Low | Added in Phase 8 for non-query states |
| Course materials hub | `CollectionPage`, `BreadcrumbList` | Low | Added in Phase 8 |
| Fees checker page | `WebApplication` | Low | Already justified by visible tool behavior |
| Author page: Victor | `ProfilePage` + `Person` | Low | Added in Phase 8 |
| Author page: Editorial Team | `ProfilePage` + `Organization` | Low | Added in Phase 8 |
| Trust / policy pages | None beyond sitewide layout | Low to Medium | Acceptable, but limited page-type specificity |

## Inventory Notes

- Article schema is the deepest structured-data surface on the site.
- FAQ schema now renders only when at least one FAQ exists.
- Search and filter states do not receive additional structured-data treatment.
- No speculative ratings, reviews, or unsupported aggregate data are present.
