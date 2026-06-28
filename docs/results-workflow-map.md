# NOUN Results Workflow Map

Last updated: 2026-06-19

## Scope

This workflow map is based only on directly observed behavior inside the logged-in student portal.

## Confirmed Results Workflow

### 1. Student enters the logged-in portal home

Observed route:
- `https://www.nouonline.nou.edu.ng/rs/welcome_student`

Observed menu label used for results:
- `My progress`

Observed navigation behavior:
- portal submits an internal form rather than using a normal public URL change
- the form uses `top_menu_no=9`

### 2. Student opens `My progress`

Observed result:
- a results/history page loads within the student portal
- no separate public-looking result checker was shown

Observed page elements:
- table header with:
  - `Snos`
  - `Course Code`
  - `Course Title`
  - `Credit unit`
  - `Category`
  - `Grade`
  - `Repeat`
- academic period sections visible inline:
  - `2024_1`
  - `2024_2`
- summary rows visible:
  - `Total credit unit passed`
  - `Cummulative credit unit passed`

### 3. Student reads historical result rows

Observed grade behavior on this account:
- the `Grade` column was present
- visible rows showed `-` rather than letter grades or numeric grades

Observed interpretation boundary:
- it was possible to confirm that the grade field exists
- it was not possible to confirm why the grade cells were dashes from this session alone

### 4. Student checks cumulative academic progress

Observed academic summary:
- period totals were shown
- cumulative passed credit unit total was shown

Observed limitation:
- no separate CGPA figure was visible on the page

### 5. Student follows escalation note when more result detail is needed

Observed note on results page:
- `Click on Support (top right), eTicketing (Left) and login to see more results`

Observed support path:
1. open `Support` from the top menu
2. locate `Drop a complaint (e-Ticketing)` in the support area
3. use that route for escalation or additional help

This is the clearest observed complaint workflow tied to results.

### 6. Student logs into the NOUN support portal

Observed login route:
- `https://support.nou.edu.ng/login/`

Observed authenticated route:
- `https://support.nou.edu.ng/user`

Observed dashboard behavior:
- ticket history is visible after login
- a dedicated `Result statement` action appears in the student navigation

### 7. Student opens `Result statement` from the support portal

Observed implementation:
- the support app calls a function named `getResultLink()`
- that function requests a student-specific result link from the support backend
- the result opens in a new tab

Observed destination:
- `https://erp.nou.edu.ng/stsor`

### 8. Student views the ERP statement of result

Observed page title:
- `NOUN Result Portal | Examination Result Presentation`

Observed sections:
- grade table
- summary statistics
- performance standing
- grade statistics
- outstanding courses

Observed controls:
- `Export as PDF`
- `Print`
- `Back to previous page`

## ERP Result Statement Fields Verified

| Field / Section | Observed? | Notes |
| --- | --- | --- |
| Statement of result page | Yes | opened from support portal |
| Grade table | Yes | includes course code, title, unit, grade, point, gpoint, status, batch |
| Historical periods | Yes | represented through `Batch` values such as `2024_1` and `2024_2` |
| Courses taken | Yes | visible in summary statistics |
| Courses passed | Yes | visible in summary statistics |
| Courses failed | Yes | visible in summary statistics |
| Current class of degree | Yes | visible on this account |
| Min. credit required | Yes | visible |
| Total credit earned | Yes | visible |
| Outstanding credit | Yes | visible |
| CGPA | Yes | visible on this account |
| Grade statistics | Yes | visible |
| Outstanding courses | Yes | visible as a separate table |
| Transcript workflow | No | not observed |
| Carryover label/workflow | No | not explicitly labeled in this session |

## Required Questions Answered

| Question | Observed Answer | Confidence |
| --- | --- | --- |
| How do students check results? | Open `My progress` from the logged-in portal top menu | High |
| How are semesters selected? | No semester selector was visible; periods appeared inline as `2024_1` and `2024_2` | High for absence on this account |
| How are grades displayed? | In a `Grade` column inside the progress table; observed rows showed dashes | High |
| How is CGPA displayed? | On the ERP statement-of-result page opened from support portal | High |
| How do outstanding courses appear? | On the ERP result page as an `Outstanding Courses` section with code, title, unit, and status columns | High |
| How do carryovers appear? | Not visible during this session | High for absence on this account |
| How are historical results accessed? | `My progress` shows inline history, and support-portal `Result statement` shows a full table with `Batch` values such as `2024_1` and `2024_2` | High |

## Related Academic Record Workflow Observed

### Course registration history

Observed route:
- `see_course_registration_slip`

Observed blocker:
- user must register for the current semester before a registration slip can be viewed on this account

Why it matters:
- students often use registration slips and course-registration history to verify whether missing results are tied to registration status

## Restrictions And Dead Ends Observed

- no visible semester filter was available on the results page
- no visible transcript page was found
- no explicit carryover section or carryover label was found
- registration-history proof was blocked when current-semester registration was incomplete
- the results page itself pushed the student toward Support/e-Ticketing for additional help

## Safe Conclusions

- `My progress` is the confirmed in-portal results/history page
- NOUN surfaces at least some historical academic data directly on that page
- support escalation is part of the real workflow, not just a generic help option
- the support portal provides a stronger verified path to the full statement of result
- transcript and explicit carryover workflows still need a future live verification session before content can be written about them confidently
