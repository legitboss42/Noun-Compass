import type { Metadata } from "next";
import { Breadcrumbs, DisclaimerBox } from "@/components/article-elements";
import { ResultsChecker } from "@/components/results-checker";
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

  return <main id="main-content"><div className="category-hero"><div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Tools", href: "/tools" }, { label: "Result Checker" }]} /><span className="eyebrow">Academic record tool</span><h1>NOUN result checker</h1><p>Enter your matriculation number, then continue securely to the official NOUN result portal.</p></div></div><div className="container narrow section">{user ? <ResultsChecker /> : <section className="platform-panel"><span className="eyebrow">Account required</span><h2>Sign in to open the result checker</h2><p>Use a free NounCompass account before opening student tools. NounCompass does not store your result or ask for your NOUN portal password.</p><div className="platform-auth-links"><Link className="button" href="/account/sign-in?next=/tools/result-checker">Sign in</Link><Link href="/account/sign-up">Create free account</Link></div></section>}<section className="seo-intro"><h2>What this NOUN result checker does</h2><p>This tool checks the format of your matriculation number and opens the official NOUN result portal. The official portal will ask you to sign in before showing any private academic record.</p><p>NounCompass does not ask for your portal password, OTP, payment details, or other private account information. Confirm the final record on the official NOUN page before relying on it for registration, graduation, or support.</p></section><DisclaimerBox /></div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} /></main>;
}
