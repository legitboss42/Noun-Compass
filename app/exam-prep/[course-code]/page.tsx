import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/article-elements";
import { examPrepCourses, getExamPrepCourse } from "@/data/exam-prep";
import { createMetadata } from "@/lib/metadata";
import { getCurrentUser } from "@/lib/platform/auth";

export function generateStaticParams() {
  return examPrepCourses.map((course) => ({ "course-code": course.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ "course-code": string }> }): Promise<Metadata> {
  const course = getExamPrepCourse((await params)["course-code"]);
  if (!course) return {};
  return {
    ...createMetadata(
      `${course.code} Revision Topics and Warm-Up Questions`,
      `Review ${course.code} topics and original warm-up questions before starting a NounCompass Practice Exam.`,
      `/exam-prep/${course.slug}`,
    ),
    robots: { index: false, follow: true },
  };
}

export default async function CoursePrepPage({ params }: { params: Promise<{ "course-code": string }> }) {
  const course = getExamPrepCourse((await params)["course-code"]);
  if (!course) notFound();
  const user = await getCurrentUser();

  return (
    <main id="main-content" className="exam-course-page">
      <div className="category-hero exam-course-hero">
        <div className="container">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Exam preparation", href: "/exam-prep" }, { label: course.code }]} />
          <span className="eyebrow">{course.examMode} course</span>
          <h1>{course.code}: build your revision checklist</h1>
          <p>{course.description}</p>
          <div className="category-hero-actions">
            <Link className="button" href={user ? "/dashboard/ai-practice" : "/account/sign-in?next=/dashboard/ai-practice"}>{user ? "Start Practice Exam" : "Sign in to practise"}</Link>
            <Link className="category-hero-secondary" href="/exam-prep">Choose another course <span aria-hidden="true">&rarr;</span></Link>
          </div>
        </div>
      </div>
      <div className="container narrow section exam-course-content">
        <section className="platform-panel exam-topic-panel">
          <span className="eyebrow">Revision checklist</span>
          <h2>Start with these topics</h2>
          <ul className="platform-topic-list">{course.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul>
        </section>
        <section className="platform-panel exam-prompt-panel">
          <span className="eyebrow">Active recall</span>
          <h2>Questions to think through</h2>
          <p>Explain each answer in your own words before returning to the material. These original prompts are not past questions or predictions.</p>
          <ol className="platform-preview-list">{course.previewPrompts.map((prompt) => <li key={prompt}>{prompt}</li>)}</ol>
        </section>
        <aside className="source-note exam-source-note">
          <strong>Study from the course material</strong>
          <p>The courseware remains the main source for revision. Confirm topics and learning objectives there before relying on any practice prompt.</p>
          <a href={course.sourceUrl} target="_blank" rel="noopener noreferrer">Open the official course material</a>
        </aside>
        <div className="platform-upgrade course-prep-actions">
          <div><span className="eyebrow">Next step</span><h2>Practise from your registered courses</h2><p>Practice Exam uses the course materials connected to your account and saves each attempt to your history.</p></div>
          <Link className="button" href={user ? "/dashboard/ai-practice" : "/account/sign-in?next=/dashboard/ai-practice"}>{user ? "Open Practice Exam" : "Sign in to continue"}</Link>
          {!user ? <Link href="/account/sign-up">Create a free account</Link> : null}
          <Link href="/dashboard/practice">View practice history</Link>
        </div>
      </div>
    </main>
  );
}
