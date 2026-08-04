import { DisclaimerBox } from "@/components/article-elements";
import { CgpaCalculator } from "@/components/cgpa-calculator";
import { ToolPageHero } from "@/components/tool-page-hero";
import { createMetadata } from "@/lib/metadata";
import { getCurrentUser } from "@/lib/platform/auth";
import Link from "next/link";

export const metadata = createMetadata(
  "NOUN CGPA Calculator (Free)",
  "Free NOUN CGPA calculator: enter your course units and scores to estimate your CGPA and degree class using the current NOUN grade-point bands.",
  "/tools/cgpa-calculator",
);

export default async function CgpaCalculatorPage() {
  const user = await getCurrentUser();
  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "NOUN CGPA Calculator",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    url: "https://nouncompass.me/tools/cgpa-calculator",
    description:
      "Calculate your NOUN CGPA from course units and final scores using the current grade-point bands and class-of-degree ranges.",
  };

  return <main id="main-content" className="tool-public-page"><ToolPageHero title="NOUN CGPA calculator" eyebrow="Plan with clarity" intro="Enter your course units and final scores to estimate semester CGPA, total quality points, and a likely class band." signedIn={Boolean(user)} signInHref="/account/sign-in?next=/tools/cgpa-calculator" /><div id="tool-workspace" className="container section tool-page-content">{user ? <CgpaCalculator /> : <section className="platform-panel tool-account-gate"><span className="eyebrow">Account required</span><h2>Sign in to calculate and save your CGPA estimate</h2><p>Use a free account so your latest CGPA estimate can appear in your student workspace instead of disappearing after the visit.</p><div className="platform-auth-links"><Link className="button" href="/account/sign-in?next=/tools/cgpa-calculator">Sign in</Link><Link href="/account/sign-up">Create free account</Link></div></section>}<div className="seo-intro"><h2>Understand the estimate</h2><p>The calculator converts each score into a grade point, multiplies it by the course unit, totals the quality points, and divides by the total units entered.</p><p>Use the result to understand how individual courses affect the semester average and where improvement may change a likely class band.</p><p>Your official NOUN result statement remains the final academic record.</p></div><DisclaimerBox /></div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} /></main>;
}
