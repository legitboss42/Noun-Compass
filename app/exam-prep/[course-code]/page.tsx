import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/article-elements";
import { examPrepCourses, getExamPrepCourse } from "@/data/exam-prep";
import { createMetadata } from "@/lib/metadata";

export function generateStaticParams() { return examPrepCourses.map((course) => ({ "course-code": course.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ "course-code": string }> }) {
  const course = getExamPrepCourse((await params)["course-code"]);
  if (!course) return {};
  return createMetadata(`${course.code} Exam Preparation`, `Original ${course.code} practice coverage, source notes, explanations, and preparation tools for NOUN students.`, `/exam-prep/${course.slug}`);
}

export default async function CoursePrepPage({ params }: { params: Promise<{ "course-code": string }> }) {
  const course = getExamPrepCourse((await params)["course-code"]);
  if (!course) notFound();
  return <main id="main-content"><div className="category-hero"><div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Exam preparation", href: "/exam-prep" }, { label: course.code }]} /><span className="eyebrow">{course.examMode} preparation</span><h1>{course.code} exam preparation</h1><p>{course.title}. {course.description}</p></div></div><div className="container narrow section"><section className="platform-panel"><h2>Coverage planned for this bank</h2><ul className="platform-topic-list">{course.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul></section><section className="platform-panel"><h2>Preview the reasoning style</h2><p>These prompts show the type of understanding the reviewed bank will test. They are not copied examination questions.</p><ol className="platform-preview-list">{course.previewPrompts.map((prompt) => <li key={prompt}>{prompt}</li>)}</ol></section><aside className="source-note"><strong>Official source boundary</strong><p>The courseware is used to verify topics and learning objectives. NounCompass writes original questions and explanations and does not claim that any practice item will appear in an examination.</p><a href={course.sourceUrl} target="_blank" rel="noopener noreferrer">Open the official course material</a></aside><div className="platform-upgrade"><div><span className="eyebrow">Free account</span><h2>Save this course to your semester dashboard</h2><p>Cloud progress and membership require an account, while official materials and core planning tools remain free.</p></div><Link className="button" href="/account/sign-up">Create free account</Link><Link href="/membership">See the semester pass</Link></div></div></main>;
}
