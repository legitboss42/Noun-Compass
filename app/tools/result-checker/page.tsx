import type { Metadata } from "next";
import { DisclaimerBox } from "@/components/article-elements";
import { ResultsChecker } from "@/components/results-checker";
import { ToolPageHero } from "@/components/tool-page-hero";
import { createMetadata } from "@/lib/metadata";
import { getCurrentUser } from "@/lib/platform/auth";
import Link from "next/link";

export const metadata: Metadata = {
  ...createMetadata(
    "NOUN Result Checker | Open Your Result Statement",
    "Use your NOUN matriculation number to open your result statement on the official NOUN portal. Check grades, CGPA, outstanding courses, and academic records.",
    "/tools/result-checker",
  ),
  keywords: ["NOUN result checker", "check NOUN result", "NOUN result statement", "NOUN CGPA", "NOUN matric number"],
};

export default async function ResultCheckerToolPage() {
  const user = await getCurrentUser();
  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "NOUN Result Checker",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    url: "https://nouncompass.me/tools/result-checker",
    description: "Open a NOUN result statement using a matriculation number and verify the final record on the official portal.",
  };

  return <main id="main-content" className="tool-public-page"><ToolPageHero title="NOUN result checker" eyebrow="Academic record tool" intro="Check your matriculation-number format, then continue securely to the official NOUN result portal." signedIn={Boolean(user)} signInHref="/account/sign-in?next=/tools/result-checker" /><div id="tool-workspace" className="container narrow section tool-page-content">{user ? <ResultsChecker /> : <section className="platform-panel tool-account-gate"><span className="eyebrow">Account required</span><h2>Sign in to open the result checker</h2><p>Use a free NounCompass account before opening student tools. NounCompass does not store your result or ask for your NOUN portal password.</p><div className="platform-auth-links"><Link className="button" href="/account/sign-in?next=/tools/result-checker">Sign in</Link><Link href="/account/sign-up">Create free account</Link></div></section>}<section className="seo-intro"><h2>Open the right official record</h2><p>This tool validates the matriculation-number format and opens the official result portal, where private academic records remain protected behind the official sign-in.</p><p>NounCompass never receives your portal password or result. Confirm the final record there before relying on it for registration, graduation, or support.</p></section><DisclaimerBox /></div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} /></main>;
}
