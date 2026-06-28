# Phase 9 AdSense and Search Console Checklist

Last updated: 2026-06-26

## Search Console Checklist

| Item | Status | Notes |
| --- | --- | --- |
| Clean local build | Pass | Build completed with `87` generated routes |
| Robots file exists in app | Pass | Present in repo |
| Sitemap exists in app | Pass | Present in repo |
| Canonicals and metadata | Pass | Strengthened in Phase 8 |
| Structured data baseline | Pass | Articles, hubs, sitewide, and trust-page improvements in place |
| Live domain serves the correct site | **Fail** | Current domain serves GitHub Pages content instead of NounCompass |
| Live `robots.txt` available | **Fail** | Current live path returns GitHub Pages `404` |
| Live `sitemap.xml` available | **Fail** | Current live path returns GitHub Pages `404` |
| HTTPS trust valid | **Fail** | Current live checks showed certificate / principal mismatch |

### Search Console Decision

**Do not submit the current public domain yet.**

Fix the live deployment first, then verify the real production domain again.

## AdSense Checklist

| Item | Status | Notes |
| --- | --- | --- |
| Original student-help content base | Pass | Strong article base and workflow-specific content |
| Trust and legal pages | Pass | Present and linked |
| Author visibility | Pass | Author pages and editorial policy present |
| Content-first layout | Pass | No active ad-heavy layout in the repo |
| Fake download / fake ad behavior | Pass | No active fake ad slots found |
| Live domain quality presentation | **Fail** | Public domain currently shows the wrong website |
| HTTPS / certificate reliability | **Fail** | Domain currently presents a hostname trust problem |
| Reviewer confidence on course-materials surface | Warn | Keep monetization conservative there |
| Reviewer confidence on fee-checker surface | Warn | Snapshot-derived data still needs visible caution |

### AdSense Decision

**Do not apply for AdSense on the current public domain.**

The immediate blocker is not article quality. It is that the live domain is not currently serving the correct site.

## Recommended Submission Order

1. Fix live domain and HTTPS
2. Verify homepage, key articles, `robots.txt`, and `sitemap.xml`
3. Submit to Search Console
4. Confirm indexing and live stability
5. Re-evaluate AdSense timing
