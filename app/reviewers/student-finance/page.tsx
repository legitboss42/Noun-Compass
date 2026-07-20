import { TrustPage } from "@/components/trust-page";
import { site } from "@/data/site";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata(
  "Student Finance Review Desk",
  "Learn how the NOUN Compass Student Finance Review Desk checks NELFUND, payments, wallet, and fee guides.",
  "/reviewers/student-finance",
);

export default function Page() {
  const profileSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Organization",
      name: "Student Finance Review Desk",
      url: `${site.url}/reviewers/student-finance`,
      description:
        "The NOUN Compass review desk that checks NELFUND, fee payment, wallet, and finance guides.",
    },
  };

  return (
    <TrustPage
      title="Student Finance Review Desk"
      eyebrow="Finance Review Desk"
      intro="This desk reviews student-finance guides before publication, especially where a wrong assumption could affect payments, funding expectations, or wallet records."
      updated="6 July 2026"
    >
      <h2>What this desk reviews</h2>
      <ul>
        <li>NELFUND eligibility, status, and application guides</li>
        <li>School-fee, Remita, and e-wallet process guides</li>
        <li>Payment-reflection and finance-troubleshooting guides</li>
        <li>High-risk wording around deadlines, funding, and disbursement</li>
      </ul>
      <h2>How reviews are done</h2>
      <p>
        The desk checks current public finance steps, removes unsupported certainty around
        funding outcomes or timelines, and keeps the difference clear between confirmed steps and
        our explanation of them.
      </p>
      <h2>What the desk does not claim</h2>
      <p>
        The desk does not process payments, control NELFUND systems, or issue official financial
        decisions. Students should still confirm final payment and funding details through official
        channels.
      </p>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profileSchema) }} />
    </TrustPage>
  );
}
