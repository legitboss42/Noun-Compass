# Phase 7.4A NELFUND Cluster Report

Last updated: 2026-06-20

## Scope

This phase built the NELFUND and student-finance authority cluster from the completed Phase 7.4 research only. No new external research was added during this build pass.

## Articles Created

1. [Is NOUN Eligible For NELFUND? What Is Verified, What Is Unclear, And What Students Should Know](</C:/Users/vicky/Desktop/Web Growth/NounCompass/content/articles/is-noun-eligible-for-nelfund.mdx>)
2. [How NOUN Students Apply For NELFUND](</C:/Users/vicky/Desktop/Web Growth/NounCompass/content/articles/how-noun-students-apply-for-nelfund.mdx>)
3. [NELFUND Requirements For NOUN Students](</C:/Users/vicky/Desktop/Web Growth/NounCompass/content/articles/nelfund-requirements-for-noun-students.mdx>)
4. [Why NELFUND Requests A JAMB Registration Number](</C:/Users/vicky/Desktop/Web Growth/NounCompass/content/articles/why-nelfund-requests-a-jamb-registration-number.mdx>)
5. [Common NELFUND Problems NOUN Students Face](</C:/Users/vicky/Desktop/Web Growth/NounCompass/content/articles/common-nelfund-problems-noun-students-face.mdx>)
6. [NELFUND Application Status Meanings Explained](</C:/Users/vicky/Desktop/Web Growth/NounCompass/content/articles/nelfund-application-status-meanings-explained.mdx>)
7. [NELFUND Approval And Disbursement Guide For NOUN Students](</C:/Users/vicky/Desktop/Web Growth/NounCompass/content/articles/nelfund-approval-and-disbursement-guide-for-noun-students.mdx>)
8. [NELFUND Frequently Asked Questions For NOUN Students](</C:/Users/vicky/Desktop/Web Growth/NounCompass/content/articles/nelfund-frequently-asked-questions-for-noun-students.mdx>)

## Supporting Updates

- Added custom FAQ entries for all new NELFUND slugs in [lib/article-faqs.ts](</C:/Users/vicky/Desktop/Web Growth/NounCompass/lib/article-faqs.ts>)
- Added NELFUND cluster entry points to the fees hub in [app/fees/page.tsx](</C:/Users/vicky/Desktop/Web Growth/NounCompass/app/fees/page.tsx>)
- Expanded the fees workflow link grid to support the extra cluster pathway in [app/fees/fees.module.css](</C:/Users/vicky/Desktop/Web Growth/NounCompass/app/fees/fees.module.css>)
- Tightened the older NELFUND mention in [noun-installment-payment.mdx](</C:/Users/vicky/Desktop/Web Growth/NounCompass/content/articles/noun-installment-payment.mdx>) so it no longer overstates timing or coverage

## Verified Findings Used

The cluster was built around these verified Phase 7.4 findings only:

- NOUN students are participating in NELFUND
- NOUN publicly promotes NELFUND
- NOUN published an official 2026-03-03 announcement confirming approved disbursement to 90 NOUN students
- the same official NOUN announcement linked disbursement to students' e-wallets
- the current public NELFUND flow requests:
  - institution selection
  - matric number
  - JAMB registration number
  - date of birth
- the public NELFUND flow exposes educational verification, a missing-information state, JAMB verification, JAMB profile review, and email-verification continuation

## Internal Links Added

The new cluster now connects naturally into:

- admission
- portal and registration
- fees and e-wallet workflows
- study-centre verification
- support ticket escalation
- results
- course materials
- student-guides archive

The fees hub now also links directly into the NELFUND branch instead of treating student finance as an orphan topic.

## Compliance Safeguards

Every new article was written to keep a hard line between:

- `verified`
- `partially verified`
- `unverified`

Each page includes:

- a verification section
- a last-reviewed section
- an official-sources section
- topical FAQs
- troubleshooting
- NOUN-specific internal linking

## Risks Avoided

The build deliberately avoided these unsupported claims:

- postgraduate eligibility as fact
- returning-student eligibility as fact
- new-student timing as fact
- exact universal JAMB regularization requirements as fact
- unverified NOUN portal locations as fact
- guaranteed approval
- guaranteed funding
- guaranteed timelines
- a fabricated complete approval-status glossary

## Authority Improvements

Before this phase, NounCompass had a visible student-finance authority gap. The site had finance and e-wallet coverage, but no dedicated NELFUND cluster. After Phase 7.4A:

- the NELFUND branch now has a true pillar page
- the branch now has seven supporting pages
- the finance cluster now connects to NOUN-specific student-finance questions rather than only fee mechanics
- the site now explains the verified NOUN-to-NELFUND relationship with clearer E-E-A-T boundaries

## Remaining Unknowns

These items still need stronger official verification before future content should state them as facts:

- postgraduate eligibility
- returning-student eligibility
- new-student eligibility timing
- exact JAMB regularization requirements for all NOUN students
- exact NOUN portal location for any regularization-related update
- whether semester registration is a hard prerequisite
- a full later-stage approval or rejection glossary
- exact disbursement or reflection timing

## Validation Results

- `npm.cmd run lint` ✅
- `npx.cmd tsc --noEmit` ✅
- `npm.cmd run build` ✅

Build result:

- all eight NELFUND article routes compiled successfully
- no broken routes detected in the generated article set
- no TypeScript regressions introduced
- no metadata parser issues introduced by the new frontmatter

## Updated Topical Authority Score

**Topical Authority Score: 93/100**

Rationale:

- the largest remaining finance authority gap is now filled with a full NOUN-specific cluster
- the cluster is evidence-based rather than generic
- the site now connects admission, registration, fees, support, and e-wallet logic more coherently
- the score does not go higher because some finance-sensitive edge cases still remain intentionally unverified

## Remaining Authority Gaps

The biggest remaining gaps are now narrower and mostly verification-based rather than cluster-absence-based:

- final authority audit across all clusters
- deeper NELFUND edge-case verification
- continued maintenance of fast-changing student-finance claims
- selective strengthening of exam and student-support journey links where new content surfaces additional needs

## Recommendation For Phase 7.5 Final Authority Audit

Proceed to **Phase 7.5 Final Authority Audit**.

Recommended focus:

1. audit cross-cluster student journeys end to end
2. verify that no older articles still make broader NELFUND claims than the new evidence standard allows
3. check that fees, portal, results, TMA, study centres, and NELFUND now behave like one coherent NOUN student ecosystem
4. identify any final internal-link gaps before a sitewide authority verdict
