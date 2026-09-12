# Search Console follow-up fixes — 2026-09-12

## Scope

This batch follows the 2026-09-12 priority SEO deployment and uses settled Google Search Console data through 2026-09-09 plus fresh URL Inspection checks on 2026-09-12.

## Evidence

- The top-25 on-page audit found 0 critical and 0 high issues. The remaining code-side opportunities are snippet/search-intent improvements rather than crawl failures.
- `can noun students apply for nelfund` is split between the application guide and the eligibility guide. The application guide ranks around position 4.5, while the eligibility guide ranks around 9.9–10.9 for the same wording.
- NOUN has publicly confirmed NELFUND disbursement to 90 students, so the eligibility page can answer the participation question directly while leaving procedural intent to the application guide.
- The NELFUND requirements and JAMB pages have overlong descriptions in the live audit (~215 and ~228 characters respectively).
- Old `www` Abuja, Ogun and dashboard URLs each make a clean single 308 hop to the non-`www` canonical. No host/canonical rewrite is required.
- Abuja and Ogun receive meaningful search impressions while their current titles are overlong (72 and 109 characters in the audit).
- The result-statement and outstanding-course pages receive meaningful impressions with titles/descriptions longer than needed for their actual queries.
- Editorial Team, Enugu and several NELFUND supporting pages still show old Google classifications because their recorded crawl dates predate the current live state.

## Implemented changes

All first-pass changes are centralized in `lib/search-intent-overrides.ts` so article source bodies and canonical/routing behavior stay untouched.

1. `is-noun-eligible-for-nelfund`
   - Owns the `can noun students apply for nelfund` query explicitly.
   - SEO title: `Can NOUN Students Apply for NELFUND? Yes`.
   - Direct answer cites NOUN's March 2026 disbursement announcement.
   - Procedural next step links to `how-noun-students-apply-for-nelfund`.
2. `nelfund-requirements-for-noun-students`
   - Concise requirements description focused on institution, matric number, JAMB verification and date of birth.
3. `why-nelfund-requests-a-jamb-registration-number`
   - Concise description that distinguishes observed JAMB verification from unverified universal regularization claims.
4. `noun-study-centres-in-abuja`
   - SEO title: `NOUN Study Centres in Abuja | Abuja Model`.
5. `noun-study-centres-in-ogun`
   - SEO title: `NOUN Study Centres in Ogun State | Centre Guide`.
6. `how-to-open-your-noun-result-statement-from-the-support-portal`
   - SEO title: `NOUN Result Statement | Support Portal Guide`.
7. `how-to-check-outstanding-courses-on-noun-result-statement`
   - SEO title: `Check Outstanding Courses in NOUN`.
   - Concise description aligned to the Support/ERP workflow.

`intentSection` is optional for metadata-only overrides. Existing intent-led overrides retain their visible answer sections.

## Continuation: schema and title hygiene

Fresh live auditing after the first follow-up deployment found one remaining genuine site-side technical issue: several nested `Organization` entities were emitted without a `logo` even though the primary root Organization and BlogPosting publisher already had one.

The continuation adds the existing 512px NOUN Compass brand icon to:

- `WebSite.publisher` in the root layout.
- `AboutPage.about` on the About page.
- `ContactPage.mainEntity` on the Contact page.
- Article authors when the editorial profile is an `Organization`.
- Article editors/review desks when the editorial profile is an `Organization`.

The same audit identified six titles with meaningful impressions and avoidable truncation risk. These are metadata-only title overrides in the article template, so article H1s, source copy, routing, canonicals, descriptions and factual content remain unchanged:

- `noun-study-centres-in-kano` → `NOUN Study Centres in Kano | Centre Guide`
- `noun-core-courses-vs-electives` → `NOUN Core Courses vs Electives | Explained`
- `noun-portal-password-reset` → `NOUN Portal Password Reset | Recover Access`
- `noun-study-centres-in-benin` → `NOUN Study Centres in Benin | Edo Guide`
- `how-to-read-noun-cgpa-class-of-degree-and-outstanding-credit` → `Check NOUN CGPA & Class of Degree`
- `noun-study-centres-in-lagos` → `NOUN Study Centres in Lagos | Centre Guide`

All six rendered title strings remain at or below 60 characters after the automatic ` | NOUN Compass` suffix is added. Borderline 61–62 character titles are deliberately left unchanged in this continuation because their wording remains useful and the length warning alone does not justify another rewrite.

## Deliberate non-changes

- No changes to `www` redirects, canonical tags, robots rules or sitemap behavior.
- No Dashboard metadata change because its current 56-character title is already healthy.
- No repeat edits to carryover, Remita, school-fees, CGPA calculator or result-checker before post-deployment Search Console data matures.
- No attempt to treat stale `Page with redirect` or duplicate-canonical classifications as live routing defects.
- Core Web Vitals remains unavailable in GSC Wizard until a Chrome UX Report API key is configured.

## Tracking

Created GSC Wizard topic cluster `NELFUND for NOUN students` (`3b15b924-a3d2-4114-b6bb-8e74743b8492`) and refreshed the relevant indexing tracker URLs on 2026-09-12.
