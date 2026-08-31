import Link from "next/link";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata(
  "Student Workflow Review Desk",
  "Learn how the Student Workflow Review Desk checks NOUN Compass portal, registration, results, and support workflow guides.",
  "/reviewers/student-workflow",
);

export default function Page() {
  return (
    <main id="main-content" className="trust-page">
      <section className="container section">
        <span className="eyebrow">Review desk</span>
        <h1>Student Workflow Review Desk</h1>
        <p>
          The Student Workflow Review Desk reviews guides about NOUN portal
          access, course registration, results, eLearn, TMA activity, study
          centres, and support workflows.
        </p>
        <h2>Review focus</h2>
        <p>
          The desk checks whether each guide explains the likely student task,
          avoids account-specific promises, and reminds readers to confirm final
          status inside their own official NOUN record.
        </p>
        <h2>Report an issue</h2>
        <p>
          If a workflow has changed or a guide no longer matches the current
          portal flow, send a correction through the{" "}
          <Link href="/contact">contact page</Link>.
        </p>
      </section>
    </main>
  );
}
