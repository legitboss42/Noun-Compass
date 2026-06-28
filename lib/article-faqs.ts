export type ArticleFaq = { question: string; answer: string };

const sharedAnswer = "NOUN Compass is independent. Confirm final requirements, dates, fees, and portal instructions through current official NOUN channels.";

const articleFaqs: Record<string, ArticleFaq[]> = {
  "how-to-apply-for-noun-admission": [
    { question: "Where should I begin a NOUN admission application?", answer: "Begin with the current admissions information on the official NOUN website, confirm your intended programme, and follow only the application channel linked there." },
    { question: "Can someone guarantee my NOUN admission?", answer: "No independent agent can guarantee admission. Avoid anyone requesting payment to bypass requirements or promising a guaranteed offer." },
    { question: "What should I save after applying?", answer: "Save your application reference, payment evidence, submitted details, and any confirmation page so you can investigate a problem without paying twice." },
  ],
  "noun-admission-requirements": [
    { question: "Are admission requirements the same for every NOUN programme?", answer: "No. Requirements can differ by programme and entry route. Confirm the current programme-specific requirements before applying." },
    { question: "Can I apply while waiting for a required result?", answer: "Do not assume this is accepted. Check the current official requirement for your programme and contact official admissions support when your result status is unclear." },
    { question: "What if my name differs across my credentials?", answer: "Resolve significant name differences through the appropriate official process before relying on the documents for admission." },
  ],
  "noun-school-fees-new-students": [
    { question: "Why are new-student fees higher?", answer: "New students may see one-time onboarding and verification charges in addition to semester, course, and examination charges." },
    { question: "Should I pay from a screenshot of another student's bill?", answer: "No. Use your own current portal bill and verify every payment description before paying." },
    { question: "What if a completed payment does not reflect?", answer: "Keep the receipt and transaction reference, avoid paying again immediately, and follow the official support process." },
  ],
  "noun-school-fees-returning-students": [
    { question: "Do returning students pay the same amount every semester?", answer: "Not necessarily. Course load, examination registration, programme requirements, and current charges can change the total." },
    { question: "Should I include elective courses in my estimate?", answer: "Include only electives you are permitted and intend to register, then confirm the final course list before payment." },
    { question: "Which amount should I trust before paying?", answer: "Treat the current amount generated for your own student record on the official portal as the final working amount." },
  ],
  "how-to-pay-noun-school-fees": [
    { question: "How can I avoid paying NOUN fees twice?", answer: "Confirm the first transaction status, retain its reference, and contact official support before repeating a payment that has not reflected." },
    { question: "Can NOUN Compass receive or process my payment?", answer: "No. NOUN Compass never receives student fees or asks for portal credentials." },
    { question: "What payment evidence should I keep?", answer: "Keep the portal invoice, transaction reference, receipt, date, amount, and a record of the charge description." },
  ],
  "how-to-register-noun-courses": [
    { question: "Should I register every course shown on a programme list?", answer: "No. Confirm your current level, semester, prerequisites, outstanding courses, and programme instructions before submitting." },
    { question: "What should I do before final submission?", answer: "Review every course code, title, unit, semester, and status, then save the final registration slip." },
    { question: "What if a required course is missing?", answer: "Do not substitute a different course without guidance. Document the issue and contact your study centre or official support." },
  ],
  "how-to-check-noun-results": [
    { question: "What should I do if a result is missing?", answer: "Confirm the course was correctly registered and assessed, collect your records, and report the issue through the appropriate official channel." },
    { question: "Can NOUN Compass change a result?", answer: "No. Only authorized NOUN processes can review or change an academic record." },
    { question: "Why should I save result records?", answer: "Periodic records help you identify changes, plan outstanding courses, and provide context when reporting a discrepancy." },
  ],
  "noun-study-centres-in-lagos": [
    { question: "Can I complete every student task at any Lagos study centre?", answer: "Do not assume so. Confirm the services, opening times, and instructions of the relevant centre before travelling." },
    { question: "How should I confirm a study-centre address?", answer: "Use current official NOUN channels and call ahead where possible because locations and service arrangements can change." },
    { question: "What should I take to a study centre?", answer: "Take identification, relevant references or receipts, and a concise record of the issue you need resolved." },
  ],
  "full-list-of-verified-noun-study-centres-in-nigeria": [
    { question: "Does this page list every NOUN study-centre row found online?", answer: "No. It lists only the centres that cleared the verified threshold in the audited research pass and flags partial or held-back locations separately." },
    { question: "Should I travel to a partially verified centre?", answer: "Not until you have confirmed the current address, purpose, and official support route again through stronger NOUN-owned signals." },
    { question: "What should I do after choosing a centre?", answer: "Move into the next student workflow that matches your task, such as admission, registration, TMA, exams, results, or support." },
  ],
  "noun-study-centres-in-abuja": [
    { question: "Which Abuja centre was the strongest verified match?", answer: "Abuja Model Study Centre was the strongest verified Abuja centre in the Phase 7.3 pass." },
    { question: "Is Wuse II Study Centre Abuja fully confirmed?", answer: "No. It was treated as partially verified and should be rechecked before travel." },
    { question: "Should I treat special Abuja centre rows like general student centres?", answer: "No. Special and correctional rows need extra caution and should not be assumed to work like ordinary general-centre listings." },
  ],
  "noun-study-centres-in-kano": [
    { question: "Which Kano centre was fully verified?", answer: "Kano Study Centre was the clearest fully verified Kano centre in the current audit." },
    { question: "Why are there so many partial Kano rows?", answer: "Kano had the biggest cluster in the inventory, but many surrounding rows did not have strong enough direct official support to be treated as fully settled public facts." },
    { question: "What should I do if my nearest Kano row is only partial?", answer: "Treat it as a lead and verify it again before travelling rather than assuming it is false or fully confirmed." },
  ],
  "noun-study-centres-in-ogun": [
    { question: "Which Ogun centres were fully verified?", answer: "Abeokuta Study Centre Ogun and Awa-Ijebu Community Study Centre Ogun were the fully verified Ogun centres in this pass." },
    { question: "Is Ilaro Community Study Centre Ogun confirmed?", answer: "It was partially verified, so students should recheck it carefully before travelling." },
    { question: "Should I rely on the Abeokuta correctional-centre row?", answer: "No. It remained unverified and should not be treated as settled centre-detail guidance." },
  ],
  "noun-study-centres-in-enugu": [
    { question: "Which Enugu centres were verified?", answer: "Enugu Study Centre and Awgu Community Study Centre were both treated as verified in the current audit." },
    { question: "Was the Enugu correctional-centre row confirmed?", answer: "No. That row remained unverified and is not treated as confirmed fact." },
    { question: "Should I choose Enugu city or Awgu first?", answer: "Choose the centre that fits your travel route and task, then verify the current detail again before you move." },
  ],
  "noun-study-centres-in-benin": [
    { question: "Which Edo centre was verified?", answer: "Benin Study Centre was the strongest verified Edo-centre result in the Phase 7.3 pass." },
    { question: "Is Uromi Community Study Centre confirmed?", answer: "No. It remained unverified in the current research set." },
    { question: "What should I do after choosing Benin Study Centre?", answer: "Use the task-specific workflow for your next step, such as admission, registration, results, or support, instead of assuming every issue starts with a centre visit." },
  ],
  "how-to-verify-a-noun-study-centre-before-you-travel": [
    { question: "What is the first thing I should check before a centre trip?", answer: "Check whether the centre was fully verified, partially verified, or unverified in the audited research set." },
    { question: "Does a verified centre mean every task should start there?", answer: "No. A verified centre name still needs to be matched to the actual student workflow and task you are trying to solve." },
    { question: "What if the centre is only partially verified?", answer: "Treat it as a lead that requires another round of checking before you travel." },
  ],
  "special-and-correctional-noun-study-centres-guide": [
    { question: "Were any special or correctional centre rows fully promoted as settled public facts?", answer: "No. The article intentionally separates partial rows from unverified rows and avoids overstating either category." },
    { question: "Which special or correctional rows had partial support?", answer: "The partial set included Kuje Correctional Service Study Centre and three Abuja-linked special-centre rows." },
    { question: "Should general students start with the special-centre guide?", answer: "Usually no. General students should begin with the standard verified-centre pages and only use the special-centre guide when that category is directly relevant." },
  ],
  "gst302-summary": [
    { question: "Is this GST302 guide a replacement for official course material?", answer: "No. It is an original study-planning guide. Use the current official material as your primary learning source." },
    { question: "How should I revise GST302?", answer: "Study the official objectives, explain concepts in your own words, connect them to practical examples, and test recall regularly." },
    { question: "Does this page provide past questions?", answer: "No. NOUN Compass focuses on original learning guidance rather than past-question repositories." },
  ],
  "noun-support-ticket-guide": [
    { question: "What makes a useful support ticket?", answer: "A useful ticket states the task, exact problem, date, reference, evidence, and the specific help requested without exposing passwords." },
    { question: "Should I submit the same ticket repeatedly?", answer: "Usually no. Keep the first reference, allow reasonable response time, and follow up with the reference unless official instructions say otherwise." },
    { question: "What sensitive information should I avoid sending?", answer: "Never send passwords, full payment-card details, one-time codes, or unnecessary identity documents." },
  ],
  "noun-exam-registration-guide": [
    { question: "Is course registration the same as examination registration?", answer: "Do not assume so. Confirm that each intended examination is registered through the current official workflow." },
    { question: "What should I check before submitting exam registration?", answer: "Check course codes, eligibility, venue or mode instructions, fees, and the final registration record." },
    { question: "What if an examination course is missing?", answer: "Document the issue and contact official support before the relevant deadline rather than waiting until the examination date." },
  ],
  "noun-elearn-and-tma-guide": [
    { question: "How can I find my TMA on NOUN eLearn?", answer: "In the observed eLearn session, TMAs were reachable from the dashboard's Recently accessed items area, from the course page's TMA section, and from the course index inside a TMA activity page." },
    { question: "How many TMAs did the observed course have?", answer: "The observed Numerical Analysis course showed three TMAs: TMA1, TMA2, and TMA3. Confirm your own course page before assuming the same structure applies everywhere." },
    { question: "Where do TMA scores appear?", answer: "The observed eLearn workflow showed scores most clearly in the course-specific grade report, with overall course totals also visible in the broader Grades overview." },
  ],
  "how-to-find-tma-on-noun-elearn": [
    { question: "Where should I look first for a TMA?", answer: "Start with the dashboard's Recently accessed items if you have opened the course before, then check the course page's dedicated TMA section." },
    { question: "What if My courses does not help?", answer: "In the observed session, My courses showed controls but not a clearly populated course list, so the dashboard and direct course page were more reliable starting points." },
    { question: "Can I find another TMA from an existing TMA page?", answer: "Yes. The observed TMA page included a course index with a TMA subsection linking to TMA1, TMA2, and TMA3." },
  ],
  "how-to-submit-tma-on-noun-elearn": [
    { question: "What must I check before starting a TMA?", answer: "Check the TMA page for the Opened date, Closed date, and Attempts allowed value before using the Attempt TMA Now path." },
    { question: "How many attempts were visible in the observed workflow?", answer: "The observed TMAs displayed Attempts allowed: 1. Confirm your own activity page before acting." },
    { question: "What happens after submission?", answer: "The observed finished-state page showed Status Finished, Started, Completed, Duration, Review not permitted, and No more attempts are allowed." },
  ],
  "why-your-noun-tma-score-is-not-showing": [
    { question: "Where should I check for a TMA score first?", answer: "Check the course-specific grade report first because that was the clearest score surface in the observed eLearn session." },
    { question: "Should I rely only on the TMA activity page for marks?", answer: "No. The TMA page showed attempt status, but the detailed score breakdown was easier to confirm in Grades." },
    { question: "What should I save before asking for help?", answer: "Save the course code, TMA name, session details, safe screenshots of the TMA state and grade area, and any related registration or support record." },
  ],
  "noun-tma-deadline-guide": [
    { question: "How are TMA deadlines shown on eLearn?", answer: "The observed TMA activity pages displayed both Opened and Closed timestamps directly in the activity header." },
    { question: "Should I copy another student's deadline?", answer: "No. Use the deadline shown on your own course activity page because course timing can differ." },
    { question: "What if a TMA already looks closed?", answer: "Preserve the page state, confirm you are on the correct TMA and course, and use the official support route if the status conflicts with an authorised announcement." },
  ],
  "common-noun-tma-mistakes": [
    { question: "What is the easiest way to miss a TMA?", answer: "One common mistake is stopping at the top of the course page and never scrolling or opening the TMA section lower down the course structure." },
    { question: "Why do students misread their TMA status?", answer: "The observed page still displayed the phrase Attempt TMA Now while the attempt summary below showed Finished, which can mislead students who read only the top of the page." },
    { question: "What is the safest response when the TMA workflow looks wrong?", answer: "Stop, capture safe evidence, verify the correct course and grades route, and escalate through official support rather than guessing or repeating actions." },
  ],
  "is-noun-eligible-for-nelfund": [
    { question: "Is NOUN participating in NELFUND?", answer: "Yes. The Phase 7.4 research verified that NOUN promotes NELFUND on its homepage and announced approved disbursement to 90 NOUN students on 3 March 2026." },
    { question: "Does that mean every NOUN student category is definitely eligible?", answer: "No. Postgraduate eligibility, returning-student eligibility, and new-student timing were not fully verified in the research set." },
    { question: "What is the safest next step after confirming participation?", answer: "Review the verified application and requirement guides, compare them with your own current NOUN record, and avoid treating unverified category claims as settled facts." },
  ],
  "how-noun-students-apply-for-nelfund": [
    { question: "Where does the verified NELFUND application process begin?", answer: "It begins on the official NELFUND portal and then moves through educational verification, JAMB verification, and email-verification continuation." },
    { question: "What details were clearly verified in the public flow?", answer: "The Phase 7.4 research confirmed institution selection, matric number, JAMB registration number, and date of birth." },
    { question: "Should I trust articles that describe later hidden steps as certain facts?", answer: "No. Later-stage NOUN-specific steps that were not verified in the research set should stay qualified or unverified." },
  ],
  "nelfund-requirements-for-noun-students": [
    { question: "What NELFUND requirements were directly verified for NOUN students?", answer: "The verified public flow showed institution selection, matric number, JAMB registration number, and date of birth." },
    { question: "Was a full later-stage document list verified?", answer: "No. The Phase 7.4 research did not verify a complete later-stage checklist for every NOUN applicant." },
    { question: "Is JAMB regularization already a fully settled requirement for all NOUN students?", answer: "No. JAMB-linked verification is verified, but the exact universal regularization rule was not fully confirmed." },
  ],
  "why-nelfund-requests-a-jamb-registration-number": [
    { question: "Does NELFUND really ask for a JAMB registration number?", answer: "Yes. The current public NELFUND flow verified a JAMB-based stage that asks for a JAMB registration number and date of birth." },
    { question: "Does the JAMB step prove every NOUN student must complete the same regularization path?", answer: "No. The step proves JAMB-linked verification exists, but the exact universal regularization rule for all NOUN students was not fully verified." },
    { question: "Why should students be careful with social-media certainty on this point?", answer: "Because the JAMB step is verified while several broader NOUN-specific conclusions remain only partial or unverified." },
  ],
  "common-nelfund-problems-noun-students-face": [
    { question: "What are the most evidence-based NELFUND problems for NOUN students?", answer: "The strongest ones are eligibility confusion, institution or matric-number mismatch, missing-information warnings, JAMB verification confusion, and uncertainty around approval or e-wallet reflection." },
    { question: "What does missing information mean?", answer: "It is a real visible state in the public NELFUND flow showing that the system could not confirm something cleanly enough to continue, but the research did not verify one universal cause for every case." },
    { question: "Should I keep retrying when the process looks wrong?", answer: "Usually no. Save the exact wording, compare your own records carefully, and escalate responsibly instead of repeating the same step blindly." },
  ],
  "nelfund-application-status-meanings-explained": [
    { question: "Which NELFUND statuses or stages were actually verified?", answer: "The Phase 7.4 research verified educational verification, a missing-information state, JAMB verification, JAMB profile review, and email-verification continuation." },
    { question: "Did the research confirm a full later-stage approval-status glossary?", answer: "No. It did not verify a complete internal dictionary for every later approval, rejection, or disbursement label." },
    { question: "What should I do when I see missing information?", answer: "Treat it as a real warning state, review your own records carefully, and avoid turning an unclear mismatch into repeated blind attempts." },
  ],
  "nelfund-approval-and-disbursement-guide-for-noun-students": [
    { question: "Has NOUN officially confirmed NELFUND disbursement for students?", answer: "Yes. NOUN announced on 3 March 2026 that approved disbursement for 90 NOUN students had been cleared to their e-wallets." },
    { question: "Does that mean my own approval is guaranteed?", answer: "No. The announcement proves successful NOUN cases exist, but it does not guarantee approval, funding, or timing for every individual student." },
    { question: "What NOUN-specific finance detail matters most here?", answer: "The strongest verified detail is that the official NOUN announcement linked approved disbursement to students' e-wallets." },
  ],
  "nelfund-frequently-asked-questions-for-noun-students": [
    { question: "What is the strongest verified NELFUND fact for NOUN students?", answer: "The strongest verified facts are that NOUN participates in NELFUND, publicly promotes it, and announced approved disbursement to 90 NOUN students on 3 March 2026." },
    { question: "What requirement inputs were clearly verified in the public flow?", answer: "Institution selection, matric number, JAMB registration number, and date of birth were clearly verified." },
    { question: "Which popular NELFUND questions are still not fully settled?", answer: "Postgraduate eligibility, returning-student eligibility, new-student timing, exact universal JAMB regularization rules, and guaranteed timelines remain unverified or only partially verified." },
  ],
};

export function getArticleFaqs(slug: string): ArticleFaq[] {
  return articleFaqs[slug] ?? [
    { question: "Is this an official NOUN guide?", answer: sharedAnswer },
    { question: "What if the official portal shows something different?", answer: "Follow the current official portal information and contact your study centre or official support when clarification is needed." },
    { question: "How often is this guide reviewed?", answer: "The displayed last-checked date shows the most recent editorial review, but official processes may change afterward." },
  ];
}
