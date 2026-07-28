import type { Metadata } from "next";
import Link from "next/link";
import { AiPracticeRunner } from "@/components/ai-practice-runner";
import { listAiPracticeMaterialsForCourseCodes } from "@/lib/platform/ai-practice-materials";
import { requireUser } from "@/lib/platform/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "AI Practice",
  robots: { index: false, follow: false },
  alternates: null,
};

export default async function DashboardAiPracticePage() {
  const user = await requireUser("/dashboard/ai-practice");
  const supabase = await createClient();
  const { data: profile } =
    (await supabase
      ?.from("profiles")
      .select("selected_course_codes")
      .eq("id", user.id)
      .maybeSingle()) ?? { data: null };
  const selectedCodes = (profile?.selected_course_codes ?? []) as string[];
  const materials = listAiPracticeMaterialsForCourseCodes(selectedCodes);

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
      {materials.length ? (
        <AiPracticeRunner materials={materials} />
      ) : (
        <section className="platform-panel empty-state">
          <span className="eyebrow">Semester setup required</span>
          <h2>No registered course materials available yet</h2>
          <p>
            Add your registered course codes in the dashboard first. AI Practice
            will then show only official materials that match those courses.
          </p>
          <Link className="button" href="/dashboard/profile">
            Add registered courses
          </Link>
        </section>
      )}
    </>
  );
}
