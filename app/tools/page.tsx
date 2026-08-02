import Link from "next/link";
import { Breadcrumbs, DisclaimerBox } from "@/components/article-elements";
import { SectionScrollButton } from "@/components/section-scroll-button";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata(
  "NOUN Student Tools",
  "Use practical NOUN tools for results, school fees, CGPA, study planning, and exam diagnostics.",
  "/tools",
);

const tools = [
  {
    id: "result-checker",
    number: "01",
    title: "NOUN result checker",
    copy: "Enter your matriculation number to open your result statement on the official NOUN result portal.",
    href: "/tools/result-checker",
    action: "Check your result",
  },
  {
    id: "fee-guide",
    number: "02",
    title: "School fees checker",
    copy: "Review the available semester breakdown by faculty, programme, level, and semester, then confirm the final amount on your portal.",
    href: "/fees",
    action: "Check your school fees",
  },
  {
    id: "study-planner",
    number: "03",
    title: "NOUN study planner",
    copy: "Build a weekly timetable around your courses, free hours, workdays, and study rhythm.",
    href: "/tools/study-planner",
    action: "Open the study planner",
  },
  {
    id: "cgpa-calculator",
    number: "04",
    title: "NOUN CGPA calculator",
    copy: "Enter course units and final scores to estimate grade points, semester GPA, and your running CGPA.",
    href: "/tools/cgpa-calculator",
    action: "Open the CGPA calculator",
  },
  {
    id: "exam-diagnostic",
    number: "05",
    title: "Free exam diagnostic",
    copy: "Sign in with a free account to try checked sample questions and see where you need more work.",
    href: "/dashboard/practice",
    action: "Start free diagnostic",
  },
] as const;

export default function ToolsPage() {
  return (
    <main id="main-content" className="experience-page tools-landing-page">
      <div className="category-hero category-hero-enhanced">
        <div className="container">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Tools" }]} />
          <span className="eyebrow">Plan with clarity</span>
          <h1>Powerful tools for smarter study</h1>
          <p>
            Check records, plan fees, estimate CGPA, organise study time, and
            test your exam readiness with tools built around real NOUN student
            tasks.
          </p>
          <div className="category-hero-actions">
            <SectionScrollButton className="button" targetId="tools-directory">Choose a student tool</SectionScrollButton>
            <Link className="category-hero-secondary" href="/student-guides">Browse student guides <span aria-hidden="true">&rarr;</span></Link>
          </div>
          <aside className="category-hero-note"><strong>Five practical tools.</strong><span>Start with the task you need to finish, then confirm every final record on the official NOUN platform.</span></aside>
        </div>
      </div>
      <div id="tools-directory" className="container section tools-directory">
        <div className="tools-directory-grid">
          {tools.map((tool) => (
            <section id={tool.id} className="tool-panel" key={tool.id}>
              <span className="tool-number">{tool.number}</span>
              <h2>{tool.title}</h2>
              <p>{tool.copy}</p>
              <Link className="button" href={tool.href}>
                {tool.action}
              </Link>
              {tool.id === "exam-diagnostic" ? (
                <Link className="tool-secondary-link" href="/exam-prep">
                  See supported course coverage
                </Link>
              ) : null}
            </section>
          ))}
        </div>
        <aside className="tools-directory-note">
          <span className="eyebrow">Private by design</span>
          <h2>Use only the information each tool needs</h2>
          <p>
            NounCompass does not ask for your NOUN portal password, payment PIN,
            OTP, or identity documents. Official portal records remain the final
            authority.
          </p>
        </aside>
        <DisclaimerBox />
      </div>
    </main>
  );
}
