# NounCompass AdSense Readiness Review

## Audit

Manual-review style audit completed against:

- Homepage
- Article template and sample operational articles
- Course Materials Library
- School Fees Checker
- Footer and trust surfaces
- Author pages

## Strengths

- Strong trust baseline: About, Contact, Privacy Policy, Terms, Disclaimer, Editorial Policy, Corrections Policy, Copyright Policy, and Takedown Policy all exist and are linked.
- Author visibility is present on articles and supported by dedicated author pages.
- The site clearly distinguishes official NOUN channels from independent guidance.
- Public routes, sitemap, robots, canonicals, and metadata are present and working locally.
- Articles are not thin by word count; all 30 audited articles are above roughly 800 words, with many well above 2,000.

## Issues

| Issue | Severity | Reason | Fix |
| --- | --- | --- | --- |
| Repeated sections appear in multiple published articles | High | `11` articles contain duplicate `##` sections, and several core operational guides repeat large structural blocks. That weakens “original, people-first” quality signals for a manual AdSense review even when the topic is useful. | Deduplicate repeated sections in the affected MDX files before applying for AdSense. Prioritize admissions, results, fees, registration, and exam guides first. |
| Course Materials Library is still heavily download-oriented | High | The library has strong disclaimers and context, but it still centers on download and source actions. Manual reviewers can interpret download-heavy directories as lower-value or risky if the supporting editorial value is not dominant enough. | Keep the section live, but delay AdSense placement or application until more original, non-download workflow content outweighs the library’s download emphasis. |
| Fee Checker depends on third-party snapshot data | High | The tool is honest about source limitations, but the core value still depends on dated third-party captures rather than official first-party data. That can create trust friction for both AdSense and user confidence. | Keep the current disclaimers and provenance visible. For AdSense readiness, strengthen first-party explanation pages and eventually replace or supplement snapshot-derived values with directly verified official data. |
| Some content silos are still shallow | Medium | `GST`, `Results`, and `Study Centres` each have only one article; `Student Guides` has three. The site is credible overall, but silo depth is uneven. | Expand existing silos over time before prioritizing AdSense. Search Console can proceed first. |
| Live deployment trust signals were not fully verifiable from the repo | Medium | Local audit confirmed route health and metadata, but could not confirm the live deployed site’s HTTPS state, real Search Console ownership, or post-deploy console behavior. | Recheck the production domain after deployment before submitting an AdSense application. |
| Author pages are trustworthy but still brief | Low | The author and editorial pages are present, which is good, but they remain fairly short for a site that wants strong reviewer trust around educational guidance and tool-based pages. | Expand bios, editorial process detail, and update responsibility later if you want a stronger E-E-A-T style trust posture. |

## Priorities

1. Fix the duplicated article sections before any AdSense application.
2. Treat the Course Materials Library and Fees Checker as reviewer-sensitive surfaces and avoid aggressive monetization there.
3. Submit to Search Console before AdSense so Google can crawl the technical foundation while editorial cleanup continues.

## Decision

- Search Console readiness: yes, pending live deployment verification
- AdSense application readiness: not yet recommended
