# NOUN TMA Workflow Map

Captured: 2026-06-19

Observed course: `Numerical Analysis (MTH213_261)`

Important limitation: the observed TMAs were already completed and closed. Because of that, this map documents the real finished-state workflow and visible rules, but it does not claim to have observed a live in-progress submission form.

## Workflow Summary

| Step | What Was Observed | Evidence |
| --- | --- | --- |
| Access dashboard | Student lands on `Dashboard` after login | `https://elearn.nou.edu.ng/my/` |
| Locate TMA | Dashboard showed direct TMA shortcuts under `Recently accessed items` | `TMA1`, `TMA2`, `TMA3` were visible |
| Alternative path | Course page had a dedicated `TMA` section | `Tutor Marked Assignment 1`, `2`, `3` listed in course page |
| Open TMA page | Specific TMA activity page opens | `mod/quiz/view.php?id=469781` observed |
| Read TMA status and rules | TMA page displayed opening date, closing date, and attempt limit | `Opened`, `Closed`, `Attempts allowed: 1` visible |
| Review attempt state | Finished attempt summary was visible | `Status Finished`, `Started`, `Completed`, `Duration`, `Review not permitted` |
| Score visibility | Grades were visible in both overall and course-specific grade pages | Course total and TMA line items were visible |

## Required Questions Answered

### How students access TMAs

Observed paths:

1. `Dashboard` -> `Recently accessed items` -> direct TMA link
2. `Course page` -> `TMA` section -> choose `TMA1`, `TMA2`, or `TMA3`
3. `TMA activity page` -> `Course index` -> `TMA` subsection -> choose another TMA

### How many TMAs exist per course

Observed on `MTH213_261`:

- `TMA1`
- `TMA2`
- `TMA3`

This confirms three TMAs for the observed course. This should not be generalized to every course without further verification.

### How TMA deadlines are displayed

The TMA page clearly shows:

- `Opened`
- `Closed`

Example observed on `TMA1`:

- Opened: `Monday, 2 March 2026, 12:00 AM`
- Closed: `Sunday, 7 June 2026, 11:59 PM`

### How TMAs are submitted

Observed page instruction:

- `Click on Attempt TMA Now to begin the TMA`

Observed rule:

- `Attempts allowed: 1`

Observed limitation:

- The live clickable submission form was not available to observe because the seen TMA attempts were already finished and the visible state said `No more attempts are allowed`.

### How scores are displayed

Two score surfaces were visible:

| Surface | What It Shows |
| --- | --- |
| Grades overview | Per-course totals across enrolled courses |
| Course-specific grade report | Individual TMA items, weighting, raw score, percentage, and course total |

Observed on the course grade report:

- `Tutor Marked Assignment 1 (TMA1)` -> score visible
- `Tutor Marked Assignment 2 (TMA2)` -> score visible
- `Tutor Marked Assignment 3 (TMA3)` -> score visible
- `Course total` -> visible

### What happens after submission

Observed post-submission state:

- Attempt status changes to `Finished`
- Start time is shown
- Completion time is shown
- Duration is shown
- `Review not permitted` is shown
- `No more attempts are allowed` is shown after the single permitted attempt is used

### What common restrictions exist

Directly observed restrictions:

- Only one attempt allowed on the observed TMAs
- Review is not permitted after submission on the observed TMAs
- Closed date is hard-displayed on the activity page
- Once the attempt is finished, the page states that no more attempts are allowed

## Real Workflow, End to End

1. Student logs into eLearn and lands on the dashboard.
2. Student either opens a course or uses a recently accessed TMA shortcut.
3. Student opens the TMA activity page.
4. Student checks the open date, close date, and allowed attempts.
5. Student begins the TMA through the `Attempt TMA Now` path when available.
6. After submission, the page shows a finished attempt summary rather than an editable submission state.
7. Student checks results through:
   - the course-specific grade report, or
   - the overall grades overview.

## Dead Ends and Friction Found

- `My courses` did not clearly expose a populated course list during the session.
- The course page is long enough that the `TMA` section can be missed.
- The phrase `Attempt TMA Now` is visible even when the attempt is already finished, which can create confusion if the student does not notice the finished-state summary below it.
- Students must understand that `Grades` and the TMA page are different surfaces.

## Confidence Level

High confidence:

- TMA count for the observed course
- TMA deadline display pattern
- attempt limit
- post-submission summary pattern
- score visibility pattern

Lower confidence:

- exact live submission form flow for a not-yet-attempted TMA
- retry behavior on courses with different rules
