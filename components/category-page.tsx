import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { Breadcrumbs } from "@/components/article-elements";
import { TrendingSidebar } from "@/components/home-sections";
import { SocialLinks } from "@/components/social-links";
import { SectionScrollButton } from "@/components/section-scroll-button";
import { categories, type Category } from "@/data/site";
import type { ArticleMeta } from "@/lib/articles";

const searchFallbackLinks = [
  { label: "Admissions", href: "/admission" },
  { label: "Fees", href: "/fees" },
  { label: "Portal & Registration", href: "/portal" },
  { label: "Results", href: "/results" },
  { label: "Study Centres", href: "/study-centres" },
  { label: "NELFUND", href: "/articles/is-noun-eligible-for-nelfund" },
];

type CategoryExperience = {
  primaryLabel: string;
  secondary: { label: string; href: string };
  tasks: Array<{ number: string; title: string; description: string; href: string }>;
  nextSteps: Array<{ number: string; title: string; description: string; href: string }>;
  guidance: {
    eyebrow: string;
    title: string;
    intro: string;
    checks: Array<{ number: string; title: string; description: string }>;
    notice: string;
  };
  maxArticles: number;
};

const categoryExperiences: Partial<Record<Category["slug"], CategoryExperience>> = {
  results: {
    primaryLabel: "Choose a results task",
    secondary: { label: "Open result checker", href: "/tools/result-checker" },
    maxArticles: 6,
    tasks: [
      { number: "01", title: "Check My Progress", description: "Start with the quickest view of released grades and outstanding courses.", href: "/articles/how-to-find-noun-results-on-my-progress" },
      { number: "02", title: "Open result statement", description: "Use the deeper statement when you need credits, CGPA, and outstanding-course details.", href: "/articles/how-to-open-your-noun-result-statement-from-the-support-portal" },
      { number: "03", title: "Understand CGPA", description: "Read grade points, class bands, earned credits, and outstanding credits carefully.", href: "/articles/how-to-read-noun-cgpa-class-of-degree-and-outstanding-credit" },
      { number: "04", title: "Find missing grades", description: "Check likely causes before opening a result support request.", href: "/articles/why-your-noun-result-grade-is-not-showing" },
      { number: "05", title: "Report a result problem", description: "Prepare the evidence and references needed for e-ticketing or support.", href: "/articles/how-to-use-noun-support-or-e-ticketing-for-result-problems" },
    ],
    nextSteps: [
      { number: "01", title: "Choose the right result view", description: "Use My Progress for a quick check and the result statement for the fuller academic record.", href: "/articles/how-to-check-noun-results" },
      { number: "02", title: "Compare course codes", description: "Match every grade and outstanding course with your registration history.", href: "/articles/how-to-check-outstanding-courses-on-noun-result-statement" },
      { number: "03", title: "Estimate carefully", description: "Use the calculator for planning, then compare it with your official academic record.", href: "/tools/cgpa-calculator" },
      { number: "04", title: "Escalate with evidence", description: "Open a support request when the official record remains incomplete or inconsistent.", href: "/articles/how-to-use-noun-support-or-e-ticketing-for-result-problems" },
    ],
    guidance: {
      eyebrow: "Read academic records carefully",
      title: "Turn a result into the right next step",
      intro: "A result page is useful only when you know which record you are viewing, what has been released, and what still needs official clarification.",
      checks: [
        { number: "01", title: "Match the course code", description: "Confirm the code, title, semester, and examination type before interpreting any grade." },
        { number: "02", title: "Separate missing from failed", description: "A blank, pending, withheld, or absent entry should not automatically be treated as a failed course." },
        { number: "03", title: "Check credits and CGPA together", description: "Review earned credits, outstanding credits, grade points, and the full statement before planning graduation." },
        { number: "04", title: "Keep result evidence private", description: "Share only the minimum non-sensitive information required when asking official support for help." },
      ],
      notice: "NounCompass can explain result records and estimate CGPA, but it cannot retrieve, change, or certify an official NOUN result.",
    },
  },
  examinations: {
    primaryLabel: "Choose an exam task",
    secondary: { label: "Open exam preparation", href: "/exam-prep" },
    maxArticles: 6,
    tasks: [
      { number: "01", title: "Register for examinations", description: "Verify examinable courses, registration status, and the evidence you should save.", href: "/articles/noun-exam-registration-guide" },
      { number: "02", title: "Compare e-exam and POP", description: "Understand the delivery format and what changes in preparation.", href: "/articles/noun-e-exam-vs-pop" },
      { number: "03", title: "Print registration slips", description: "Keep course and examination registration records before deadlines.", href: "/articles/noun-registration-slip-printout" },
      { number: "04", title: "Prepare by course", description: "Review supported course topics and original warm-up prompts.", href: "/exam-prep" },
    ],
    nextSteps: [
      { number: "01", title: "Confirm registered courses", description: "Compare the examination list with your current course registration.", href: "/articles/noun-exam-registration-guide" },
      { number: "02", title: "Check the exam format", description: "Know whether each course uses e-exam or pen-on-paper assessment.", href: "/articles/noun-e-exam-vs-pop" },
      { number: "03", title: "Save registration evidence", description: "Keep final slips and references before relying on a timetable or venue.", href: "/articles/noun-registration-slip-printout" },
      { number: "04", title: "Build a revision plan", description: "Use your real registered courses and remaining study time.", href: "/tools/study-planner" },
    ],
    guidance: {
      eyebrow: "Prepare without shortcuts",
      title: "Build exam confidence from verified records",
      intro: "Good preparation begins with the right registered courses, the correct examination format, and a realistic revision plan.",
      checks: [
        { number: "01", title: "Verify registration", description: "Confirm each examinable course against your current course and exam registration slips." },
        { number: "02", title: "Confirm format and venue", description: "Do not assume another student's e-exam, POP, date, or centre applies to you." },
        { number: "03", title: "Study from course objectives", description: "Use official materials and reviewed original practice rather than leaked or active assessment content." },
        { number: "04", title: "Keep final evidence", description: "Save slips, timetable details, venue information, and support references before travelling." },
      ],
      notice: "NounCompass supports honest preparation. It does not provide leaked examinations, active TMA answers, or guaranteed results.",
    },
  },
  "study-centres": {
    primaryLabel: "Find a study-centre guide",
    secondary: { label: "Open verified centre list", href: "/articles/full-list-of-verified-noun-study-centres-in-nigeria" },
    maxArticles: 6,
    tasks: [
      { number: "01", title: "Browse the verified list", description: "Start with the nationwide directory and its verification notes.", href: "/articles/full-list-of-verified-noun-study-centres-in-nigeria" },
      { number: "02", title: "Verify before travelling", description: "Confirm location, contact details, service availability, and opening information.", href: "/articles/how-to-verify-a-noun-study-centre-before-you-travel" },
      { number: "03", title: "Check Lagos centres", description: "Review verified and partially verified listings across Lagos.", href: "/articles/noun-study-centres-in-lagos" },
      { number: "04", title: "Check Abuja centres", description: "Review confirmed centre information in the FCT.", href: "/articles/noun-study-centres-in-abuja" },
      { number: "05", title: "Special centre guidance", description: "Understand what could and could not be verified for special and correctional centres.", href: "/articles/special-and-correctional-noun-study-centres-guide" },
    ],
    nextSteps: [
      { number: "01", title: "Identify the centre", description: "Match the official name, location, and centre type before making plans.", href: "/articles/full-list-of-verified-noun-study-centres-in-nigeria" },
      { number: "02", title: "Confirm the service", description: "Check whether the centre handles your specific registration, examination, or support need.", href: "/articles/how-to-verify-a-noun-study-centre-before-you-travel" },
      { number: "03", title: "Verify before travelling", description: "Use a current official contact when distance, cost, or a deadline is involved.", href: "/articles/how-to-verify-a-noun-study-centre-before-you-travel" },
      { number: "04", title: "Keep visit evidence", description: "Save useful references and records when a centre handles an important request.", href: "/articles/noun-support-ticket-guide" },
    ],
    guidance: {
      eyebrow: "Travel with current information",
      title: "Verify the centre before you make the journey",
      intro: "A familiar centre name is not enough. Confirm the location, the service you need, and whether the listing is still current.",
      checks: [
        { number: "01", title: "Match the official centre name", description: "Similar place names and informal labels can point students to the wrong location." },
        { number: "02", title: "Confirm the service offered", description: "A study centre may not handle every examination, clearance, registration, or support task." },
        { number: "03", title: "Check before a long trip", description: "Verify current contact and service details when travel time, cost, or a deadline matters." },
        { number: "04", title: "Protect private records", description: "Do not hand passwords, OTPs, or unrestricted portal access to unofficial helpers at any location." },
      ],
      notice: "NounCompass records verification evidence and uncertainty, but current official NOUN centre information remains the final authority.",
    },
  },
  gst: {
    primaryLabel: "Choose a GST study task",
    secondary: { label: "Find GST materials", href: "/course-materials?q=GST" },
    maxArticles: 6,
    tasks: [
      { number: "01", title: "Open the GST302 guide", description: "Review the major themes and turn them into a practical revision plan.", href: "/articles/gst302-summary" },
      { number: "02", title: "Find GST materials", description: "Search the course-material library with your exact registered code.", href: "/course-materials?q=GST" },
      { number: "03", title: "Build a study timetable", description: "Spread GST reading across your available days and real course load.", href: "/tools/study-planner" },
      { number: "04", title: "Check practice coverage", description: "See supported GST course topics and original preparation prompts.", href: "/exam-prep" },
    ],
    nextSteps: [
      { number: "01", title: "Confirm the GST code", description: "Match the material and guide with your current registered GST course.", href: "/course-materials?q=GST" },
      { number: "02", title: "Read by learning objective", description: "Use the courseware structure to identify what you should understand and explain.", href: "/articles/gst302-summary" },
      { number: "03", title: "Test understanding", description: "Use original prompts to recall and explain ideas without copying active assessments.", href: "/exam-prep" },
      { number: "04", title: "Review weak topics", description: "Return to the matching course unit whenever practice reveals a gap.", href: "/course-materials?q=GST" },
    ],
    guidance: {
      eyebrow: "Study the course, not predictions",
      title: "Turn broad GST topics into a revision system",
      intro: "GST courses cover wide themes. Use the registered code, official material, learning objectives, and repeated recall to keep revision focused.",
      checks: [
        { number: "01", title: "Use the correct course code", description: "GST101, GST102, GST107, GST201, and GST302 have different objectives and materials." },
        { number: "02", title: "Break material into units", description: "Plan manageable reading blocks rather than trying to revise an entire PDF at once." },
        { number: "03", title: "Explain ideas from memory", description: "Use short written or spoken recall to find weak understanding before the examination." },
        { number: "04", title: "Avoid prediction claims", description: "A useful summary highlights important objectives; it cannot guarantee examination questions." },
      ],
      notice: "Course materials remain the primary study source. NounCompass guides and practice are supplementary learning aids.",
    },
  },
  "student-guides": {
    primaryLabel: "Browse student tasks",
    secondary: { label: "Open course materials", href: "/course-materials" },
    maxArticles: 6,
    tasks: [
      { number: "01", title: "Start a new semester", description: "Plan fees, registration, materials, and the records you should keep.", href: "/articles/noun-school-fees-new-students" },
      { number: "02", title: "Register courses", description: "Choose and verify courses without relying on another student's list.", href: "/articles/how-to-register-noun-courses" },
      { number: "03", title: "Check academic results", description: "Move from My Progress to the full result statement when needed.", href: "/articles/how-to-check-noun-results" },
      { number: "04", title: "Find a study centre", description: "Verify a centre and its services before travelling.", href: "/articles/full-list-of-verified-noun-study-centres-in-nigeria" },
      { number: "05", title: "Prepare a support request", description: "Collect useful evidence and describe a problem clearly without exposing credentials.", href: "/articles/noun-support-ticket-guide" },
    ],
    nextSteps: [
      { number: "01", title: "Choose the task", description: "Start with the page that matches the action you need to complete now.", href: "/student-guides" },
      { number: "02", title: "Check your own record", description: "Confirm the programme, level, semester, and account details that apply to you.", href: "/portal" },
      { number: "03", title: "Save final evidence", description: "Keep receipts, references, slips, and official records after completing the task.", href: "/articles/noun-support-ticket-guide" },
      { number: "04", title: "Ask for help safely", description: "Use support without sharing passwords, OTPs, or unrestricted account access.", href: "/contact" },
    ],
    guidance: {
      eyebrow: "Use the right guide for the task",
      title: "Move from uncertainty to a verified next step",
      intro: "A useful guide should help you complete one clear task, recognise what still needs checking, and keep the right evidence afterwards.",
      checks: [
        { number: "01", title: "Start with your situation", description: "New and returning students may have different charges, records, and registration steps." },
        { number: "02", title: "Verify changing details", description: "Fees, deadlines, portal labels, and programme requirements can change between sessions." },
        { number: "03", title: "Keep useful records", description: "Save final references, receipts, slips, and screenshots that do not expose sensitive information." },
        { number: "04", title: "Protect your account", description: "Never give an unofficial helper your password, OTP, card credentials, or an open portal session." },
      ],
      notice: "NounCompass provides independent student guidance. Your current official NOUN record remains the final authority.",
    },
  },
};

export function CategoryPage({
  category,
  articles,
  allArticles,
  query = "",
}: {
  category: Category;
  articles: ArticleMeta[];
  allArticles: ArticleMeta[];
  query?: string;
}) {
  const guideLabel = /guide/i.test(category.name) ? category.name : `${category.name} guides`;
  const trimmedQuery = query.trim();
  const siblingCategories = categories.filter((item) => item.slug !== category.slug).slice(0, 6);
  const prioritySocialCategories = new Set(["admission", "portal", "results", "student-guides"]);
  const isAdmission = category.slug === "admission";
  const isPortal = category.slug === "portal";
  const categoryExperience = categoryExperiences[category.slug];
  const pageClassName = isAdmission ? "category-page-admission" : isPortal ? "category-page-portal" : categoryExperience ? "category-page-enhanced" : undefined;
  const displayedArticles = trimmedQuery
    ? articles
    : isPortal
      ? [...articles].sort((left, right) => portalGuidePriority(left) - portalGuidePriority(right)).slice(0, 6)
      : categoryExperience
        ? articles.slice(0, categoryExperience.maxArticles)
        : articles;
  const supportLinks = [
    { label: category.name, href: `/${category.slug}` },
    ...searchFallbackLinks.filter((item) => item.href !== `/${category.slug}`),
  ].slice(0, 7);

  return (
    <main id="main-content" className={pageClassName}>
      <div className={`category-hero${isAdmission ? " category-hero-admission" : isPortal ? " category-hero-portal" : categoryExperience ? " category-hero-enhanced" : ""}`}>
        <div className="container">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: category.name }]} />
          <span className="eyebrow">{category.eyebrow}</span>
          <h1>{category.name}</h1>
          <p>{category.description}</p>
          {isAdmission && (
            <>
              <div className="category-hero-actions" aria-label="Admissions starting points">
                <Link className="button" href="/articles/noun-admission-requirements">
                  Read admission requirements
                </Link>
                <Link className="category-hero-secondary" href="/articles/how-to-apply-for-noun-admission">
                  See application steps <span aria-hidden="true">→</span>
                </Link>
              </div>
              <aside className="category-hero-note">
                <strong>Check before you submit.</strong>
                <span>Programme requirements and application instructions can change. Confirm the final details through the current official NOUN admission channel.</span>
              </aside>
            </>
          )}
          {isPortal && (
            <>
              <div className="category-hero-actions" aria-label="Portal help starting points">
                <SectionScrollButton className="button" targetId="guides">Choose a portal task</SectionScrollButton>
                <Link className="category-hero-secondary" href="/articles/nouonline-student-dashboard">
                  Open dashboard guide <span aria-hidden="true">→</span>
                </Link>
              </div>
              <aside className="category-hero-note portal-security-note">
                <strong>Keep your account private.</strong>
                <span>NounCompass will never ask for your NOUN portal password, one-time code, payment-card details, or open account access.</span>
              </aside>
            </>
          )}
          {categoryExperience && (
            <>
              <div className="category-hero-actions" aria-label={`${category.name} starting points`}>
                <SectionScrollButton className="button" targetId="guides">{categoryExperience.primaryLabel}</SectionScrollButton>
                <Link className="category-hero-secondary" href={categoryExperience.secondary.href}>{categoryExperience.secondary.label} <span aria-hidden="true">→</span></Link>
              </div>
              <aside className="category-hero-note"><strong>Check your current record.</strong><span>Use these guides to understand the task, then confirm changing or account-specific details through your current official NOUN record.</span></aside>
            </>
          )}
          {category.slug === "student-guides" && (
            <form className="search-box category-search" action="/student-guides">
              <label className="sr-only" htmlFor="guide-search">
                Search student guides
              </label>
              <input
                id="guide-search"
                name="q"
                defaultValue={query}
                placeholder="Search fees, registration, TMA, results, study centres, NELFUND..."
              />
              <button type="submit">Search guides</button>
            </form>
          )}
        </div>
      </div>

      <div className="container content-sidebar">
        <section id="guides" className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Reviewed student help</span>
              <h2>{trimmedQuery ? `Search results for "${trimmedQuery}"` : guideLabel}</h2>
            </div>
            {isPortal && <Link href="/student-guides?q=portal">View all portal guides</Link>}
            {categoryExperience && !trimmedQuery && <Link href={`/student-guides?q=${encodeURIComponent(category.name)}`}>View all {category.name.toLowerCase()} guides</Link>}
          </div>

          {isPortal && <PortalQuickTasks />}
          {categoryExperience && <CategoryQuickTasks tasks={categoryExperience.tasks} label={`${category.name} tasks`} />}

          {displayedArticles.length ? (
            <>
              <div className="search-support-row">
                {trimmedQuery && (
                  <p>Try a related phrase if you need broader matches, then use the category links below to keep going.</p>
                )}
                <div className="search-support-links">
                  {supportLinks.map((item) => (
                    <Link key={item.href} href={item.href} aria-current={item.href === `/${category.slug}` ? "page" : undefined}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="archive-grid">
                {displayedArticles.map((article) => (
                  <ArticleCard key={article.slug} article={article} ctaLabel={isAdmission || isPortal || Boolean(categoryExperience) ? "Read guide" : undefined} />
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state search-empty-state">
              <h2>{trimmedQuery ? "No matching guide found yet" : "New guides are being prepared"}</h2>
              <p>
                {trimmedQuery
                  ? "Try a shorter topic, a course code, or one of the sections below. Search works from the article titles, summaries, categories, and keywords already on the site."
                  : "Use our existing student guides while this section grows."}
              </p>
              <div className="search-support-links">
                {supportLinks.map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label}
                  </Link>
                ))}
              </div>
              <Link className="button" href="/student-guides">
                Browse all student guides
              </Link>
            </div>
          )}

          {(category.slug === "examinations" || category.slug === "gst") && <aside className="platform-upgrade contextual-exam-prep"><div><span className="eyebrow">Free account option</span><h2>{category.slug === "gst" ? "Prepare for supported GST courses" : "Turn exam guidance into study practice"}</h2><p>Check the supported course list, create a free account, and try a short diagnostic when sample questions are available.</p></div><Link className="button" href="/exam-prep">See exam preparation</Link><Link href="/dashboard/practice">Try free diagnostic</Link></aside>}

          {isAdmission && (
            <aside className="admission-assistance" aria-labelledby="admission-assistance-title">
              <div>
                <span className="eyebrow">Need personal guidance?</span>
                <h2 id="admission-assistance-title">Get help planning your admission application</h2>
                <p>Tell us what you want to study and the qualifications you already have. We can help you understand the choices before you begin the official application.</p>
              </div>
              <ul>
                <li>Advice on an appropriate programme to consider</li>
                <li>Expected programme duration</li>
                <li>Likely course list and study workload</li>
                <li>Potential school-fee breakdown</li>
                <li>Entry requirements and documents to prepare</li>
              </ul>
              <div className="admission-assistance-actions">
                <Link className="button" href="/contact">
                  Contact us for admission guidance
                </Link>
                <p>NounCompass provides independent guidance. Final requirements, fees, programme availability, and admission decisions remain with NOUN.</p>
              </div>
            </aside>
          )}

          {isAdmission && <AdmissionsGuidance />}
          {isPortal && <PortalGuidance />}
          {categoryExperience && <CategoryGuidance guidance={categoryExperience.guidance} />}

          {!isAdmission && !isPortal && !categoryExperience && <div className="seo-intro">
            <h2>How NOUN Compass approaches {category.name.toLowerCase()}</h2>
            {category.slug === "portal" && (
              <p>
                Start with the exact task you need to finish. For most account issues, that means
                checking the current <Link href="/articles/nouonline-student-dashboard">student dashboard</Link>,
                then using the right guide for <Link href="/articles/noun-portal-password-reset">password reset</Link>,
                <Link href="/articles/update-profile-nouonline"> profile updates</Link>, or the next
                registration step.
              </p>
            )}
            {category.slug === "results" && (
              <p>
                Open the <Link href="/tools/result-checker">NOUN result checker</Link> when you have a
                matriculation number, start with <Link href="/articles/how-to-find-noun-results-on-my-progress">My progress</Link>,
                continue to <Link href="/articles/how-to-open-your-noun-result-statement-from-the-support-portal">Result statement</Link> when you need the deeper academic record, and use the <Link href="/tools/cgpa-calculator">CGPA calculator</Link> only for planning before you compare it with your official NOUN result page.
              </p>
            )}
            <p>
              {category.description} We start with the task a student is trying to finish, explain
              the records and decisions involved, and point out what still needs to be checked on
              the official NOUN side.
            </p>
            <p>
              Dates, fees, requirements, and portal labels can change. Treat old screenshots,
              forwarded messages, and another student&apos;s record as helpful context, not final proof.
            </p>
            <p>
              Before you act, check the programme, level, semester, student details, and deadline
              that apply to your own case. Save receipts, references, and final records so you can
              spot problems early and explain them clearly if support asks questions later.
            </p>
            <p>
              If two sources disagree, follow the one that matches your current official record. Use the
              instruction tied most closely to your current official record, and ask an authorized
              channel when the difference could affect payment or academic progress.
            </p>
            <p>
              Some problems overlap. A {category.name.toLowerCase()} issue can also affect payment,
              registration, exams, results, or support. Follow the related links, but compare every
              final action with your own current official record.
            </p>
            <p>
              Keep control of your personal information. Do not share passwords, one-time codes,
              full payment-card details, or open portal access with an outside website or random
              helper.
            </p>
            <p>
              NOUN Compass cannot access student accounts, take payments, change records, or make
              academic decisions. Your current official NOUN record should always come first.
            </p>
          </div>}

          {prioritySocialCategories.has(category.slug) && (
            <SocialLinks
              className="priority-social-links"
              title={`Follow NounCompass for ${category.name.toLowerCase()} updates`}
              intro="These are the NounCompass social pages for quick reminders and short updates."
            />
          )}

          <section className="related">
            <span className="eyebrow">Related topic hubs</span>
            <h2>Keep exploring related NOUN help</h2>
            <div>
              {siblingCategories.map((item) => (
                <Link key={item.slug} href={`/${item.slug}`}>
                  <span>{item.eyebrow}</span>
                  <strong>{item.name}</strong>
                  <small>{item.description}</small>
                </Link>
              ))}
            </div>
          </section>
        </section>

        {isAdmission ? <AdmissionsNextSteps /> : isPortal ? <PortalNextSteps /> : categoryExperience ? <CategoryNextSteps categoryName={category.name} steps={categoryExperience.nextSteps} /> : <TrendingSidebar articles={allArticles} />}
      </div>
    </main>
  );
}

function PortalQuickTasks() {
  const tasks = [
    { number: "01", title: "Student dashboard", description: "Understand the current workspace and where common tasks now live.", href: "/articles/nouonline-student-dashboard" },
    { number: "02", title: "Register courses", description: "Choose eligible courses, review units, and save your final registration.", href: "/articles/how-to-register-noun-courses" },
    { number: "03", title: "Recover password", description: "Use the proper recovery route without sharing private account details.", href: "/articles/noun-portal-password-reset" },
    { number: "04", title: "Update your profile", description: "Check the records and supporting details before requesting a correction.", href: "/articles/update-profile-nouonline" },
    { number: "05", title: "Open a support ticket", description: "Prepare references, screenshots, and a clear explanation of the problem.", href: "/articles/noun-support-ticket-guide" },
  ];

  return (
    <nav className="portal-task-grid" aria-label="Common portal tasks">
      {tasks.map((task) => (
        <Link key={task.number} href={task.href}>
          <span>{task.number}</span>
          <strong>{task.title}</strong>
          <small>{task.description}</small>
          <em>Open guide <span aria-hidden="true">→</span></em>
        </Link>
      ))}
    </nav>
  );
}

function CategoryQuickTasks({ tasks, label }: { tasks: CategoryExperience["tasks"]; label: string }) {
  return (
    <nav className="portal-task-grid category-task-grid" aria-label={label}>
      {tasks.map((task) => (
        <Link key={task.number} href={task.href}>
          <span>{task.number}</span>
          <strong>{task.title}</strong>
          <small>{task.description}</small>
          <em>Open guide <span aria-hidden="true">→</span></em>
        </Link>
      ))}
    </nav>
  );
}

function CategoryGuidance({ guidance }: { guidance: CategoryExperience["guidance"] }) {
  return (
    <section className="portal-guidance category-guidance" aria-labelledby="category-guidance-title">
      <header><span className="eyebrow">{guidance.eyebrow}</span><h2 id="category-guidance-title">{guidance.title}</h2><p>{guidance.intro}</p></header>
      <div>{guidance.checks.map((check) => <article key={check.number}><span>{check.number}</span><h3>{check.title}</h3><p>{check.description}</p></article>)}</div>
      <aside><strong>{guidance.notice}</strong></aside>
    </section>
  );
}

function CategoryNextSteps({ categoryName, steps }: { categoryName: string; steps: CategoryExperience["nextSteps"] }) {
  return (
    <aside className="portal-next-steps category-next-steps" aria-labelledby="category-next-steps-title">
      <span className="eyebrow">{categoryName} pathway</span>
      <h2 id="category-next-steps-title">Choose the next step</h2>
      <ol>{steps.map((step) => <li key={step.number}><span>{step.number}</span><div><Link href={step.href}>{step.title}</Link><p>{step.description}</p></div></li>)}</ol>
      <div className="trust-note"><strong>Independent student guidance</strong><p>Use NounCompass to understand the task, then confirm the final action through your own current official record.</p><Link href="/disclaimer">Read the independence notice</Link></div>
    </aside>
  );
}

function PortalGuidance() {
  const checks = [
    { number: "01", title: "Start with the exact task", description: "Identify whether the problem concerns login, payment, registration, results, profile details, or eLearn before following a guide." },
    { number: "02", title: "Compare with your current record", description: "Portal labels and workflows can change. Let the information shown in your authenticated NOUN account guide the final action." },
    { number: "03", title: "Keep useful evidence", description: "Save references, receipts, registration slips, error messages, dates, and non-sensitive screenshots before contacting support." },
    { number: "04", title: "Never hand over account access", description: "Do not share passwords, one-time codes, full payment details, or an open portal session with an outside helper." },
  ];

  return (
    <section className="portal-guidance" aria-labelledby="portal-guidance-title">
      <header>
        <span className="eyebrow">Resolve portal tasks safely</span>
        <h2 id="portal-guidance-title">Know what to check before you click</h2>
        <p>Portal problems are easier to explain and resolve when you separate the task, preserve the right evidence, and keep control of your account.</p>
      </header>
      <div>
        {checks.map((check) => <article key={check.number}><span>{check.number}</span><h3>{check.title}</h3><p>{check.description}</p></article>)}
      </div>
      <aside><strong>NounCompass cannot log in, change records, or complete portal actions for you.</strong><p>Use our guides to understand the workflow, then complete the final action inside your current official NOUN account.</p></aside>
    </section>
  );
}

function PortalNextSteps() {
  const steps = [
    { number: "01", title: "Confirm the affected task", description: "Separate login, registration, payment, profile, result, and eLearn issues.", href: "/articles/nouonline-student-dashboard" },
    { number: "02", title: "Try the matching guide", description: "Follow the guide that matches the current screen and the record you can see.", href: "/student-guides?q=portal" },
    { number: "03", title: "Collect safe evidence", description: "Keep references and error details without exposing passwords or payment credentials.", href: "/articles/noun-support-ticket-guide" },
    { number: "04", title: "Contact official support", description: "Use a clear support request when the portal record cannot be corrected through self-service.", href: "/articles/noun-support-ticket-guide" },
  ];

  return (
    <aside className="portal-next-steps" aria-labelledby="portal-next-steps-title">
      <span className="eyebrow">Portal troubleshooting</span>
      <h2 id="portal-next-steps-title">From problem to next step</h2>
      <ol>{steps.map((step) => <li key={step.number}><span>{step.number}</span><div><Link href={step.href}>{step.title}</Link><p>{step.description}</p></div></li>)}</ol>
      <div className="trust-note"><strong>Protect sensitive information</strong><p>Support normally needs a clear description and useful references—not your password, OTP, or card details.</p><Link href="/articles/noun-support-ticket-guide">Prepare a support request</Link></div>
    </aside>
  );
}

function portalGuidePriority(article: ArticleMeta) {
  const text = `${article.slug} ${article.title}`.toLowerCase();
  if (text.includes("student-dashboard")) return 0;
  if (text.includes("register-noun-courses")) return 1;
  if (text.includes("password-reset") || text.includes("forgotten") || text.includes("recover")) return 2;
  if (text.includes("update-profile")) return 3;
  if (text.includes("support-ticket")) return 4;
  if (text.includes("missing-course")) return 5;
  return 6;
}

function AdmissionsGuidance() {
  const checks = [
    {
      number: "01",
      title: "Match the programme to your qualifications",
      description: "Compare the entry route, required subjects, programme duration, and study commitment before choosing a course of study.",
    },
    {
      number: "02",
      title: "Verify what applies right now",
      description: "Requirements, fees, programme availability, portal labels, and deadlines can change. Use current official information for the final decision.",
    },
    {
      number: "03",
      title: "Prepare and keep your evidence",
      description: "Check your personal details before submission, then save application references, receipts, uploaded documents, and final records.",
    },
    {
      number: "04",
      title: "Protect your account and payments",
      description: "Never share passwords, one-time codes, card details, or open portal access with an unofficial helper.",
    },
  ];

  return (
    <section className="admissions-guidance" aria-labelledby="admissions-guidance-title">
      <header>
        <span className="eyebrow">Apply with clarity</span>
        <h2 id="admissions-guidance-title">Make a safer admission decision</h2>
        <p>Good admission planning is more than completing a form. These checks help you choose carefully, prepare the right records, and avoid preventable application problems.</p>
      </header>
      <div className="admissions-guidance-grid">
        {checks.map((check) => (
          <article key={check.number}>
            <span aria-hidden="true">{check.number}</span>
            <h3>{check.title}</h3>
            <p>{check.description}</p>
          </article>
        ))}
      </div>
      <aside>
        <div>
          <strong>NounCompass is independent student guidance.</strong>
          <p>We can explain your options and help you prepare, but we cannot access student accounts, approve applications, alter records, or guarantee admission.</p>
        </div>
        <Link href="/disclaimer">Read how our guidance works <span aria-hidden="true">→</span></Link>
      </aside>
    </section>
  );
}

function AdmissionsNextSteps() {
  const steps = [
    {
      number: "01",
      title: "Confirm your entry requirements",
      description: "Check the programme and entry route that apply to you before beginning an application.",
      href: "/articles/noun-admission-requirements",
    },
    {
      number: "02",
      title: "Follow the application steps",
      description: "Prepare your documents, use the current application process, and keep your evidence.",
      href: "/articles/how-to-apply-for-noun-admission",
    },
    {
      number: "03",
      title: "Plan for school fees",
      description: "Review the fee guidance before making payments or planning your first semester.",
      href: "/fees",
    },
    {
      number: "04",
      title: "Prepare for registration",
      description: "Understand the portal and registration steps that follow a successful admission.",
      href: "/portal",
    },
  ];

  return (
    <aside className="admissions-next-steps" aria-labelledby="admissions-next-steps-title">
      <span className="eyebrow">Your admission path</span>
      <h2 id="admissions-next-steps-title">What to do next</h2>
      <ol>
        {steps.map((step) => (
          <li key={step.number}>
            <span aria-hidden="true">{step.number}</span>
            <div>
              <Link href={step.href}>{step.title}</Link>
              <p>{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="trust-note">
        <strong>Independent student guidance</strong>
        <p>NounCompass explains the process, but it cannot approve an application or replace your current official NOUN record.</p>
        <Link href="/disclaimer">Read the independence notice</Link>
      </div>
    </aside>
  );
}
