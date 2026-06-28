import { Breadcrumbs, DisclaimerBox } from "@/components/article-elements";
import { CgpaCalculator } from "@/components/cgpa-calculator";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata(
  "NOUN CGPA Calculator and Grade Point Estimator",
  "Calculate your NOUN CGPA from course units and final scores using the current grade-point bands.",
  "/tools/cgpa-calculator",
);

export default function CgpaCalculatorPage() {
  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "NOUN CGPA Calculator",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    url: "https://www.nouncompass.me/tools/cgpa-calculator",
    description:
      "Calculate your NOUN CGPA from course units and final scores using the current grade-point bands and class-of-degree ranges.",
  };

  return <main id="main-content"><div className="category-hero"><div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Tools", href: "/tools" }, { label: "CGPA Calculator" }]} /><span className="eyebrow">Plan with clarity</span><h1>NOUN CGPA calculator</h1><p>Enter your course units and final scores to estimate your semester CGPA, total quality points, and likely class band using the grading ranges you provided.</p></div></div><div className="container section"><CgpaCalculator /><div className="seo-intro"><h2>What this calculator does</h2><p>This tool converts each score into the correct grade point, multiplies that grade point by the course unit, adds the total quality points together, and divides by the total units entered.</p><p>It is useful for checking a semester result, understanding how each course affects your final average, and seeing how close you are to a higher class band before official records are finalized.</p><p>Use it as a planning and checking tool. Your final NOUN result statement and official academic record still come first.</p></div><DisclaimerBox /></div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} /></main>;
}
