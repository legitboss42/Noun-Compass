import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/article-elements";
import { examPrepCourses } from "@/data/exam-prep";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  ...createMetadata(
    "NOUN Exam Preparation by Course",
    "Preview revision topics and warm-up questions while NounCompass prepares reviewed NOUN exam practice.",
    "/exam-prep",
  ),
  robots: { index: false, follow: true },
};

export default function ExamPrepPage() {
  return <main id="main-content"><div className="category-hero"><div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Exam preparation" }]} /><span className="eyebrow">Practice courses</span><h1>Exam practice is being prepared</h1><p>We are writing and checking original questions against the course topics below. Nothing here is copied from an examination or an active TMA.</p></div></div><section className="container section"><div className="platform-public-grid">{examPrepCourses.map((course) => <article key={course.code}><span>{course.level} level · Semester {course.semester}</span><h2 className="course-card-heading"><span>{course.code}</span>{course.title}</h2><p>{course.description}</p><Link href={`/exam-prep/${course.slug}`}>See the topics and warm-up questions</Link></article>)}</div><aside className="platform-callout"><strong>Why practice is not open yet</strong><p>Every question needs a clear answer, an explanation, and a source check before students can use it. Until that work is complete, these pages only show revision topics and a few original prompts you can think through on your own.</p></aside></section></main>;
}
