# Curriculum Recovery Plan

## Current Catalog Status

- 9 faculties
- 99 programmes
- 75 programmes with usable semester course rows
- 24 programmes still empty
- 3 programmes recovered from official curriculum documents
- 2 additional programmes with a located public official source that still
  requires a trustworthy semester table
- 1 programme still requiring public-source research
- 21 programmes requiring a current authenticated portal export unless an
  official postgraduate handbook is located

Puredu already returns level and semester placeholders for the 27 gaps, but its
result endpoint returns no course rows. Retrying the same endpoint will not fix
them.

The complete machine-readable recovery queue is maintained in
`data/curriculum-recovery.ts`. Its programme names intentionally match the
extracted dataset exactly so recovered rows can be merged without guesswork.

## Recovered Programmes

| Programme | Imported rows | Source |
| --- | ---: | --- |
| B.Sc. Cyber Security | 70 | Official 2024 B.Sc. Cybersecurity OPP and DPP |
| B.A. Christian Theology | 68 | Official Faculty of Arts Handbook |
| B.A. Arabic | 72 | Official Faculty of Arts Handbook |

## Recovery Priority

### Priority 1: Official programme handbooks and detailed programme documents

These sources can provide the required level, semester, course code, title,
credit unit, and status structure.

| Programme | Recovery source |
| --- | --- |
| B.A. Arabic | Faculty of Arts Undergraduate Students' Handbook, programme outline begins in the Arabic section |
| B.A. Christian Theology | Faculty of Arts Undergraduate Students' Handbook, Christian Theology section |
| B.Agric Crop Science | Faculty of Agricultural Sciences course-list pages and students' handbook |
| B.Sc. Cyber Security | Official OPP/DPP B.Sc. Cybersecurity programme PDF |
| B.Sc. Broadcast Journalism | Faculty of Social Sciences Mass Communication/Broadcasting programme sources |
| PGD Education | Faculty of Education handbook |

### Priority 2: Faculty postgraduate handbooks

Use official faculty or departmental postgraduate handbooks for:

- PGD Agricultural Extension Management
- PGD Christian Theology
- M.A. Islamic Studies
- M.A. English specialisations
- M.A. Christian Religious Studies specialisations
- PGD Legislative Drafting
- LL.M. Law
- M.Sc. Entrepreneurship
- M.Sc. Chemistry specialisations
- PGD Economics
- PGD Criminology and Security Studies

### Priority 3: Authenticated portal curriculum export

If no official public handbook or detailed programme document exists, collect a
curriculum export from a registered student in the programme. The export must
show:

- Programme name
- Level
- Semester
- Course code
- Course title
- Credit units
- Compulsory/elective status

Do not collect passwords, payment credentials, matriculation numbers, or other
unnecessary personal information.

## Official Sources Already Located

- Faculty of Arts handbook:
  `https://www.foa.nou.edu.ng/wp-content/uploads/2022/10/FOA-Handbook-reviewed-12th-oct-2022.pdf`
- B.A. Arabic official programme record:
  `https://digital.nou.edu.ng/programmes/ba-arabic`
- B.Agric Crop Science official programme record:
  `https://digital.nou.edu.ng/programmes/bagric-crop-science`
- Faculty of Agriculture course list:
  `https://fas.nou.edu.ng/crop-and-soil-sciences-courses/`
- Cyber Security department:
  `https://foc.nou.edu.ng/department-of-cyber-security/`
- B.Sc. Cybersecurity detailed programme PDF:
  `https://foc.nou.edu.ng/wp-content/uploads/sites/5/2026/02/OPP-and-DPP-NOUN-BSc-Cybersecurity-2024-1.pdf`
- Faculty of Education handbook:
  `https://nou.edu.ng/wp-content/uploads/sites/11/2022/02/EDUCATION-Handbook-updated-June-28-2019.pdf`

## Import and Review Rules

1. Extract tables into the curriculum JSON structure.
2. Preserve the official course code, title, units, status, level, and semester.
3. Record the exact source URL and document date.
4. Compare with current portal evidence when available.
5. Mark a programme verified only after a second-source or portal review.
6. Keep fee figures separate from curriculum data.
