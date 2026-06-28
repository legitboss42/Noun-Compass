# Phase 7.6 Remediation Report

Last updated: 2026-06-20

## Executive Summary

Phase 7.6 focused on strengthening the existing authority system rather than expanding it. The remediation work closed the orphan-page problem, removed the highest-risk unsupported finance wording, improved source specificity on several older portal and finance pages, and strengthened Support and Course Materials as integrated workflow branches.

## Issues Fixed

### Critical finance remediation

- Rebuilt `noun-installment-payment` around a verified / unverified boundary instead of informal payment-plan assumptions.
- Rebuilt `noun-postgraduate-school-fees` to remove unsupported refund, discount, installment, and sponsorship claims.
- Rebuilt `noun-e-wallet-refund` to remove fixed refund promises and use a verification-first refund workflow.
- Tightened refund or finance wording in:
  - `how-to-generate-remita-for-noun`
  - `how-to-fix-missing-noun-e-wallet-balance`
  - `noun-financial-statement`
  - `noun-late-registration-fee`

### Orphan-page remediation

The orphan count was reduced to zero by adding contextual inbound links and better workflow routing for:

- `gst302-summary`
- `nelfund-frequently-asked-questions-for-noun-students`
- `noun-core-courses-vs-electives`
- `noun-course-materials-pdf`
- `noun-e-exam-vs-pop`
- `noun-installment-payment`
- `noun-missing-course-code`
- `noun-postgraduate-school-fees`
- `noun-graduation-clearance-fee-convocation-costs`

### Source-specificity upgrades

The following pages were moved away from broad homepage-level source usage where a more precise portal source was appropriate:

- `how-to-pay-noun-school-fees`
- `noun-school-fees-new-students`
- `noun-school-fees-returning-students`
- `noun-postgraduate-school-fees`
- `noun-installment-payment`
- `how-to-register-noun-courses`
- `noun-exam-registration-guide`
- `noun-registration-slip-printout`
- `noun-maximum-credit-units`
- `noun-missing-course-code`
- `noun-e-exam-vs-pop`
- `noun-support-ticket-guide`
- `how-to-generate-remita-for-noun`
- `noun-financial-statement`
- `noun-course-materials-pdf`
- `gst302-summary`

### Verification-language improvements

Older pages were aligned more closely with the newer trust standard by:

- replacing unsupported certainty with explicit caution
- strengthening verification-first phrasing
- clarifying when a workflow is only partially documented
- linking students forward into safer pillar pages instead of letting weaker pages overreach

## Support Cluster Improvements

Support moved from a mostly terminal destination into a more useful branch-specific escalation layer.

Implemented improvements:

- added finance-specific routing from support into fees, installment, and NELFUND pages
- added portal-specific routing into `noun-missing-course-code`
- added course-material issue routing into `noun-course-materials-pdf` and `gst302-summary`
- improved article-level trust by pointing the support guide to the official support login surface

## Course Materials Improvements

Course Materials no longer sits as a thin side branch.

Implemented improvements:

- linked `gst302-summary` and `noun-course-materials-pdf` bidirectionally
- tightened hardcopy wording in `noun-course-materials-pdf` to avoid unsupported return or delivery claims
- upgraded the course-materials hub to connect into results, support, and the dedicated materials workflow article
- strengthened article-level trust with the official NOUN eCourseware source

## Validation Checks Before Technical Validation

- Contextual orphan audit: resolved
- High-risk unsupported finance wording: resolved in remediated pages
- Broken-link audit from remediation targets: no unresolved internal-link issue found during the content pass

## Updated Cluster Scores

| Cluster | Phase 7.5 Score | Phase 7.6 Score | Reason |
| --- | ---: | ---: | --- |
| Admissions | 82 | 82 | No major remediation was required here |
| Registration | 88 | 91 | Better routing into course-code, core/elective, and slip workflows |
| Fees | 84 | 90 | Highest-risk finance claims removed and fee guidance made more evidence-based |
| Portal | 78 | 84 | Older portal pages gained clearer sources and better workflow integration |
| Course Materials | 62 | 76 | No longer orphaned from the main student journey and now uses stronger trust framing |
| TMA/eLearn | 86 | 86 | Strong cluster already; no major remediation needed |
| Results | 85 | 87 | Better integration into final-year and downstream workflows |
| Support | 72 | 82 | Stronger branch-specific escalation logic and trust signals |
| Study Centres | 83 | 83 | No direct remediation required in this phase |
| NELFUND | 90 | 91 | Better FAQ integration and safer cluster routing |

## Updated Authority Score

**94/100**

## Remaining Issues

The remediation phase removed the critical and high-priority issues from the Phase 7.5 report, but a few lower-level items still remain:

- some older articles still rely on broad official-source language where no more precise verified source was available
- style consistency across the full archive is improved but not perfectly uniform
- a few older explainers outside the remediated set could still be tightened further later if needed

None of these remaining items is a structural blocker for Phase 8.

## Go / No-Go For Phase 8

**Go**

Reason:

- the orphan-page issue is resolved
- the strongest finance-trust risks were corrected
- Support and Course Materials are materially better integrated
- the remaining issues are refinements, not authority blockers
