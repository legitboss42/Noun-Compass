# NOUN Results Navigation Map

Last updated: 2026-06-19

## Scope

This document records only what was directly observed in the logged-in NOUN student portal during the Results and Academic Records research session.

Portal base:
- `https://www.nouonline.nou.edu.ng/`

Observed logged-in route pattern:
- `https://www.nouonline.nou.edu.ng/rs/*`

## Top-Level Navigation Relevant To Results

| Area | Observed Label | Route Behavior | Purpose | Results Relevance |
| --- | --- | --- | --- | --- |
| Top menu | `My progress` | submits portal form to `welcome_student` with `top_menu_no=9` | Opens student academic progress view | Primary results entry point observed |
| Top menu | `Support` | submits portal form to `welcome_student` with `top_menu_no=10` | Opens support/contact area | Used for result issue escalation path |
| Side menu under Support | `Drop a complaint (e-Ticketing)` | visible support entry | Escalation/support route | Relevant when result details are missing or disputed |
| Side menu under My courses | `See course registration slip` | submits to `see_course_registration_slip` | Registration proof/history view | Useful context for registration-history blockers |
| Side menu under My courses | `See all registered courses` | submits to `see_all_registered_courses` | Course registration list | Related academic record surface, not fully explored in this phase |
| Side menu under My courses | `See exam registration slip` | submits to `see_exam_registration_slip` | Exam registration proof | Related academic record surface, not fully explored in this phase |

## Support Portal Navigation Relevant To Results

Support portal base:
- `https://support.nou.edu.ng/`

Observed login route:
- `https://support.nou.edu.ng/login/`

Observed authenticated route:
- `https://support.nou.edu.ng/user`

| Area | Observed Label | Route Behavior | Purpose | Results Relevance |
| --- | --- | --- | --- | --- |
| Support dashboard | `Home` | default authenticated student view | Shows ticket history and student actions | Starting point after support login |
| Support dashboard | `Result statement` | calls internal app method and opens result page in a new tab | Direct result-statement access | Strongest verified results route |
| Support dashboard | ticket list | links like `/user/ticket/:ref` | Opens prior student tickets | Relevant for result-related complaint history |

## ERP Result Statement Destination Observed

Observed destination:
- `https://erp.nou.edu.ng/stsor`

Observed page title:
- `NOUN Result Portal | Examination Result Presentation`

Observed controls:
- `Export as PDF`
- `Print`
- `Back to previous page`

Observed academic sections:
- full grade table
- summary statistics
- performance standing
- grade statistics
- outstanding courses table

## Primary Results Surface Observed

### `My progress`

Observed page title:
- `My progress`

Observed route:
- `https://www.nouonline.nou.edu.ng/rs/welcome_student`

Observed page content:
- results table appears directly inside the student portal page
- historical academic periods shown inline as section labels
- observed periods: `2024_1` and `2024_2`
- visible table columns:
  - `Snos`
  - `Course Code`
  - `Course Title`
  - `Credit unit`
  - `Category`
  - `Grade`
  - `Repeat`
- visible summary rows:
  - `Total credit unit passed`
  - `Cummulative credit unit passed`

Observed notice on page:
- `Click on Support (top right), eTicketing (Left) and login to see more results`

Interpretation:
- the portal treats `My progress` as the direct results/history area
- the page also signals that some additional result-related help or access may require the Support path

## Registration History Surface Observed

### `See course registration slip`

Observed route:
- `https://www.nouonline.nou.edu.ng/rs/see_course_registration_slip`

Observed state on this account:
- page displayed blocker message instead of a slip record

Observed message:
- `Please register for the current semester on your home page. See procedure 'K' in 'How to do things' for steps to follow`

Interpretation:
- registration-history proof is gated by current-semester registration state
- students may hit this blocker when trying to confirm academic records before registration is complete

## Support / Complaint Surface Observed

### `Support`

Observed page title/content heading:
- `Contact support`

Observed route:
- returns through `welcome_student` support state

Observed items relevant to result issues:
- `Drop a complaint (e-Ticketing)` visible in the support area
- support contact categories visible, including `Registry`

Interpretation:
- the support area is the confirmed portal escalation path when result details are missing, incomplete, or require correction follow-up

## Not Visible During This Session

The following were specifically looked for but not visibly found on the student-portal route itself:

- semester selector dropdown for results
- carryover view
- transcript page
- dedicated result-correction form inside the student portal

These items should be treated as unverified until another live portal session exposes them.

The following were later verified through the support portal workflow:

- statement of result page
- CGPA display
- current class of degree
- courses passed / failed counts
- outstanding credit
- outstanding courses table
