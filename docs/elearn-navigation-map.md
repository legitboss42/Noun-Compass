# NOUN eLearn Navigation Map

Captured: 2026-06-19

Scope: live observation of a logged-in NOUN eLearn session. This map records only surfaces that were directly visible during the session.

## Entry Points Observed

| Area | Route | Visible Label | Student Purpose | Notes |
| --- | --- | --- | --- | --- |
| Dashboard | `https://elearn.nou.edu.ng/my/` | `Dashboard` | Landing page after login | Shows timeline, calendar, course selector, recently accessed items, footer guides |
| My Courses | `https://elearn.nou.edu.ng/my/courses.php` | `My courses` | Course overview area | Controls were visible, but enrolled course cards did not clearly populate during this session |
| Course Page | `https://elearn.nou.edu.ng/course/view.php?id=15800` | `Numerical Analysis (MTH213_261)` | Main course learning area | Course sections are stacked and collapsible |
| TMA Activity | `https://elearn.nou.edu.ng/mod/quiz/view.php?id=469781` | `Tutor Marked Assignment 1 (TMA1)` | TMA details, timing, attempt summary | Open/close dates and attempt restrictions are shown here |
| Grades Overview | `https://elearn.nou.edu.ng/grade/report/overview/index.php` | `Grades` | Cross-course results view | Shows per-course totals |
| Course Grade Report | `https://elearn.nou.edu.ng/course/user.php?mode=grade&id=15800&user=...` | `Grades` | Course-specific grade breakdown | Shows TMA weights, raw scores, percentages, and course total |
| Support | `https://elearn.nou.edu.ng/user/contactsitesupport.php` | `Contact site support` | Send support request | Form fields for name, email, subject, message |

## Primary Navigation Observed

Top navigation labels visible in the logged-in session:

- `Home`
- `Dashboard`
- `My courses`
- `Mobile app`
- `More`

User menu links visible in the logged-in session:

- `Profile`
- `Grades`
- `Calendar`
- `Private files`
- `Reports`
- `Preferences`
- `Log out`

Footer/help links visible across pages:

- `NOUN Website`
- `eCourseware`
- `Courses for Facilitation & Schedule`
- `Guides on eLearn and TMAs`
- `GST Video Guides`
- `lcms@noun.edu.ng`

## Dashboard Map

Visible blocks on the dashboard:

| Section | What Was Visible | Why It Matters |
| --- | --- | --- |
| Students' video guide | Link to course-page navigation video | New students may rely on this before exploring the LMS |
| Timeline | Activity filter and search controls | Intended to surface upcoming or overdue learning tasks |
| Calendar | Month view plus course selector | Likely used for due-date awareness, though event detail was not populated in the captured month |
| Recently accessed items | Direct links to `TMA1`, `TMA2`, `TMA3`, and discussion forums | This is a real shortcut into TMAs without re-entering the course page |
| Footer links | Official support and guide links | Important fallback when students are lost |

## Course Page Map

Observed course structure on `MTH213_261`:

| Order | Visible Section |
| --- | --- |
| 1 | `General` |
| 2 | `Ensuring Academic Integrity: Your Path to True Success` |
| 3 | `Meet Your Facilitator` |
| 4 | `Introduction` |
| 5 | `Virtual Library` |
| 6 | `Week 1` |
| 7 | `Week 2` |
| 8 | `Week 3` |
| 9 | `Week 4` |
| 10 | `Week 5` |
| 11 | `Week 6` |
| 12 | `Revision` |
| 13 | `TMA` |
| 14 | `Course Feedback` |

Weekly section pattern observed:

- `Course Resources`
- `Learning Outcomes`
- `Announcement`
- `Discussion Forum`
- `Live Class`
- `Instructional Video` or `Instructional Videos`

## TMA Area Map

The course has a dedicated `TMA` section containing:

- `Tutor Marked Assignment 1 (TMA1)`
- `Tutor Marked Assignment 2 (TMA2)`
- `Tutor Marked Assignment 3 (TMA3)`

Observed entry paths to TMAs:

1. `Dashboard` -> `Recently accessed items` -> direct TMA link
2. `My courses` / `Course page` -> open course -> scroll to `TMA` section -> choose `TMA1`, `TMA2`, or `TMA3`
3. `Course index` on the activity page -> `TMA` subsection -> choose specific TMA

## Profile, Notifications, Results, and Help Areas

| Area | Status | Observation |
| --- | --- | --- |
| Notifications | Visible | Notification icon and `See all` link were visible; the observed state showed no notifications |
| Profile area | Visible | Available through the user menu; not explored deeply to avoid unnecessary exposure of personal data |
| Results area | Visible | Both overall grades and course-level grade breakdown were accessible |
| Help area | Visible | Support form and footer guide links were directly accessible |

## Notable UX Findings

- The dashboard offers multiple ways into a course or TMA, but they are split across top nav, side blocks, and course index patterns.
- `My courses` did not present a clearly populated list during the session, which may confuse students who expect that page to be the primary course directory.
- The course page is dense and section-heavy, so students may miss the `TMA` block if they do not understand the course index or do not scroll far enough.
