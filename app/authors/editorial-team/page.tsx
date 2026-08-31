import Link from "next/link";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata(
  "NOUN Compass Editorial Team",
  "Learn how the NOUN Compass editorial team prepares, reviews, corrects, and maintains student-help guides.",
  "/authors/editorial-team",
);

export default function Page() {
  return (
    <main id="main-content" className="trust-page">
      <section className="container section">
        <span className="eyebrow">Editorial ownership</span>
        <h1>NOUN Compass Editorial Team</h1>
        <p>
          The NOUN Compass editorial team prepares independent, student-helpful
          guides for National Open University of Nigeria learners. The team
          focuses on clear workflows, cautious source language, and practical
          next steps that students can compare with their own official records.
        </p>
        <h2>What the team reviews</h2>
        <p>
          Editors check whether a guide clearly separates verified source
          evidence, student workflow advice, and account-specific steps that
          may vary by programme, session, portal state, or study centre.
        </p>
        <h2>Correction responsibility</h2>
        <p>
          If a guide is outdated, unclear, or wrongly listed, the team reviews
          reports sent through the{" "}
          <Link href="/corrections-policy">corrections policy</Link> or{" "}
          <Link href="/contact">contact page</Link>. Serious copyright or
          source concerns can also be reported through the{" "}
          <Link href="/takedown-policy">takedown policy</Link>.
        </p>
      </section>
    </main>
  );
}
