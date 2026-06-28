# NounCompass Performance Report

## Score

- Performance score: `84/100`

## Audit

Code and local-build audit completed for:

- Image optimization
- `next/image` usage
- Client component footprint
- Layout shift risk
- Hydration risk
- Large datasets and JSON payloads
- Course Materials Library performance
- Fee Checker performance

No live Lighthouse or PageSpeed Insights run was available in this audit, so this report focuses on code and local runtime evidence rather than measured Core Web Vitals.

## Strengths

- Only two client components were found: `components/mobile-menu.tsx` and `components/fee-checker.tsx`.
- Article and screenshot imagery use `next/image`, with stable dimensions that reduce CLS risk.
- The local crawl found no broken public assets.
- Largest image files in `public/images` remain moderate, topping out around `208 KB`.
- The fee checker fetches its catalog via API instead of embedding the entire dataset in the initial HTML.

## Findings

| Issue | Severity | Reason | Fix |
| --- | --- | --- | --- |
| No live CWV or Lighthouse data was available | Medium | Without a deployed PageSpeed/Lighthouse run, LCP, CLS, and TBT can only be inferred from code patterns. | Run mobile and desktop PageSpeed on the deployed domain before launch. |
| Large source data files back server-side features | Medium | `data/puredu-curricula.json` is about `3.06 MB`, and the course-material and fee snapshot files each exceed `0.8 MB`. These do not all ship to the browser directly, but they increase server and build-time cost. | Consider splitting datasets by feature or faculty over time. |
| Search-heavy routes are still dynamic | Medium | `/course-materials` and `/student-guides` render dynamically to support query-based filtering and pagination. That is acceptable, but less cache-friendly than a fully static path. | Keep as-is for now; revisit only if real traffic reveals server-pressure or TTFB issues. |
| Fee catalog payload is noticeable | Low | `/api/fees` returned roughly `59 KB` in the local audit. This is reasonable, but still worth watching on lower-end mobile networks. | Avoid expanding the response shape unless necessary; paginate or lazy-load only if it grows materially. |
| HTML payloads on large pages are not tiny | Low | Local HTML responses were about `60 KB` for `/`, `51 KB` for `/fees`, `91 KB` for `/course-materials`, and `90 KB` for a long article. | Acceptable for now, but avoid duplicating long repeated sections in articles because that directly bloats HTML. |

## Measured Local Signals

- Public sitemap routes verified: `52`
- Referenced public assets verified: `49`
- Homepage HTML payload: about `60 KB`
- Fees page HTML payload: about `51 KB`
- Course materials page HTML payload: about `91 KB`
- Sample article HTML payload: about `90 KB`
- Fee API payload: about `59 KB`

## Fixes Applied

- Fixed the broken article heading/anchor path so in-page navigation now works without failed fragment jumps.
- Fixed stale fragment links in the fees workflow section.
- Removed unfinished “coming soon” homepage copy that weakened user trust without adding value.

## Priorities

1. Run real mobile PageSpeed against production after deployment.
2. Clean duplicated article sections, because they affect both content quality and HTML weight.
3. Watch the long-term growth of the fee and course-material data files.

## Final Checklist

- `next/image` used for key editorial imagery
- Image dimensions present on rendered article imagery
- Client footprint is small
- No broken assets found in local crawl
- No live CWV measurements yet
