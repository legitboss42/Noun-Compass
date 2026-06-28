# NOUN Compass Article Production Tracker

Last updated: 2026-06-18

Scope: Articles 1-19, the recently added operational student-help guides.

## Final Status Table

| Article | Content Complete | AI Images Complete | Screenshots Complete | Internal Links Complete | Schema Complete | QA Passed |
|---|---:|---:|---:|---:|---:|---:|
| How to Fix Missing NOUN E-Wallet Balance | Complete | Complete | Complete | Complete | Complete | Passed |
| How to Generate Remita for NOUN Payments | Complete | Complete | Complete | Complete | Complete | Passed |
| Understanding the NOUN Compulsory Fee | Complete | Complete | Complete | Complete | Complete | Passed |
| Core Courses vs Electives at NOUN | Complete | Complete | Complete | Complete | Complete | Passed |
| NOUN Course Materials PDF vs Hardcopy | Complete | Complete | Complete | Complete | Complete | Passed |
| NOUN E-Exam vs POP Exam | Complete | Complete | Complete | Complete | Complete | Passed |
| NOUN E-Wallet Refund Guide | Complete | Complete | Complete | Complete | Complete | Passed |
| NOUN Financial Statement Guide | Complete | Complete | Complete | Complete | Complete | Passed |
| NOUN Graduation and Convocation Costs | Complete | Complete | Complete | Complete | Complete | Passed |
| NOUN Installment Payment Guide | Complete | Complete | Complete | Complete | Complete | Passed |
| NOUN Late Registration Guide | Complete | Complete | Complete | Complete | Complete | Passed |
| NOUN Maximum Credit Units | Complete | Complete | Complete | Complete | Complete | Passed |
| NOUN Missing Course Code Error | Complete | Complete | Complete | Complete | Complete | Passed |
| NOUN Portal Password Reset | Complete | Complete | Complete | Complete | Complete | Passed |
| NOUN Postgraduate School Fees | Complete | Complete | Complete | Complete | Complete | Passed |
| NOUN Registration Slip Printout | Complete | Complete | Complete | Complete | Complete | Passed |
| NOUN Student Dashboard Guide | Complete | Complete | Complete | Complete | Complete | Passed |
| Register Carryover Courses on NOUN Portal | Complete | Complete | Complete | Complete | Complete | Passed |
| Update Profile on NOUN Portal | Complete | Complete | Complete | Complete | Complete | Passed |

## Phase 1: Content Audit + AI Images

| Article | Content Complete | AI Images Complete | Screenshots Complete | Internal Links Complete | Schema Complete | QA Passed |
|---|---:|---:|---:|---:|---:|---:|
| Articles 1-19 | Complete | Complete | Deferred to Phase 2 | Complete | Complete | Passed |

Results:

- AI image placeholders found: 0
- Featured WebP images generated: 19
- Featured image path verification: passed for all 19
- Body H1 cleanup: complete
- Publication checklist cleanup: complete
- Old portal-domain references removed from the 19
- Hard naira claims removed from the 19 where they could imply unverifiable official 2026 figures
- Internal links: at least 5 contextual links per article

## Phase 2: Screenshot Acquisition

| Article | Content Complete | AI Images Complete | Screenshots Complete | Internal Links Complete | Schema Complete | QA Passed |
|---|---:|---:|---:|---:|---:|---:|
| Articles 1-19 | Complete | Complete | Complete | Complete | Complete | Passed |

Results:

- Existing real portal screenshots reused where available.
- Sensitive student information remains excluded from article visuals.
- Screenshot components now render through `next/image`.
- Every article has at least one visual workflow reference.

## Phase 3: Screenshot Gap Resolution

| Article | Content Complete | AI Images Complete | Screenshots Complete | Internal Links Complete | Schema Complete | QA Passed |
|---|---:|---:|---:|---:|---:|---:|
| Articles 1-19 | Complete | Complete | Complete | Complete | Complete | Passed |

Results:

- Private or unavailable workflow screenshots were replaced with educational reconstruction SVGs.
- Reconstruction visuals are not presented as live student records.
- Source log created at `docs/screenshot-source-log.md`.
- Real screenshots remain preferred and are documented separately from reconstructions.

## Phase 4: Final QA and Publishing Audit

| Article | Content Complete | AI Images Complete | Screenshots Complete | Internal Links Complete | Schema Complete | QA Passed |
|---|---:|---:|---:|---:|---:|---:|
| Articles 1-19 | Complete | Complete | Complete | Complete | Complete | Passed |

Checks completed:

- No `[AI IMAGE PLACEHOLDER]` markers remain.
- No `[SCREENSHOT REQUIRED]` markers remain.
- No body-level duplicate H1 remains in the 19 updated articles.
- No author-facing publication checklist text remains in the 19 updated articles.
- No stale `nouonline.noun.edu.ng` portal references remain in the 19 updated articles.
- No hard naira fee assertions remain in the 19 updated articles.
- Article schema, BreadcrumbList schema, FAQPage schema, and conditional HowTo schema are supported by the article template.
- `npm run lint` passed.
- `npm run build` passed.
