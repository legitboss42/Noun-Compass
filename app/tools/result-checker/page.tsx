import type { Metadata } from "next";
import { Breadcrumbs, DisclaimerBox } from "@/components/article-elements";
import { ResultsChecker } from "@/components/results-checker";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  ...createMetadata(
    "NOUN Result Checker | Open Your Result Statement",
    "Use your NOUN matriculation number to open your result statement on the official NOUN portal. Check grades, CGPA, outstanding courses, and academic records.",
    "/tools/result-checker",
  ),
  keywords: ["NOUN result checker", "check NOUN result", "NOUN result statement", "NOUN CGPA", "NOUN matric number"],
};

export default function ResultCheckerToolPage() {
  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "NOUN Result Checker",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    url: "https://nouncompass.me/tools/result-checker",
    description: "Open a NOUN result statement using a matriculation number and verify the final record on the official portal.",
  };

  return <main id="main-content"><div className="category-hero"><div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Tools", href: "/tools" }, { label: "Result Checker" }]} /><span className="eyebrow">Academic record tool</span><h1>NOUN result checker</h1><p>Enter your matriculation number to open your result statement on the official NOUN result portal.</p></div></div><div className="container narrow section"><ResultsChecker /><section className="seo-intro"><h2>What this NOUN result checker does</h2><p>This tool requests a result link and takes you to the official NOUN result statement page. Depending on your record, you may see course grades, credits, CGPA, performance standing, passed courses, failed courses, and outstanding credits.</p><p>NOUN Compass does not ask for your portal password, OTP, payment details, or other private account information. Confirm the final record on the official NOUN page before relying on it for registration, graduation, or support.</p></section><DisclaimerBox /></div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} /></main>;
}
