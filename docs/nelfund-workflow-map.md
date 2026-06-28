# NELFUND Workflow Map For NOUN Students

Last updated: 2026-06-20

## Scope

This workflow map combines two things only:

- the public official NELFUND registration flow that could be verified without logging in
- the official NOUN evidence showing that approved NELFUND funds can be disbursed into NOUN students' e-wallets

It does not assume hidden steps that were not observed directly.

## Official Sources Used

- [Official NELFUND portal](https://portal.nelf.gov.ng/)
- [Official NELFUND registration flow](https://portal.nelf.gov.ng/auth/register)
- [NOUN homepage NELFUND call-to-action](https://nou.edu.ng/)
- [NOUN post: VC approves disbursement of NELFUND to NOUN students' e-wallets](https://nou.edu.ng/vc-approves-disbursement-of-nelfund-to-noun-students-e-wallets/)

## Verified Public Workflow

| Step | Observed Workflow | Evidence Source | Confidence |
| --- | --- | --- | --- |
| 1 | Student reaches the official NELFUND portal and is invited to start a student-loan application | [portal.nelf.gov.ng](https://portal.nelf.gov.ng/) | High |
| 2 | Student is told the portal is for the student-loan application process and can be completed online | [portal.nelf.gov.ng](https://portal.nelf.gov.ng/) | High |
| 3 | Registration begins with a question confirming the applicant is Nigerian | [auth/register](https://portal.nelf.gov.ng/auth/register) | High |
| 4 | Student must verify educational information before JAMB verification is completed | [auth/register](https://portal.nelf.gov.ng/auth/register) | High |
| 5 | Educational verification includes `Select Institution` | [auth/register](https://portal.nelf.gov.ng/auth/register) | High |
| 6 | Educational verification includes `Matric Number` | [auth/register](https://portal.nelf.gov.ng/auth/register) | High |
| 7 | The public flow shows a `missing information` state if data does not line up correctly | [auth/register](https://portal.nelf.gov.ng/auth/register) | High |
| 8 | Student then reaches a JAMB-based verification step | [auth/register](https://portal.nelf.gov.ng/auth/register) | High |
| 9 | JAMB verification requires `JAMB Registration No.` and `Date of birth` | [auth/register](https://portal.nelf.gov.ng/auth/register) | High |
| 10 | The next action is `Verify JAMB Profile` | [auth/register](https://portal.nelf.gov.ng/auth/register) | High |
| 11 | After successful JAMB verification, the system shows identity/profile fields returned from that verification | [auth/register](https://portal.nelf.gov.ng/auth/register) | High |
| 12 | The next visible continuation step is `Continue to Email Verification` | [auth/register](https://portal.nelf.gov.ng/auth/register) | High |
| 13 | NOUN publicly signals that students should apply for NELFUND | [nou.edu.ng](https://nou.edu.ng/) | High |
| 14 | NOUN confirms that approved NELFUND disbursement can reach students through the NOUN e-wallet path | [official NOUN disbursement post](https://nou.edu.ng/vc-approves-disbursement-of-nelfund-to-noun-students-e-wallets/) | High |

## Verified Inputs Seen In The Public Flow

The current public registration flow verified these data points:

- nationality confirmation
- institution selection
- matric number
- JAMB registration number
- date of birth
- email-verification continuation after JAMB profile verification

## Verified Outputs Or States Seen In The Public Flow

The current public registration flow verified these visible states:

- a structured multi-step application flow
- educational-data mismatch handling through a `missing information` state
- JAMB-profile review after verification
- continued verification toward email setup

## NOUN-Specific Workflow Findings

The current official evidence supports this NOUN-specific high-level path:

1. NOUN student sees or is directed to the NELFUND opportunity through official NOUN channels.
2. Student enters the official NELFUND application flow.
3. Student must pass institution and matric-number verification.
4. Student must pass JAMB-based student-status verification.
5. Where application approval succeeds, NOUN has already confirmed that disbursement can be routed to student e-wallets.

## Important Workflow Gaps Still Not Verified

The following workflow details were not fully confirmed in this pass:

- the exact full list of required supporting documents after email verification
- whether semester registration must already be completed before a NOUN record matches successfully
- the full NOUN-side process between approval and e-wallet reflection
- whether upkeep and fee components are shown separately for NOUN students
- whether any step differs for new students, returning students, or postgraduates

## Safe Editorial Boundary

Future content can safely explain the verified registration sequence up to:

- institution selection
- matric-number entry
- JAMB verification
- email-verification continuation

Future content should not describe later unobserved steps as guaranteed facts until they are verified from official documentation or a controlled portal session.
