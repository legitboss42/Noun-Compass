import Link from "next/link";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata(
  "Student Finance Review Desk",
  "Learn how the Student Finance Review Desk checks NOUN Compass school-fee, Remita, e-wallet, refund, and NELFUND guides.",
  "/reviewers/student-finance",
);

export default function Page() {
  return (
    <main id="main-content" className="trust-page">
      <section className="container section">
        <span className="eyebrow">Review desk</span>
        <h1>Student Finance Review Desk</h1>
        <p>
          The Student Finance Review Desk reviews guides about NOUN fees,
          Remita references, e-wallet balances, refunds, payment evidence, and
          NELFUND-related student finance workflows.
        </p>
        <h2>Review focus</h2>
        <p>
          The desk checks that financial guidance stays cautious, avoids
          promising outcomes, and tells students to rely on their official
          portal bill, receipt, and payment record before making decisions.
        </p>
        <h2>Report an issue</h2>
        <p>
          If a fee, payment, or finance workflow appears outdated, report it
          through the <Link href="/contact">contact page</Link> so the guide can
          be reviewed.
        </p>
      </section>
    </main>
  );
}
