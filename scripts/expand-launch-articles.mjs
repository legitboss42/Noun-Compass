import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const topics = {
  "how-to-apply-for-noun-admission": {
    task: "submit a careful NOUN admission application",
    outcome: "an application record that is accurate, traceable, and easier to follow up",
    records: ["the current programme name and entry route", "credentials that match your personal details", "an email address and phone number you control", "application and payment references"],
    checks: ["Confirm the programme exists on the current official admissions information.", "Compare your qualifications with the programme-specific entry requirements.", "Check that names, dates, and credential details are consistent.", "Use only the current application and payment channels linked by NOUN.", "Review every field before submission.", "Save the submitted record and all references."],
    mistakes: ["Choosing a programme before reading its specific requirements", "Allowing another person to control the application email or phone number", "Paying an individual who promises guaranteed admission", "Submitting inconsistent personal details", "Losing the application reference", "Paying again before investigating an unclear transaction"],
  },
  "noun-admission-requirements": {
    task: "confirm whether your credentials fit a NOUN programme",
    outcome: "a defensible programme choice before you spend money on an application",
    records: ["the exact programme title", "the intended entry route", "all relevant credentials and result details", "official programme-specific requirement pages"],
    checks: ["Start with the exact programme rather than a general faculty name.", "Identify whether you are applying through a standard or direct-entry route.", "Compare required subjects and qualifications line by line.", "Check whether any result, certificate, or verification is still pending.", "Resolve significant name differences across records.", "Ask an official channel when a requirement remains ambiguous."],
    mistakes: ["Assuming one programme's requirements apply to another", "Relying on an old social-media list", "Ignoring subject combinations", "Treating a pending result as automatically accepted", "Applying with inconsistent names", "Paying before resolving a clear eligibility concern"],
  },
  "noun-school-fees-new-students": {
    task: "plan a new student's first NOUN payments",
    outcome: "a realistic budget and a clear record of what each payment covers",
    records: ["your admission and student details", "the current portal bill", "the description of every charge", "payment references and receipts"],
    checks: ["Confirm the student record before generating or paying a bill.", "Separate one-time onboarding charges from recurring charges.", "Review course and examination selections that affect the total.", "Compare the fee-checker estimate with the current portal amount.", "Use only an official payment route.", "Confirm that each successful payment reflects before continuing."],
    mistakes: ["Using another student's bill as your own estimate", "Ignoring one-time new-student charges", "Paying from an unofficial link", "Proceeding when the student details are wrong", "Discarding receipts", "Repeating a delayed payment immediately"],
  },
  "noun-school-fees-returning-students": {
    task: "plan a returning student's semester costs",
    outcome: "a semester budget based on the courses and charges that actually apply",
    records: ["the current student portal bill", "the intended course list", "outstanding-course information", "previous payment and registration records"],
    checks: ["Confirm the correct academic session, level, and semester.", "Review outstanding and repeat courses before estimating.", "Include only electives you intend and are permitted to register.", "Check course and examination charges separately.", "Compare estimates with your current portal bill.", "Save the final bill, receipts, and registration record."],
    mistakes: ["Assuming every returning student pays the same amount", "Using a previous semester's bill without checking changes", "Including every elective in the estimate", "Forgetting outstanding courses", "Paying before reviewing course selections", "Losing evidence needed for a support request"],
  },
  "how-to-pay-noun-school-fees": {
    task: "pay NOUN fees safely and preserve useful evidence",
    outcome: "a traceable payment that can be verified or investigated",
    records: ["the current portal invoice or charge", "correct student details", "the transaction reference", "the receipt and reflection status"],
    checks: ["Confirm the charge belongs to your student record.", "Read the payment description and amount carefully.", "Use only the official payment workflow.", "Record the transaction reference before closing the page.", "Save the receipt after payment.", "Check that the transaction reflects before repeating any action."],
    mistakes: ["Sending money to a personal account", "Sharing portal or card credentials", "Paying a charge you do not understand", "Closing the page without saving the reference", "Paying twice when reflection is delayed", "Reporting a problem without the relevant evidence"],
  },
  "how-to-register-noun-courses": {
    task: "register the correct NOUN courses for a semester",
    outcome: "a reviewed course-registration record that supports later fee, examination, and result workflows",
    records: ["the current programme and level information", "the intended semester course list", "outstanding-course records", "the final registration slip"],
    checks: ["Confirm the session, programme, level, and semester.", "Review compulsory, elective, outstanding, and repeat courses.", "Compare every course code and title before selecting it.", "Check credit units and prerequisites where applicable.", "Review the generated fees and final selection.", "Submit only after a complete review and save the registration slip."],
    mistakes: ["Registering from an old curriculum without confirmation", "Selecting every elective", "Ignoring outstanding courses", "Confusing similar course codes", "Submitting before reviewing units and semester", "Failing to save the final registration record"],
  },
  "how-to-check-noun-results": {
    task: "review a NOUN result record responsibly",
    outcome: "an organized academic record and a clearer report when something looks wrong",
    records: ["the current result record", "course and examination registration slips", "assessment or examination evidence where applicable", "previous saved result records"],
    checks: ["Confirm that you are viewing the correct session and semester.", "Compare course codes with your registration record.", "Review grades and credit units carefully.", "Note missing, duplicated, or unexpected entries.", "Save a responsible copy for your records.", "Use the official review or support process when necessary."],
    mistakes: ["Assuming a missing result will correct itself", "Reporting an issue without checking registration", "Sharing portal passwords with someone offering help", "Relying only on an unofficial calculation", "Failing to keep earlier records", "Submitting repeated reports without the first reference"],
  },
  "noun-study-centres-in-lagos": {
    task: "prepare for useful contact with a Lagos NOUN study centre",
    outcome: "a better-planned visit or enquiry with the right evidence",
    records: ["the current official centre details", "a concise description of your task", "relevant student references or receipts", "appropriate identification"],
    checks: ["Confirm the centre address through current official information.", "Check whether the centre handles the task you need.", "Call ahead where possible.", "Prepare a concise timeline and supporting references.", "Protect unnecessary personal information.", "Record the guidance or reference received."],
    mistakes: ["Travelling from an old map listing", "Assuming every centre handles every service", "Arriving without relevant references", "Sharing passwords or one-time codes", "Explaining the issue without a clear timeline", "Leaving without noting the next step"],
  },
  "gst302-summary": {
    task: "build a practical GST302 study plan",
    outcome: "stronger understanding based on official learning objectives and active recall",
    records: ["the current official course material", "the course guide and learning objectives", "your own topic notes", "a revision schedule and weak-area list"],
    checks: ["Confirm GST302 is part of your current registration.", "Start with the official course guide and objectives.", "Divide the material into manageable themes.", "Explain concepts in your own words.", "Connect ideas to realistic examples.", "Test recall and revisit weak areas before assessment."],
    mistakes: ["Treating a short summary as a replacement for official material", "Memorizing definitions without application", "Studying without the learning objectives", "Reading passively without testing recall", "Using unverified answer repositories", "Leaving difficult themes until the final revision day"],
  },
  "noun-support-ticket-guide": {
    task: "submit a clear NOUN support request",
    outcome: "a ticket that gives the support team enough information to investigate",
    records: ["a concise issue description", "dates and relevant references", "safe screenshots or evidence", "the first ticket reference and follow-up history"],
    checks: ["State the exact task you were trying to complete.", "Describe what happened and when.", "Include relevant references without exposing secrets.", "Explain the action already taken.", "Ask for a specific next step.", "Keep the ticket reference and follow up responsibly."],
    mistakes: ["Writing only that the portal is not working", "Omitting dates and references", "Sending passwords or one-time codes", "Submitting repeated duplicate tickets", "Attaching unrelated sensitive documents", "Failing to keep the first support reference"],
  },
  "noun-exam-registration-guide": {
    task: "confirm a complete NOUN examination registration",
    outcome: "a reviewed examination record before the relevant deadline",
    records: ["the current course-registration slip", "the examination-registration record", "the current timetable or venue instructions", "payment and support references"],
    checks: ["Confirm every intended course is correctly registered.", "Complete the current examination-registration workflow.", "Review course codes and eligibility.", "Confirm current venue, mode, and timetable instructions.", "Save the final examination record.", "Report missing or incorrect entries before the deadline."],
    mistakes: ["Assuming course registration automatically completes exam registration", "Ignoring a missing examination course", "Using an old timetable", "Waiting until examination day to investigate", "Losing the final registration record", "Relying on an unofficial venue message"],
  },
};

const directory = path.join(process.cwd(), "content", "articles");

for (const filename of fs.readdirSync(directory).filter((name) => name.endsWith(".mdx"))) {
  const fullPath = path.join(directory, filename);
  const parsed = matter(fs.readFileSync(fullPath, "utf8"));
  const topic = topics[parsed.data.slug];
  if (!topic) continue;

  parsed.data.image ??= "/og-default.svg";
  if (parsed.content.includes("## Why this workflow deserves careful preparation")) {
    fs.writeFileSync(fullPath, matter.stringify(parsed.content, parsed.data));
    continue;
  }

  const records = topic.records.map((item) => `- ${item}`).join("\n");
  const checks = topic.checks.map((item, index) => `${index + 1}. ${item}`).join("\n");
  const mistakes = topic.mistakes.map((item) => `- ${item}`).join("\n");

  const expansion = `

## Why this workflow deserves careful preparation

The practical goal is to ${topic.task}. A good process should leave you with ${topic.outcome}. That matters because many student problems become harder to resolve when the original details, references, or final submitted record are missing.

NOUN students often move between public information pages, the student portal, payment services, study centres, and support channels. Each part may answer a different question. Before taking action, identify which part of the process you are completing and which official record should confirm that it worked. An independent guide can help you prepare, but it cannot replace the current instruction attached to your own student record.

Give yourself time to read the complete screen before submitting or paying. If a result is unclear, pause and collect evidence instead of repeating the action immediately. This approach is slower for a few minutes but can prevent duplicate payments, wrong selections, and support requests that lack enough information to investigate.

## Records to prepare before you begin

Prepare the following items and keep them in a secure location:

${records}

Only provide information that is necessary for the task. NOUN Compass will never ask for your portal password, one-time code, payment-card details, or unrestricted access to your account. If another person is helping you understand a process, remain in control of your email address, phone number, credentials, and payment decisions.

Create a simple folder for the current academic session. Use clear filenames that include the task and date, such as "course-registration-first-semester" or "payment-receipt-2026-06-12". A consistent record makes it easier to compare what happened and explain a problem later.

## A careful completion checklist

${checks}

After completing the task, verify the outcome rather than assuming that a success message means every connected record has updated. For example, a payment may need to reflect before another workflow becomes available, and a submitted selection should be checked against the final saved record.

> **Recommended next step:** Keep the final confirmation with your session records, then continue through the related guides listed near the bottom of this page.

## How to verify information safely

Use the official NOUN website, your current student portal record, authorized announcements, and your study centre when a decision affects admission, payment, registration, examinations, or results. Check the date and context of every instruction. A page can be official but old, and a current message can still be irrelevant to your programme or level.

When two sources disagree, do not choose the more convenient answer automatically. Note the disagreement and look for the instruction tied most directly to your current student record. For payment questions, the final portal charge and authorized payment workflow take priority. For programme questions, current programme-specific information is more useful than a general list.

NOUN Compass shows last-checked dates and official-source links to help you verify. These signals improve transparency, but they do not guarantee that an external process has not changed since the review date.

## Common mistakes and how to avoid them

${mistakes}

Most of these mistakes can be avoided with a short pause before submission. Read codes character by character, confirm names against records, and save references before leaving a page. When an action has financial or academic consequences, ask for clarification through an official channel rather than relying on a guess.

## If something goes wrong

First, stop repeating the action. Write down what you attempted, the date and approximate time, the page or channel used, the expected outcome, and what happened instead. Keep relevant references and safe screenshots. This creates a useful timeline without exposing sensitive credentials.

Next, check whether the problem is only a delayed update or a clear error. Review your own saved records and the current official instructions. If official support is required, submit one clear request and keep its reference. Repeated duplicate requests can make a simple issue harder to track.

Use the [NOUN support ticket guide](/articles/noun-support-ticket-guide) when you need help organizing a report. For a connected payment or registration issue, review the [school fee payment guide](/articles/how-to-pay-noun-school-fees) and [course registration guide](/articles/how-to-register-noun-courses) before taking another action.

## Official-source and independence note

NOUN Compass is an independent student resource. We explain workflows, organize checks, and link students to related guidance. We are not affiliated with NOUN, cannot access student accounts, and cannot approve, reverse, or change an official record.

This guide was last checked on ${parsed.data.updatedAt}. Use the official source linked on this page to confirm the current process before acting. Where your portal or an authorized NOUN instruction differs from this guide, follow the official information and report the difference to our editorial team so the guide can be reviewed.

## Final checklist

- I confirmed the task against current official information.
- I checked that personal details, course codes, amounts, or references are correct.
- I used only an authorized workflow.
- I saved the final record and relevant evidence.
- I know the official channel to use if the outcome is unclear.
- I did not share passwords, one-time codes, or unnecessary sensitive information.
`;

  fs.writeFileSync(fullPath, matter.stringify(`${parsed.content.trim()}\n${expansion.trim()}\n`, parsed.data));
}

for (const filename of fs.readdirSync(directory).filter((name) => name.endsWith(".mdx"))) {
  const fullPath = path.join(directory, filename);
  const parsed = matter(fs.readFileSync(fullPath, "utf8"));
  const words = parsed.content.replace(/<[^>]+>|[#>*[\]().\d-]/g, " ").split(/\s+/).filter(Boolean).length;
  if (words >= 1200 || parsed.content.includes("## Helping another student responsibly")) continue;
  const addition = `

## Helping another student responsibly

You can help a classmate understand this workflow without taking control of the person's account. Explain the checks, point to the official source, and encourage the student to review each final entry personally. Do not collect passwords, one-time codes, payment-card details, or copies of identity documents that you do not need.

When sharing a screenshot for explanation, remove names, matriculation numbers, references, balances, and other private details. A useful helper teaches the student how to verify the outcome and preserve records. If the issue requires access to an official student record, direct the student to an authorized NOUN support channel rather than attempting an unofficial workaround.
`;
  fs.writeFileSync(fullPath, matter.stringify(`${parsed.content.trim()}\n${addition.trim()}\n`, parsed.data));
}
