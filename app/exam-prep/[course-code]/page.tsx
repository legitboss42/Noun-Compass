import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/article-elements";
import { examPrepCourses, getExamPrepCourse } from "@/data/exam-prep";
import { createMetadata } from "@/lib/metadata";

export function generateStaticParams() { return examPrepCourses.map((course) => ({ "course-code": course.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ "course-code": string }> }): Promise<Metadata> {
  const course = getExamPrepCourse((await params)["course-code"]);
  if (!course) return {};
  return {
    ...createMetadata(
      `${course.code} Revision Topics and Warm-Up Questions`,
      `Review ${course.code} topics and original warm-up questions while the full NounCompass practice set is being checked.`,
      `/exam-prep/${course.slug}`,
    ),
    robots: { index: false, follow: true },
  };
}

export default async function CoursePrepPage({ params }: { params: Promise<{ "course-code": string }> }) {
  const course = getExamPrepCourse((await params)["course-code"]);
  if (!course) notFound();
  return <main id="main-content"><div className="category-hero"><div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Exam preparation", href: "/exam-prep" }, { label: course.code }]} /><span className="eyebrow">{course.examMode} course</span><h1>{course.code}: topics to revise</h1><p>{course.description}</p></div></div><div className="container narrow section"><section className="platform-panel"><h2>Start with these topics</h2><ul className="platform-topic-list">{course.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul></section><section className="platform-panel"><h2>Questions to think through</h2><p>Use these original prompts to test whether you can explain an idea, not simply recognise a familiar phrase. They are not past questions or predictions.</p><ol className="platform-preview-list">{course.previewPrompts.map((prompt) => <li key={prompt}>{prompt}</li>)}</ol></section><aside className="source-note"><strong>Study from the course material</strong><p>We use the courseware to confirm topics and learning objectives. It remains the main source for your revision, and no prompt here is a claim about what will appear in an examination.</p><a href={course.sourceUrl} target="_blank" rel="noopener noreferrer">Open the official course material</a></aside><div className="platform-upgrade course-prep-actions"><div><span className="eyebrow">Practice access</span><h2>The full practice set is still being checked</h2><p>Reviewed sample questions will appear in the dashboard when they are ready. A free account lets you return without presenting unfinished questions as study material.</p></div><Link className="button" href="/account/sign-up">Create a free account</Link><Link href="/account/sign-in?next=/dashboard/practice">Already registered? Sign in</Link><Link href="/dashboard">Go to your dashboard</Link></div></div></main>;
}
