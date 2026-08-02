import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/article-elements";
import { SectionScrollButton } from "@/components/section-scroll-button";
import { examPrepCourses } from "@/data/exam-prep";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  ...createMetadata(
    "NOUN Exam Preparation by Course",
    "Review course-specific revision topics and original warm-up prompts before starting a NounCompass Practice Exam.",
    "/exam-prep",
  ),
  robots: { index: false, follow: true },
};

export default function ExamPrepPage() {
  return (
    <main id="main-content" className="exam-prep-page">
      <div className="category-hero category-hero-enhanced">
        <div className="container">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Exam preparation" }]} />
          <span className="eyebrow">Prepare by course</span>
          <h1>Turn course topics into a focused revision plan</h1>
          <p>
            Start with the major topics and original warm-up prompts below,
            then use Practice Exam in your account for generated questions and
            saved attempt history.
          </p>
          <div className="category-hero-actions">
            <SectionScrollButton className="button" targetId="exam-course-list">Choose a course</SectionScrollButton>
            <Link className="category-hero-secondary" href="/dashboard/ai-practice">Open Practice Exam <span aria-hidden="true">&rarr;</span></Link>
          </div>
          <aside className="category-hero-note">
            <strong>Original preparation only.</strong>
            <span>These are revision prompts, not leaked questions, active TMAs, or predictions of an examination.</span>
          </aside>
        </div>
      </div>

      <section id="exam-course-list" className="container section exam-prep-directory">
        <header className="section-heading">
          <div><span className="eyebrow">Course previews</span><h2>Choose the course you want to revise</h2></div>
          <p>Each preview helps you identify what to read before attempting a generated practice session.</p>
        </header>
        <div className="platform-public-grid exam-prep-grid">
          {examPrepCourses.map((course) => (
            <article key={course.code}>
              <span>{course.level} level &middot; Semester {course.semester}</span>
              <h2 className="course-card-heading"><span>{course.code}</span>{course.title}</h2>
              <p>{course.description}</p>
              <Link href={`/exam-prep/${course.slug}`}>Review topics and warm-up prompts <span aria-hidden="true">&rarr;</span></Link>
            </article>
          ))}
        </div>
        <aside className="platform-callout exam-prep-callout">
          <strong>Want questions from your registered material?</strong>
          <p>Sign in, keep your registered-course list current, and use Practice Exam. Finished and unfinished attempts are saved to your personal practice history.</p>
          <Link className="button" href="/dashboard/ai-practice">Go to Practice Exam</Link>
        </aside>
      </section>
    </main>
  );
}
