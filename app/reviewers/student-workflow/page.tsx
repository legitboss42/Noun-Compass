import { TrustPage } from "@/components/trust-page";
import { site } from "@/data/site";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata(
  "Student Workflow Review Desk",
  "Learn how the NOUN Compass Student Workflow Review Desk checks portal, registration, results, and student task guides.",
  "/reviewers/student-workflow",
);

export default function Page() {
  const profileSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Organization",
      name: "Student Workflow Review Desk",
      url: `${site.url}/reviewers/student-workflow`,
      description:
        "The NOUN Compass review desk that checks portal, registration, results, and student task guides.",
    },
  };

  return (
    <TrustPage
      title="Student Workflow Review Desk"
      eyebrow="Workflow Review Desk"
      intro="This desk reviews student task guides before publication, especially where one wrong click could affect registration, results, or academic records."
      updated="6 July 2026"
    >
      <h2>What this desk reviews</h2>
      <ul>
        <li>Portal login, recovery, and dashboard guides</li>
        <li>Course registration and semester step-by-step guides</li>
        <li>Results, statement-of-result, and academic-record pages</li>
        <li>eLearn and TMA step-by-step explanations</li>
      </ul>
      <h2>How reviews are done</h2>
      <p>
        The desk checks visible official routes, compares article wording with the student task the
        guide is trying to solve, and removes any sentence that sounds more certain than the
        available evidence.
      </p>
      <h2>What the desk does not claim</h2>
      <p>
        The desk does not claim official university authority, private account access, or the power
        to make academic decisions. Students should still confirm final account-specific details
        through official NOUN channels.
      </p>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profileSchema) }} />
    </TrustPage>
  );
}
