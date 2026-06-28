# Phase 8 Metadata Inventory

Last updated: 2026-06-26

## Summary

- Indexable route groups audited: homepage, 8 category/library/tool hubs, 2 author pages, 7 trust/policy pages, 59 article pages
- Metadata system pattern:
  - shared `createMetadata()` helper for static pages
  - shared `generateMetadata()` template for article pages
  - App Router layout title template adds `| NOUN Compass`
- Canonical pattern:
  - static pages: self-canonical
  - article pages: self-canonical
  - parameterized student-guide and course-material states: canonical to the base route and now `noindex,follow`

## Core Routes

| Route | Type | Title | Description | Canonical | Indexable | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | Homepage | `NOUN Student Guides for Admission, Fees, Portal, and Results \| NOUN Compass` | Independent NOUN student guides for admission, school fees, portal tasks, results, study centres, GST courses, and student support. | `https://nouncompass.me/` | Yes | Homepage title strengthened in Phase 8 |
| `/admission` | Category hub | `NOUN Admission Guides \| NOUN Compass` | Understand eligibility, application steps, documents, and what to do after receiving an admission offer. | `https://nouncompass.me/admission` | Yes | Category metadata improved in Phase 8 |
| `/fees` | Tool hub | `NOUN School Fees Checker and Course Catalog \| NOUN Compass` | Check captured Puredu fee breakdowns by NOUN faculty, programme, level, and semester. | `https://nouncompass.me/fees` | Yes | Includes dedicated tool schema |
| `/portal` | Category hub | `NOUN Portal and Registration Guides \| NOUN Compass` | Practical help for the student portal, course registration, support tickets, and common account issues. | `https://nouncompass.me/portal` | Yes | Category metadata improved in Phase 8 |
| `/results` | Category hub | `NOUN Results Guides \| NOUN Compass` | Learn how to check results, understand grades, and take the right next step when something looks wrong. | `https://nouncompass.me/results` | Yes | Category metadata improved in Phase 8 |
| `/examinations` | Category hub | `NOUN Examination Guides \| NOUN Compass` | Student-first guidance for exam registration, timetables, venues, rules, and effective preparation. | `https://nouncompass.me/examinations` | Yes | Category metadata improved in Phase 8 |
| `/study-centres` | Category hub | `NOUN Study Centre Guides \| NOUN Compass` | Location guides and practical tips for contacting and using NOUN study centres across Nigeria. | `https://nouncompass.me/study-centres` | Yes | Category metadata improved in Phase 8 |
| `/gst` | Category hub | `NOUN GST Course Guides \| NOUN Compass` | Original study summaries and learning guides for General Studies courses, without past-question repositories. | `https://nouncompass.me/gst` | Yes | Category metadata improved in Phase 8 |
| `/student-guides` | Category hub | `NOUN Student Guides \| NOUN Compass` | Plain-language workflows for new and returning students, from onboarding to graduation planning. | `https://nouncompass.me/student-guides` | Yes | Query states now `noindex,follow` |
| `/course-materials` | Library hub | `NOUN Course Materials Library \| NOUN Compass` | Find NOUN course codes, course information, study guides, and verified links to official NOUN eCourseware pages. | `https://nouncompass.me/course-materials` | Yes | Filter and pagination states now `noindex,follow` |
| `/tools` | Tool hub | `NOUN Student Tools \| NOUN Compass` | Simple planning tools for NOUN fees, CGPA, and deadlines. | `https://nouncompass.me/tools` | Yes | Generic title improved in Phase 8 |
| `/about` | Trust page | `About \| NOUN Compass` | Learn why NOUN Compass exists and how we help NOUN students. | `https://nouncompass.me/about` | Yes | Self-canonical |
| `/contact` | Trust page | `Contact \| NOUN Compass` | Contact NOUN Compass with corrections, questions, or partnership enquiries. | `https://nouncompass.me/contact` | Yes | Self-canonical |
| `/authors/editorial-team` | Author page | `NOUN Compass Editorial Team \| NOUN Compass` | Learn how the NOUN Compass research and review team checks student guides. | `https://nouncompass.me/authors/editorial-team` | Yes | Profile schema added in Phase 8 |
| `/authors/victor` | Author page | `Victor Chinukwue \| NOUN Compass` | Founder and editor of NOUN Compass. | `https://nouncompass.me/authors/victor` | Yes | Person/Profile schema added in Phase 8 |
| `/privacy-policy` | Policy page | `Privacy Policy \| NOUN Compass` | How NOUN Compass handles visitor information. | `https://nouncompass.me/privacy-policy` | Yes | Self-canonical |
| `/terms` | Policy page | `Terms of Use \| NOUN Compass` | Terms governing use of NOUN Compass. | `https://nouncompass.me/terms` | Yes | Self-canonical |
| `/disclaimer` | Policy page | `Disclaimer \| NOUN Compass` | Important independence and accuracy disclaimer for NOUN Compass. | `https://nouncompass.me/disclaimer` | Yes | Self-canonical |
| `/editorial-policy` | Trust page | `Editorial Policy \| NOUN Compass` | How NOUN Compass researches, writes, and reviews student guides. | `https://nouncompass.me/editorial-policy` | Yes | Self-canonical |
| `/corrections-policy` | Policy page | `Corrections Policy \| NOUN Compass` | How to report and how we handle corrections at NOUN Compass. | `https://nouncompass.me/corrections-policy` | Yes | Self-canonical |
| `/copyright-policy` | Policy page | `Copyright Policy \| NOUN Compass` | How NOUN Compass handles original content, third-party academic materials, and copyright concerns. | `https://nouncompass.me/copyright-policy` | Yes | Self-canonical |
| `/takedown-policy` | Policy page | `Takedown Policy \| NOUN Compass` | How to report copyrighted, outdated, inaccurate, broken, or wrongly listed materials to NOUN Compass. | `https://nouncompass.me/takedown-policy` | Yes | Self-canonical |

## Article Metadata Pattern

All 59 published articles use the same metadata template:

- title: article frontmatter `title`
- description: article frontmatter `description`
- canonical: `https://nouncompass.me/articles/{slug}`
- Open Graph type: `article`
- Open Graph image: article featured image
- Twitter card: `summary_large_image`
- indexability: yes

### Article Coverage Notes

| Route Group | Coverage | Notes |
| --- | --- | --- |
| `/articles/*` | Complete | No duplicate article titles detected |
| `/articles/*` descriptions | Complete | No duplicate article descriptions detected |
| `/articles/*` title length | Mixed | Multiple cluster pages and authority-pillars are still too long for ideal SERP presentation |
| `/articles/*` description length | Mixed | Many newer research-based pages exceed typical meta-description length |

### Longest Article Titles Still Present

| Article | Title Length | Notes |
| --- | ---: | --- |
| `noun-elearn-and-tma-guide` | 124 | Strong H1, weak as a compact SERP title |
| `noun-study-centres-in-lagos` | 114 | Good editorial precision, too long for clean display |
| `noun-study-centres-in-kano` | 113 | Same issue |
| `how-to-check-noun-results` | 112 | High-value authority page; title is accurate but overlong |
| `is-noun-eligible-for-nelfund` | 109 | Strong trust wording, overlong for SERP |

### Longest Article Descriptions Still Present

| Article | Description Length | Notes |
| --- | ---: | --- |
| `nelfund-application-status-meanings-explained` | 252 | Accurate but substantially over target |
| `nelfund-frequently-asked-questions-for-noun-students` | 236 | Same |
| `common-nelfund-problems-noun-students-face` | 231 | Same |
| `why-nelfund-requests-a-jamb-registration-number` | 228 | Same |
| `how-to-check-noun-results` | 216 | Strong but long |

## Flagged Inventory Findings

- No missing title tags found in indexable page templates.
- No missing meta descriptions found in audited indexable page templates.
- No duplicate canonical pattern found in indexable base routes.
- No duplicate article titles or duplicate article descriptions found.
- Parameterized search/filter states were a prior indexation risk and were remediated in Phase 8 with `noindex,follow`.
- The main remaining metadata quality issue is not absence. It is overlength on many long-form authority articles.
