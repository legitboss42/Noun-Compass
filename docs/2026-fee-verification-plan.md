# 2026 Fee Verification Plan

## Finding

NOUN does not currently publish a public official 2026 fee schedule or public
fee API. The official portal instructions state that a fee breakdown appears
after a registered student signs in and begins semester registration or uses
the Make Payment workflow.

Third-party fee checkers can help identify possible rates, but they explicitly
state that the final official amount is the amount displayed by the NOUN
student portal. Their figures must not be labelled exact or official.

## Defensible Collection Method

1. Collect redacted screenshots or PDF prints of the fee breakdown displayed
   before payment on the official NOUN portal.
2. Require each submission to include programme, level, semester, and the date
   checked. Student status is inferred from level and semester.
3. Remove names, matriculation numbers, wallet balances, RRR numbers, phone
   numbers, email addresses, and payment details before submission.
4. Record every line item exactly as displayed by the portal.
5. Require at least two matching independent submissions before publishing a
   rate as verified.
6. Store `verifiedAt`, source count, student status, and applicability rules
   with every rate.
7. Re-check rates at the beginning of every semester.

## Important Applicability Dimensions

- First or second semester
- Direct-entry first-semester charges
- Course credit units
- Practical, project, SIWES, clinical, and other special course charges

## Current Product Rule

Display captured Puredu fee amounts as a clearly labelled third-party snapshot,
including the retrieval date. Never label them official or exact NOUN figures.
Where Puredu returns no complete breakdown, display the amount as `Pending`.

The semester registration fee is uniform across departments and programmes for
the same student status. Infer a new student from `100 level + First Semester`.
Treat every other level and semester combination as returning. Maintain one
verified new-student rate and one verified returning-student rate. Course and
exam registration charges remain dependent on the selected courses.
