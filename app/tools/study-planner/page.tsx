import { Breadcrumbs, DisclaimerBox } from "@/components/article-elements";
import { StudyPlanner } from "@/components/study-planner";
import { createMetadata } from "@/lib/metadata";
import { studyPlannerStats } from "@/lib/study-planner-catalog";

export const metadata = createMetadata(
  "NOUN Study Planner and Reading Timetable Generator",
  "Build a personalized weekly NOUN study timetable using your courses, availability, and study rhythm.",
  "/tools/study-planner",
);

export default function StudyPlannerPage() {
  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "NOUN Study Planner",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    url: "https://www.nouncompass.me/tools/study-planner",
    description: "Generate a weekly reading timetable for NOUN courses using student availability, workdays, and suggested course data already available on NounCompass.",
  };

  return <main id="main-content"><div className="category-hero"><div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Tools", href: "/tools" }, { label: "Study Planner" }]} /><span className="eyebrow">Plan with clarity</span><h1>NOUN study planner</h1><p>Create a realistic weekly reading timetable around your actual work-life schedule. Course suggestions come from the curriculum and material data already available on NounCompass, but your final registered course list should always come from official NOUN records.</p></div></div><div className="container section"><StudyPlanner stats={studyPlannerStats} /><div className="seo-intro"><h2>What this first version can and cannot do</h2><p>This version helps you build a personal reading timetable from your selected courses, weekly availability, study rhythm, and optional difficulty choices. It is intentionally practical, lightweight, and student-controlled.</p><p>It does not connect to your student portal, verify your final registration, or guarantee that every suggested course has a downloadable material. Suggestions are based on the course and material data already present on NounCompass. Always confirm your actual registered courses, official materials, and deadlines through current NOUN channels.</p><p>Current material coverage is not complete for every recognized course. NounCompass currently recognizes {studyPlannerStats.recognizedCourseCodes.toLocaleString()} curriculum-backed course codes in the planner catalog. {studyPlannerStats.recognizedWithMaterials.toLocaleString()} of those already have at least one downloadable official-source material entry, while {studyPlannerStats.recognizedWithoutMaterials.toLocaleString()} do not yet have a downloadable material match in the library.</p></div><DisclaimerBox /></div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} /></main>;
}
