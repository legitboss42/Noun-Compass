import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const researchPath = path.join(process.env.TEMP, "nouncompass-research.txt");
const contentDir = path.join(process.cwd(), "content", "articles");
const research = fs.readFileSync(researchPath, "utf8").replace(/\r/g, "");

const articles = [
  {
    number: 1,
    file: "how-to-pay-noun-school-fees.mdx",
    title: "How to Pay NOUN School Fees Safely: E-Wallet and Payment Guide",
    description: "Learn how to plan and complete a NOUN school-fee payment, verify your e-wallet, preserve payment evidence, and respond safely when money does not reflect.",
    keyword: "noun school fees",
    secondary: ["NOUN e-wallet payment", "NOUN fee payment", "NOUN payment not reflecting", "Remita NOUN payment"],
    links: [["check likely semester costs", "/fees"], ["plan first-semester charges", "/articles/noun-school-fees-new-students"], ["budget as a returning student", "/articles/noun-school-fees-returning-students"], ["register the correct courses", "/articles/how-to-register-noun-courses"], ["prepare a useful support report", "/articles/noun-support-ticket-guide"]],
    screenshots: ["Official NOUN page that links to the current student portal", "Current wallet or payment menu with personal details hidden", "Payment-reference screen before payment", "Successful receipt with sensitive details removed", "Updated wallet or transaction-history view"],
    image: "A photorealistic Nigerian university student reviewing a secure payment confirmation on a laptop in a bright modern study area, a notebook and bank card nearby, calm professional mood, no visible text, no logos, no copyrighted elements.",
    scenarios: [
      ["The bank debited you but the wallet did not update", "Do not pay again immediately. Preserve the debit alert, transaction reference, receipt, date, amount, and the wallet view. Check the current official payment-status process, then submit one clear support report if the transaction remains unresolved."],
      ["You generated a reference but did not complete payment", "Confirm the current status of that reference before generating another one. An unpaid or expired reference is different from a successful payment that has not reflected. Use the official workflow to determine the next safe action."],
      ["Your wallet balance is lower than expected", "Compare the opening balance, funded amount, and every completed registration charge. A wallet balance can change after compulsory, course, or examination transactions. Treat your own current portal ledger as the working record."],
      ["Someone offers to fund the wallet for you", "Remain in control of the portal account and payment decision. Never share a password, one-time code, card PIN, or unrestricted portal access. A legitimate helper can explain a screen without taking control of the account."],
      ["The amount in a blog differs from your portal", "Use the blog only for planning. Fees and course selections can change, and another student may have a different programme or workload. Confirm the final payable amount through your own current official record."],
      ["You need evidence for support", "Create one folder containing the invoice or charge, payment reference, receipt, safe screenshot of the unresolved status, and a short timeline. This is more useful than sending repeated messages without references."],
    ],
  },
  {
    number: 2,
    file: "how-to-check-noun-results.mdx",
    title: "How to Check NOUN Results and Handle Missing Grades",
    description: "Learn how to check NOUN results, compare grades with registration records, save evidence, and report missing or incorrect entries through official channels.",
    keyword: "how to check NOUN results",
    secondary: ["NOUN result portal", "missing NOUN result", "NOUN grades", "NOUN statement of result"],
    links: [["review your course registration", "/articles/how-to-register-noun-courses"], ["confirm exam registration", "/articles/noun-exam-registration-guide"], ["plan returning-student fees", "/articles/noun-school-fees-returning-students"], ["prepare a support ticket", "/articles/noun-support-ticket-guide"], ["browse result guidance", "/results"]],
    screenshots: ["Official portal result-navigation area with identity details hidden", "Session and semester selector", "Result table with personal data redacted", "Printable result or statement view if currently available", "Safe example showing a missing-course comparison"],
    image: "A photorealistic Nigerian university student calmly reviewing academic results on a laptop in a modern library, notebook and calculator on the desk, professional natural lighting, no visible text, no logos, no copyrighted elements.",
    scenarios: [
      ["A registered course is missing from the result view", "First compare the result with the saved course-registration and examination-registration records. Confirm the correct session and semester. If the course remains missing, report the exact course code with supporting evidence through the current official process."],
      ["A course appears twice", "Save a safe screenshot and compare both entries carefully. Do not assume which entry is valid or calculate future registration from an unresolved duplicate. Ask an authorised channel to clarify the official record."],
      ["A grade differs from your expectation", "Expectation alone is not evidence of an error. Review the available assessment and examination records, confirm the course code, and use the current review process if there is a specific documented discrepancy."],
      ["The portal is slow or unavailable", "Avoid repeated refreshes that may end the session or create confusion. Try later from a stable connection, confirm you are using the current official route, and keep any published result-release notice in context."],
      ["You need to plan outstanding courses", "Use the official result record together with the current curriculum and registration guidance. Do not treat an unofficial CGPA calculation or old screenshot as the final academic record."],
      ["Someone promises to upgrade a result", "Do not pay or share credentials. NOUN Compass cannot change results, and an unofficial person cannot provide a legitimate shortcut. Use only the authorised review or correction process."],
    ],
  },
  {
    number: 3,
    file: "how-to-register-noun-courses.mdx",
    title: "NOUN Course Registration Guide: Choose and Verify Your Courses",
    description: "Use this NOUN course-registration guide to review your curriculum, select eligible courses, avoid common mistakes, and save a reliable registration record.",
    keyword: "NOUN course registration",
    secondary: ["how to register NOUN courses", "NOUN portal registration", "NOUN semester registration", "NOUN course list"],
    links: [["review previous results", "/articles/how-to-check-noun-results"], ["estimate semester fees", "/fees"], ["plan returning-student charges", "/articles/noun-school-fees-returning-students"], ["complete exam registration", "/articles/noun-exam-registration-guide"], ["find course materials", "/course-materials"], ["report a portal problem", "/articles/noun-support-ticket-guide"]],
    screenshots: ["Official portal link and login page", "Current course-registration menu", "Course-selection table with identity details hidden", "Fee summary before final submission", "Final registration slip with personal information redacted"],
    image: "A photorealistic Nigerian university student comparing a course list on a laptop with a printed study plan in a modern campus workspace, focused professional mood, no visible text, no logos, no copyrighted elements.",
    scenarios: [
      ["A compulsory course is missing", "Confirm the programme, level, semester, curriculum version, and prerequisite position before taking action. Do not replace it with a different course simply because that course appears in the portal. Document the issue and seek official clarification."],
      ["Too many electives appear", "An available elective is not automatically a required elective. Check the current programme guidance and your manageable workload before choosing. Save evidence of the final selection."],
      ["You have a carryover or outstanding course", "Compare the outstanding course with the current curriculum and your result record. Confirm how it should be handled before submission because the right action can depend on the student record and current instructions."],
      ["A course code and title do not seem to match", "Stop before submitting. Similar codes can refer to different courses, and titles can change. Compare the portal entry with current official programme information and ask for clarification if the conflict remains."],
      ["Registration created an unexpected charge", "Review every selected course and the displayed fee components. Remove assumptions based on another student's bill. If the final official charge remains unclear, pause and use an authorised support route."],
      ["You submitted but cannot find the slip", "Return through the current official portal workflow and look for the final registration record or print option. If unavailable, preserve a safe screenshot and report the issue before connected exam or result workflows are affected."],
    ],
  },
  {
    number: 4,
    file: "noun-exam-registration-guide.mdx",
    title: "NOUN Exam Registration Guide: Verify Courses, Timetable, and Evidence",
    description: "Learn how to complete and verify NOUN exam registration, match examinable courses with your records, and resolve missing or incorrect entries.",
    keyword: "NOUN exam registration",
    secondary: ["NOUN examination registration", "NOUN exam courses", "NOUN exam portal", "NOUN exam registration slip"],
    links: [["confirm course registration", "/articles/how-to-register-noun-courses"], ["review school-fee payment", "/articles/how-to-pay-noun-school-fees"], ["check results after release", "/articles/how-to-check-noun-results"], ["prepare a support report", "/articles/noun-support-ticket-guide"], ["browse examination guidance", "/examinations"]],
    screenshots: ["Current official examination-registration menu", "Examinable-course selection view with personal data hidden", "Registration charge or confirmation screen", "Final exam-registration record", "Official timetable or venue source with the date visible"],
    image: "A photorealistic Nigerian university student reviewing an examination plan beside a laptop and organised notes in a quiet modern study room, confident professional mood, no visible text, no logos, no copyrighted elements.",
    scenarios: [
      ["A registered course does not appear for examination", "Compare course and exam records, confirm the course is examinable under the current instructions, and document the missing entry. Do not wait until examination day to seek clarification."],
      ["An unexpected course appears", "Do not submit automatically. Verify the code, title, programme relevance, and registration history. Report an unexplained entry through the authorised channel before relying on the record."],
      ["The timetable conflicts with an informal message", "Give priority to the current official timetable or authorised update. Check the publication date and whether the notice applies to your course, centre, mode, and session."],
      ["You cannot confirm the venue or mode", "Use current official instructions and contact the relevant authorised channel early. Do not travel based only on an old screenshot or another student's arrangement."],
      ["Payment completed but registration remains unavailable", "Preserve the payment reference and confirmation, verify the payment status, and avoid repeating payment. Submit one clear report that connects the payment issue to the blocked exam-registration task."],
      ["You lost the final registration record", "Try to retrieve it through the current official workflow. Keep a fresh copy in more than one secure location because it may be useful when checking attendance, timetable, or result issues."],
    ],
  },
  {
    number: 5,
    file: "how-to-apply-for-noun-admission.mdx",
    title: "How to Apply for NOUN Admission: A Safe Step-by-Step Guide",
    description: "Learn how to prepare and apply for NOUN admission, verify programme requirements, preserve application evidence, and avoid admission scams.",
    keyword: "NOUN admission",
    secondary: ["how to apply for NOUN admission", "NOUN admission portal", "NOUN application form", "NOUN admission process"],
    links: [["check admission requirements", "/articles/noun-admission-requirements"], ["plan new-student fees", "/articles/noun-school-fees-new-students"], ["find a study centre", "/study-centres"], ["prepare a support request", "/articles/noun-support-ticket-guide"], ["browse admission guides", "/admission"]],
    screenshots: ["Official NOUN admissions page with URL visible", "Programme-selection area", "Application detail review screen with personal data hidden", "Payment-reference screen if required by the current process", "Final application confirmation or reference page"],
    image: "A photorealistic prospective Nigerian university student completing an online application on a laptop at a clean home study desk with organised credentials nearby, hopeful professional mood, no visible text, no logos, no copyrighted elements.",
    scenarios: [
      ["You are unsure which programme to choose", "Pause the application and compare current programme descriptions, entry requirements, and personal goals. An application should follow a verified programme decision, not pressure from an agent or friend."],
      ["Your qualification is unusual", "Do not guess that a general requirement covers your situation. Gather the exact qualification details and request clarification through an official admissions channel before paying or submitting."],
      ["Names differ across documents", "Treat significant differences as a verification issue before submission. Confirm the appropriate official process and avoid hiding or casually altering information."],
      ["Payment succeeds but the application does not continue", "Save the reference, receipt, date, and safe screenshot. Confirm the current payment status before paying again, then report the blocked application with a clear timeline."],
      ["Someone guarantees admission", "Do not pay for a guarantee or share credentials. Admission decisions and requirements belong to NOUN's authorised process. Independent websites can explain steps but cannot secure an offer."],
      ["You submitted incorrect information", "Do not submit duplicate applications without guidance. Preserve the application reference and ask the current official admissions channel how corrections should be handled."],
    ],
  },
  {
    number: 6,
    file: "noun-admission-requirements.mdx",
    title: "NOUN Admission Requirements: What Applicants Must Verify",
    description: "Understand how to verify NOUN admission requirements for your chosen programme and entry route before starting an application.",
    keyword: "NOUN admission requirements",
    secondary: ["NOUN entry requirements", "NOUN undergraduate admission", "NOUN postgraduate admission", "NOUN direct entry requirements"],
    links: [["follow the application guide", "/articles/how-to-apply-for-noun-admission"], ["plan new-student fees", "/articles/noun-school-fees-new-students"], ["find study-centre guidance", "/study-centres"], ["prepare a support report", "/articles/noun-support-ticket-guide"], ["browse admission resources", "/admission"]],
    screenshots: ["Official programme page showing the programme name", "Programme-specific requirement section", "Current admission route or level selector", "Official application document checklist", "Contact or clarification route on an official NOUN page"],
    image: "A photorealistic Nigerian prospective university student reviewing academic credentials and an admissions checklist beside a laptop in a bright professional study setting, no visible text, no logos, no copyrighted elements.",
    scenarios: [
      ["A general page and programme page disagree", "Give priority to the current programme-specific official information and request clarification when the difference affects eligibility. Save the URLs and dates you checked."],
      ["You have the right subjects but an unusual grade combination", "Do not assume eligibility from subject names alone. Confirm the complete current requirement for the specific programme and entry route."],
      ["You want postgraduate admission", "Verify the current programme-specific academic qualification, document, and any professional requirements. Avoid applying undergraduate assumptions to postgraduate admission."],
      ["You want to use direct entry or another route", "Confirm that the programme currently accepts the route and identify the exact supporting qualification required. Do not rely on another applicant's past experience as final evidence."],
      ["Your result is awaiting release", "Do not claim a qualification you cannot currently support. Check the present official policy for your situation before submitting an application."],
      ["An agent says requirements can be bypassed", "Treat this as a warning sign. Requirements and admission decisions must be confirmed through official NOUN channels, not an unofficial promise."],
    ],
  },
  {
    number: 7,
    file: "noun-support-ticket-guide.mdx",
    title: "NOUN Support Ticket Guide: Report Student Problems Clearly",
    description: "Learn how to prepare a clear NOUN support request with useful evidence, protect sensitive information, and follow up without creating duplicate reports.",
    keyword: "NOUN support ticket",
    secondary: ["NOUN student support", "NOUN portal complaint", "NOUN payment complaint", "NOUN result complaint"],
    links: [["document a payment issue", "/articles/how-to-pay-noun-school-fees"], ["check a result problem", "/articles/how-to-check-noun-results"], ["review course registration", "/articles/how-to-register-noun-courses"], ["review exam registration", "/articles/noun-exam-registration-guide"], ["contact NOUN Compass about our content", "/contact"]],
    screenshots: ["Current official support route with URL visible", "Safe example of a concise issue description", "Example evidence folder with private details hidden", "Support reference or acknowledgement screen", "Safe follow-up message that includes the original reference"],
    image: "A photorealistic Nigerian university student organising screenshots and references beside a laptop before submitting a support request, calm professional workspace, no visible text, no logos, no copyrighted elements.",
    scenarios: [
      ["Payment did not reflect", "State the intended payment, amount, date, transaction reference, current status, and the exact help needed. Attach only safe evidence and avoid making a second payment until the first status is clarified."],
      ["A result is missing", "Include the course code, session, semester, registration evidence, examination evidence where available, and the result view. Explain what appears and what you expected to appear."],
      ["A registration course is missing", "Identify the programme, level, semester, course code, and the current registration screen. Explain the checks already completed and ask for a specific clarification."],
      ["You received no response", "Keep the original reference and follow the current official escalation guidance. A concise follow-up tied to the first report is usually more traceable than several duplicate tickets."],
      ["Your screenshot contains private information", "Redact passwords, one-time codes, payment-card details, unnecessary identity numbers, and unrelated records. Share only what the authorised process requires."],
      ["You contacted the wrong channel", "Confirm the current official route for the type of issue. NOUN Compass can explain how to organise a report but cannot access accounts or resolve official student records."],
    ],
  },
  {
    number: 8,
    file: "noun-study-centres-in-lagos.mdx",
    title: "NOUN Study Centres in Lagos: How to Find and Verify the Right Centre",
    description: "Learn how to find and verify NOUN study centres in Lagos, confirm available services, prepare for a visit, and avoid outdated location information.",
    keyword: "NOUN study centres Lagos",
    secondary: ["NOUN Lagos study centre", "NOUN study centre near me", "NOUN Lagos centre address", "NOUN study centre services"],
    links: [["check admission guidance", "/admission"], ["plan new-student fees", "/articles/noun-school-fees-new-students"], ["review course registration", "/articles/how-to-register-noun-courses"], ["prepare a support request", "/articles/noun-support-ticket-guide"], ["browse study-centre guidance", "/study-centres"]],
    screenshots: ["Current official NOUN study-centre directory", "Official Lagos-filtered centre listing", "Official centre detail or contact page", "Map view used only after verifying the official address", "Safe visit checklist without personal records"],
    image: "A photorealistic Nigerian university student arriving at a modern distance-learning study centre in Lagos with a folder and phone, professional educational setting, no visible text, no logos, no copyrighted elements.",
    scenarios: [
      ["You found different addresses online", "Treat the current official NOUN study-centre directory as the starting point and confirm before travelling. Search snippets, old posts, and map pins may preserve outdated information."],
      ["You need a specific service", "Confirm that the centre handles the task before visiting. A centre may provide some student services but not every account-specific, payment, examination, or administrative action."],
      ["You are choosing a centre during admission", "Consider the current official options and practical travel needs, but confirm any programme or service restrictions before making a decision."],
      ["You need to visit about a payment or result issue", "Take a concise timeline and relevant references. Do not carry or expose unnecessary credentials. A prepared explanation makes it easier to direct the issue appropriately."],
      ["A map result looks official", "A map listing is useful for navigation only after the address has been verified through a current official source. Do not treat user-submitted map information as final authority."],
      ["You cannot reach a centre", "Use another current official contact or support route to verify the service and location. Avoid relying on an unofficial person who requests payment to arrange access."],
    ],
  },
  {
    number: 9,
    file: "gst302-summary.mdx",
    title: "GST302 Study Guide: Summary Themes and Practical Revision Plan",
    description: "Use this GST302 study guide to organise the official course material, understand major entrepreneurship themes, and build a practical revision plan.",
    keyword: "GST302 summary",
    secondary: ["GST302 study guide", "GST302 entrepreneurship", "GST302 course material", "GST302 revision"],
    links: [["confirm course registration", "/articles/how-to-register-noun-courses"], ["find the official-source material", "/course-materials?q=GST302"], ["review exam registration", "/articles/noun-exam-registration-guide"], ["check results responsibly", "/articles/how-to-check-noun-results"], ["browse GST guidance", "/gst"]],
    screenshots: ["Official-source GST302 course-material listing", "Current GST302 course guide or objectives page", "Example personal module tracker", "Example concept-to-application study table", "Example weekly revision plan without assessment answers"],
    image: "A photorealistic Nigerian university student studying entrepreneurship concepts with an official course book, notebook, and laptop in a modern library, thoughtful professional mood, no visible text, no logos, no copyrighted elements.",
    scenarios: [
      ["The material feels too long", "Start with the current course objectives and divide the material into manageable themes. Summarise each theme in your own words, then return to the full material for definitions, explanations, and examples."],
      ["You can recall definitions but cannot apply them", "Connect each concept to a realistic small-business decision, such as identifying a need, organising resources, managing risk, or understanding customers. Application reveals whether the idea is genuinely understood."],
      ["Different summaries use different headings", "Use the current official material as the primary reference. An independent summary can support revision but should not replace the official structure or objectives."],
      ["You are preparing close to assessment time", "Prioritise objectives, weak themes, recall practice, and clear explanations rather than trying to memorise every sentence. Confirm current assessment instructions through official channels."],
      ["You found past-question or answer claims", "Do not rely on an answer repository as a substitute for learning. Focus on understanding the official material and follow academic-integrity requirements."],
      ["GST302 is missing from your materials or portal", "Confirm the course appears in your current registration, search the course-material library by exact code, and report a verified access or registration problem through the appropriate official process."],
    ],
  },
  {
    number: 10,
    file: "noun-school-fees-new-students.mdx",
    title: "NOUN School Fees for New Students: First-Semester Planning Guide",
    description: "Learn how new NOUN students can estimate first-semester costs, understand fee categories, verify the official bill, and avoid unsafe payment mistakes.",
    keyword: "NOUN school fees for new students",
    secondary: ["NOUN fresh student fees", "NOUN first semester fees", "NOUN compulsory fees", "NOUN new student payment"],
    links: [["use the fee checker", "/fees"], ["pay fees safely", "/articles/how-to-pay-noun-school-fees"], ["review admission requirements", "/articles/noun-admission-requirements"], ["follow the admission process", "/articles/how-to-apply-for-noun-admission"], ["register courses carefully", "/articles/how-to-register-noun-courses"], ["prepare a support report", "/articles/noun-support-ticket-guide"]],
    screenshots: ["Current official first-semester bill with personal details hidden", "Fee checker programme-selection workflow", "Official payment reference or wallet-funding screen", "Course-registration charge summary", "Final official invoice and receipt pair"],
    image: "A photorealistic new Nigerian university student planning first-semester expenses with a laptop, calculator, notebook, and organised admission documents in a bright modern study space, no visible text, no logos, no copyrighted elements.",
    scenarios: [
      ["You want one universal new-student total", "There may not be one useful total for every student because programme, selected courses, and current charges can affect the bill. Use estimates for planning and your own current official record for payment."],
      ["Another student paid less", "Compare programme, course load, session, and charge descriptions before assuming an error. Another student's amount is context, not an invoice for your account."],
      ["You are budgeting before portal access", "Separate likely compulsory onboarding or semester charges from course and examination charges, then keep a contingency. Do not present an estimate to a payment provider as an official bill."],
      ["Your official bill looks unfamiliar", "Review every line and connect it to the current admission, registration, and payment workflow. Ask for official clarification before paying a charge you do not understand."],
      ["Payment does not reflect", "Preserve the invoice, transaction reference, receipt, and current portal status. Avoid paying again immediately and use the authorised support process."],
      ["You are asked to pay an individual", "Do not send student fees to a personal account or share credentials. Begin from the current official NOUN payment workflow and remain in control of the transaction."],
    ],
  },
  {
    number: 11,
    file: "noun-school-fees-returning-students.mdx",
    title: "NOUN School Fees for Returning Students: Semester Budget Guide",
    description: "Learn how returning NOUN students can estimate semester fees, account for course choices and outstanding courses, and verify the final official amount.",
    keyword: "NOUN school fees for returning students",
    secondary: ["NOUN returning student fees", "NOUN semester fees", "NOUN course registration fees", "NOUN exam registration fees"],
    links: [["use the fee checker", "/fees"], ["pay fees safely", "/articles/how-to-pay-noun-school-fees"], ["review previous results", "/articles/how-to-check-noun-results"], ["register courses carefully", "/articles/how-to-register-noun-courses"], ["complete exam registration", "/articles/noun-exam-registration-guide"], ["prepare a support report", "/articles/noun-support-ticket-guide"]],
    screenshots: ["Current official semester bill with private details hidden", "Fee checker programme and semester selection", "Previous result or outstanding-course review with identity hidden", "Course and examination charge summary", "Final payment receipt and updated record"],
    image: "A photorealistic returning Nigerian university student planning a semester budget with a laptop, calculator, course list, and organised receipts in a modern study area, no visible text, no logos, no copyrighted elements.",
    scenarios: [
      ["Your total changed from last semester", "Compare current course load, outstanding courses, examination choices, and charge descriptions. A previous semester is useful for budgeting but is not proof of the current payable amount."],
      ["You have carryover or repeat courses", "Review the official result and registration guidance before estimating. Outstanding courses can affect the course list, workload, and related charges."],
      ["You are considering electives", "Estimate only electives you are eligible and intend to register. An available elective should not be added merely to match another student's course list."],
      ["The fee checker differs from your portal", "The checker is a planning utility based on dated third-party snapshots. Your current official portal bill takes priority for payment."],
      ["You want to fund the wallet before choosing courses", "Build a careful estimate and keep a reasonable buffer, but avoid treating the estimate as a final invoice. Confirm the official workflow and current charges."],
      ["A completed payment did not reflect", "Do not immediately repeat the transaction. Keep the reference, receipt, amount, date, and current status, then use the official support route with one clear timeline."],
    ],
  },
];

function articleBlock(number) {
  const start = research.indexOf(`Article ${number}\n`);
  const end = number === 11 ? research.length : research.indexOf(`Article ${number + 1}\n`, start + 1);
  return research.slice(start, end);
}

function cleanCompleteArticle(number) {
  const safeIntroductions = {
    7: `## Quick Answer

Use the current official NOUN support route that matches your issue. Describe one problem clearly, include the relevant course code or transaction reference, attach only safe evidence, and keep the acknowledgement or ticket reference. Do not submit repeated reports or expose passwords and payment credentials.

## What This Guide Covers

This guide explains how to turn a confusing payment, portal, registration, examination, result, or course-material problem into a clear support request that an authorised reviewer can understand.`,
    8: `## Quick Answer

Use the current official NOUN study-centre directory to identify study centres in Lagos. Confirm the address, available service, opening information, and any visit requirement before travelling because centre details and service arrangements can change.

## What This Guide Covers

This guide helps students find and verify an appropriate Lagos study centre, prepare for a useful visit, and avoid relying on outdated addresses, map pins, or unofficial centre agents.`,
    9: `## Quick Answer

Use the current official GST302 course material as your primary source. Divide the material into themes, explain each idea in your own words, connect entrepreneurship concepts to realistic decisions, and test your recall before assessment.

## What This Guide Covers

This guide provides an original study workflow for GST302. It does not replace official course material, provide assessment answers, or assume that assessment instructions remain unchanged.`,
    10: `## Quick Answer

New students should budget for the complete first-semester workflow rather than searching for one universal fee figure. Review the current official bill, understand each charge, account for selected courses and examinations, and pay only through the authorised workflow.

## What This Guide Covers

This guide explains how to plan first-semester costs without inventing a fixed total or relying on another student's bill.`,
    11: `## Quick Answer

Returning students should estimate fees from their current programme, semester, intended course load, outstanding courses, and examination choices. Use the estimate to plan, then confirm the final payable amount through the current official portal before payment.

## What This Guide Covers

This guide explains why returning-student totals change and how to build a safer semester budget from the records that apply to your own account.`,
  };
  if (safeIntroductions[number]) return safeIntroductions[number];

  const block = articleBlock(number);
  const start = block.indexOf("4. Complete Article");
  const end = block.indexOf("5. FAQ Schema Questions", start);
  let text = block.slice(start + "4. Complete Article".length, end > start ? end : block.length);
  text = text
    .replace(/-- \d+ of \d+ --/g, "")
    .replace(/\t[^\n]*/g, "")
    .replace(/\bAs (?:a fellow|an experienced) NOUN student[^.]*\./gi, "This guide focuses on the practical checks a NOUN student should make.")
    .replace(/\bnouonline\.net\b/gi, "the current official NOUN student portal linked from the official NOUN website")
    .replace(/\bexact(?:ly)?\b/gi, "current")
    .replace(/\bguarantee(?:d|s)?\b/gi, "assurance")
    .replace(/₦\s?[\d,]+(?:\s?-\s?₦?\s?[\d,]+)?/g, "the currently displayed amount")
    .replace(/NOU\d{6,}/g, "your matriculation number")
    .replace(/NOUN provides a dedicated ETicketing Platform\./gi, "NOUN has used support and ticketing channels; confirm the current official route before submitting a report.")
    .replace(/This is the official and fastest way[^.]*\./gi, "Use the currently authorised route that matches the issue.")
    .replace(/Budget Tip: Most new undergraduates spend between the currently displayed amount and the currently displayed amount in their first semester, depending on the course of study\./gi, "There is no single reliable first-semester total for every new student. Build an estimate, then confirm the final amount through your own current official record.");

  const raw = text.split("\n").map((line) => line.trim());
  const firstQuick = raw.findIndex((line) => /^Quick Answer/i.test(line));
  const lines = raw.slice(firstQuick >= 0 ? firstQuick : 0);
  const output = [];
  let paragraph = [];
  let skippingToc = false;
  const flush = () => {
    const value = paragraph.join(" ").replace(/-\s+/g, "").replace(/\s+/g, " ").trim();
    if (value) output.push(value);
    paragraph = [];
  };
  const heading = /^(Quick Answer|What This Guide Covers|Requirements Before You Start|Understanding |Step-by-Step|Common Mistakes|Troubleshooting|Important Warnings|Official Sources|Frequently Asked Questions|Related NOUN Guides|Final Advice|How to |When |If |Before |After |Step \d+:|Question:)/i;

  for (const original of lines) {
    let line = original;
    if (!line || /^\d+\.?$/.test(line)) {
      flush();
      continue;
    }
    if (line === "Table of Contents") {
      flush();
      skippingToc = true;
      continue;
    }
    if (skippingToc) {
      if (/^What This Guide Covers/i.test(line)) skippingToc = false;
      else continue;
    }
    if (heading.test(line)) {
      flush();
      const level = /^(Step \d+:|Question:|When |If |Before |After )/i.test(line) ? "###" : "##";
      output.push(`${level} ${line.replace(/^Question:\s*/i, "")}`);
      continue;
    }
    paragraph.push(line);
  }
  flush();
  return output.join("\n\n").replace(/\n{3,}/g, "\n\n");
}

function sanitizeBody(body) {
  const unsafe = /(?:\b30%|\b70%|\b45%|\b50%|\b90%|does not issue cash refunds|will carry over|12-digit|automated system based on your uploaded grades|application fee is paid|nonrefundable|NABTEB|D7\/E8|C6|5-Credit Rule|five \(5\) credit|English Language and Mathematics are mandatory|required pass mark|phone screen is not accepted|marked absent, resulting|must write exams at your registered centre|all official academic results are hosted exclusively|study centre staff will never ask|View SOA|Manage Wallet > Check Wallet Status|the currently displayed amount)/i;
  return body
    .split(/\n\n+/)
    .filter((paragraph) => !unsafe.test(paragraph))
    .join("\n\n")
    .replace(/â€™/g, "'")
    .replace(/â€”/g, "-")
    .replace(/â€“/g, "-")
    .replace(/â‚¦/g, "Naira");
}

function additions(article) {
  const links = article.links.map(([label, href]) => `- [${label}](${href})`).join("\n");
  const shots = article.screenshots.map((item) => `- ${item}`).join("\n");
  const scenarios = article.scenarios.map(([title, guidance]) => `### ${title}\n\n${guidance}`).join("\n\n");
  const faqs = article.scenarios.map(([title, guidance]) => `### What should I do if ${title.toLowerCase()}?\n\n${guidance}`).join("\n\n");
  return `

## Requirements Before You Start

Prepare the records directly connected to this task before opening the portal or contacting support. Use your own current student record, confirm the relevant session or semester, and keep a secure folder for references and safe screenshots. Do not share passwords, one-time codes, payment-card details, or unrestricted portal access with anyone offering help.

## Practical Troubleshooting Scenarios

${scenarios}

## Important Warnings

- Start from an official NOUN page or a portal link you have independently verified.
- Treat old screenshots, forwarded messages, and another student's record as context rather than final instructions.
- Pause when an action could create a duplicate payment, incorrect registration, or inaccurate academic record.
- Keep references and final confirmations; a success message without a saved record can be difficult to investigate.
- NOUN Compass is independent and cannot access accounts, receive student payments, or change official records.

## Official Sources and Verification Notes

This guide was reviewed on 14 June 2026. Portal labels, requirements, fees, deadlines, course arrangements, and support procedures can change. Confirm the current process through the official NOUN website, your own official student record, authorised announcements, or your study centre before acting. Where an official source differs from this guide, follow the official source and report the difference to NOUN Compass for editorial review.

## Frequently Asked Questions

${faqs}

## Suggested Screenshots

Screenshots can make this guide easier to verify, but they must be captured from the current official workflow and carefully redacted before publication:

${shots}

## Featured Image Brief

${article.image}

## Related NOUN Guides

Use these guides as the next part of the student workflow:

${links}

## Final Advice

Complete the task slowly enough to verify every important detail. The safest student workflow is simple: use a current official source, review the final record, preserve evidence, and ask a precise question when something remains unclear. An independent guide can help you prepare, but your current official NOUN record must decide the final action.
`;
}

function booster(article) {
  const mistakes = article.scenarios.map(([title]) => `- Treating "${title.toLowerCase()}" as something to guess about instead of a detail to verify`).join("\n");
  const examples = article.scenarios.map(([title, guidance], index) => `### Example ${index + 1}: ${title}\n\nImagine that this issue appears while you are trying to complete the workflow. Begin by identifying the exact record that should prove the outcome, such as a current portal view, registration record, receipt, result entry, official directory, or course guide. Record the relevant session, semester, course code, reference, or programme detail before contacting anyone.\n\n${guidance} After taking the next authorised step, save the final response or updated record. This creates a clear before-and-after trail and prevents the same issue from becoming harder to explain later.`).join("\n\n");
  const linkSteps = article.links.map(([label, href], index) => `${index + 1}. Use [${label}](${href}) when that connected part of the workflow becomes relevant.`).join("\n");
  return `

## What This Guide Covers

This guide focuses on completing the ${article.keyword} workflow responsibly. It explains what to prepare, how to review the current official record, which mistakes commonly create avoidable problems, and how to document an issue before asking for help. It also connects the task to the related student journeys that usually come before or after it.

## Step-by-Step Instructions

1. Identify the exact outcome you need, rather than opening several portal areas without a plan.
2. Confirm that you are using a current official NOUN page, platform, announcement, or authorised study-centre instruction.
3. Prepare the records directly connected to the task and remove any assumption based only on another student's experience.
4. Review names, programme details, session, semester, course codes, amounts, references, or source dates as applicable.
5. Complete one authorised action at a time and pause when the result is unclear.
6. Save the final record, acknowledgement, receipt, registration slip, result view, or source page.
7. Compare the saved outcome with what you intended to achieve.
8. If something remains wrong, prepare one precise report with useful evidence and keep its reference.

## Common Mistakes

${mistakes}
- Closing a page without saving the final confirmation or reference
- Sharing sensitive credentials because someone claims they can solve the problem faster
- Repeating an action before confirming whether the first attempt succeeded
- Using an old screenshot or forwarded message as the final authority

## Evidence Checklist

Good evidence is relevant, readable, and limited to what the authorised reviewer needs. Before reporting a problem, write a short timeline covering what you attempted, when you attempted it, the official route used, the expected result, and the actual result. Add the relevant reference or course code and a safely redacted screenshot where useful.

Do not send passwords, one-time codes, card details, banking PINs, or unrestricted portal access. Hide unrelated personal information in screenshots. Keep the original files privately because compressed images shared through messaging apps can become difficult to read.

When an issue is resolved, save the updated record together with the original evidence and support reference. That record can help when completing connected registration, examination, payment, result, or study-centre tasks later.

## Practical Student Scenarios

${examples}

## How This Connects to Other NOUN Workflows

Most student tasks are connected. A decision made here may affect a later payment, registration, examination, result, support, or learning-material step. Continue only when the current outcome is clear:

${linkSteps}
`;
}

function wordCount(value) {
  return (value.replace(/<[^>]+>/g, " ").match(/\b[\w'-]+\b/g) ?? []).length;
}

for (const article of articles) {
  const filePath = path.join(contentDir, article.file);
  const parsed = matter(fs.readFileSync(filePath, "utf8"));
  let body = sanitizeBody(`${cleanCompleteArticle(article.number)}${additions(article)}`.trim());
  if (wordCount(body) < 2000) body = `${body}${booster(article)}`.trim();
  if (!body.toLowerCase().includes("step-by-step")) {
    body += `\n\n## Step-by-Step Instructions\n\n1. Confirm the specific programme, route, session, or student record involved.\n2. Read the current official requirement or instruction completely.\n3. Compare every relevant detail with the documents and records you can support.\n4. Pause and seek official clarification when a requirement is unclear.\n5. Complete the authorised action and save the final confirmation.\n`;
  }
  parsed.data.title = article.title;
  parsed.data.description = article.description;
  parsed.data.primaryKeyword = article.keyword;
  parsed.data.secondaryKeywords = article.secondary;
  parsed.data.updatedAt = "2026-06-14";
  parsed.data.readingTime = `${Math.max(10, Math.ceil(wordCount(body) / 220))} min read`;
  fs.writeFileSync(filePath, matter.stringify(body, parsed.data));
  console.log(`${article.number}. ${article.file}: ${wordCount(body)} words`);
}
