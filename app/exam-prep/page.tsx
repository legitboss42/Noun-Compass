import Link from "next/link";
import { Breadcrumbs } from "@/components/article-elements";
import { examPrepCourses } from "@/data/exam-prep";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata("NOUN Exam Preparation by Course", "Prepare for NOUN courses with original reviewed questions, clear explanations, diagnostic practice, and progress tools.", "/exam-prep");

export default function ExamPrepPage() {
  const schema = { "@context": "https://schema.org", "@type": "CollectionPage", name: "NOUN exam preparation", url: "https://nouncompass.me/exam-prep", hasPart: examPrepCourses.map((course) => ({ "@type": "Course", name: `${course.code}: ${course.title}`, url: `https://nouncompass.me/exam-prep/${course.slug}` })) };
  return <main id="main-content"><div className="category-hero"><div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Exam preparation" }]} /><span className="eyebrow">Original learning practice</span><h1>Prepare by course, not by guesswork</h1><p>Use source-aware practice designed around learning objectives. NounCompass does not publish leaked exams, active TMA answers, or copied question banks.</p></div></div><section className="container section"><div className="platform-public-grid">{examPrepCourses.map((course) => <article key={course.code}><span>{course.level} level · Semester {course.semester}</span><h2 className="course-card-heading"><span>{course.code}</span>{course.title}</h2><p>{course.description}</p><Link href={`/exam-prep/${course.slug}`}>Review course coverage</Link></article>)}</div><aside className="platform-callout"><strong>Editorial launch gate</strong><p>Each full bank remains unavailable until its questions and explanations have passed the logged review workflow. Public course pages can launch before premium access without pretending unfinished content is ready.</p></aside></section><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /></main>;
}
