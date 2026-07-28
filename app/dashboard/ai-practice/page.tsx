import type { Metadata } from "next";
import { AiPracticeRunner } from "@/components/ai-practice-runner";
import { listAiPracticeMaterials } from "@/lib/platform/ai-practice-materials";
import { requireUser } from "@/lib/platform/auth";

export const metadata: Metadata = {
  title: "AI Practice",
  robots: { index: false, follow: false },
  alternates: null,
};

export default async function DashboardAiPracticePage() {
  await requireUser("/dashboard/ai-practice");
  const materials = listAiPracticeMaterials(2600);

  return (
    <>
      <header className="platform-heading">
        <div>
          <span className="eyebrow">AI-powered revision</span>
          <h1>Generate personal practice questions</h1>
          <p>
            Choose an official NOUN course material and NounCompass will generate a
            private practice set from the extracted material text. Published question
            banks remain human-reviewed separately.
          </p>
        </div>
      </header>
      <section className="platform-stat-grid" aria-label="AI practice safeguards">
        <article>
          <span>Source controlled</span>
          <strong>Official</strong>
          <small>Only catalogue materials from NOUN eCourseware are accepted.</small>
        </article>
        <article>
          <span>Private practice</span>
          <strong>AI</strong>
          <small>Generated questions are for your session, not public publication.</small>
        </article>
        <article>
          <span>Semester Pass</span>
          <strong>More</strong>
          <small>Paid members receive higher daily generation and question limits.</small>
        </article>
      </section>
      <AiPracticeRunner materials={materials} />
    </>
  );
}
