# Final Authority Linking Audit

Last updated: 2026-06-20

## Linking Summary

There are no broken article routes in the current build. The linking issue is not route failure. It is journey quality.

The strongest clusters now link well inside themselves:

- Registration & Portal
- Fees & E-Wallet
- Results
- TMA/eLearn
- Study Centres
- NELFUND

The weaker issue is that some older pages still do not receive strong contextual links from related articles.

## Orphan Pages

The following pages have no meaningful incoming contextual links from other site content:

- `gst302-summary`
- `nelfund-frequently-asked-questions-for-noun-students`
- `noun-core-courses-vs-electives`
- `noun-course-materials-pdf`
- `noun-e-exam-vs-pop`
- `noun-installment-payment`
- `noun-missing-course-code`
- `noun-postgraduate-school-fees`

These pages are still reachable through category pages or search, but they are weakly integrated into the authority ecosystem.

## Weakly Supported Pages

These pages are not fully orphaned, but they still have thin incoming support relative to their role:

- `noun-registration-slip-printout`
- `noun-school-fees-returning-students`
- `how-to-check-outstanding-courses-on-noun-result-statement`
- `why-noun-course-registration-slip-says-register-for-the-current-semester-first`

## Student Journey Audit

| Journey | Status | Main Finding |
| --- | --- | --- |
| Admission → Registration | Strong | Well supported by application and registration pillar pages |
| Registration → Study Centre | Moderate | Present, but not consistently surfaced from core registration pages |
| Study Centre → TMA/eLearn | Moderate | Some location pages link forward, but the journey is not universal across the cluster |
| TMA/eLearn → Exams | Strong | Generally present through related guides and workflow references |
| Exams → Results | Strong | Well connected through results and registration context |
| Results → Support | Strong | One of the clearest sitewide journeys |
| Support → NELFUND | Weak | Support guide is widely linked, but finance-support crossover is still light |
| Fees → NELFUND | Strong | Much stronger after Phase 7.4A, especially through the fees hub and cluster pages |
| Course Materials → Results / Registration | Weak | Course-material pages are not well integrated into the main student task spine |

## Broken Journeys

No broken route-level journeys were found in build validation. The `broken` issue is contextual:

- Course Materials does not feed the main student journey strongly enough
- Support exists as a destination but not always as a branch-specific escalation path
- Some fee and portal explainers do not link forward into the newer NELFUND or results clusters

## Weak Cluster Connections

The weakest current cross-cluster connections are:

- Course Materials ↔ Registration
- Course Materials ↔ Results
- Support ↔ NELFUND
- Examinations ↔ the orphaned `noun-e-exam-vs-pop`
- Portal ↔ orphaned issue pages such as `noun-missing-course-code`

## Linking Verdict

The site now has a strong authority backbone, but it still has a thin outer ring of contextual-link problems. That is good enough for Phase 8, but not ideal for a final launch-quality authority verdict.
