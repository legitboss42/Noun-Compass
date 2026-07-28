import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/platform/auth";
import { examSummariesMaintenanceMessage } from "@/lib/platform/exam-summaries";

export const metadata: Metadata = {
  title: "Exam Summaries Maintenance",
  alternates: null,
  robots: { index: false, follow: false },
};

export default async function MaterialSummariesPage() {
  await requireUser("/dashboard/material-summaries");

  return (
    <>
      <header className="platform-heading">
        <div>
          <span className="eyebrow">Temporarily unavailable</span>
          <h1>Exam summaries are under maintenance</h1>
          <p>
            {examSummariesMaintenanceMessage} The first output was too shallow
            and did not meet the standard expected for a useful exam-focused
            study guide.
          </p>
        </div>
      </header>

      <section className="platform-panel">
        <span className="eyebrow">What is being fixed</span>
        <h2>The summary format needs a stronger academic structure</h2>
        <p>
          We are pausing generation until the template can produce deeper,
          course-specific guidance with better topic coverage, revision order,
          worked examples where relevant, and a cleaner downloadable PDF.
        </p>
        <div className="platform-action-grid">
          <Link href="/dashboard/ai-practice">
            <strong>Use Practice Exam</strong>
            <span>Generate practice questions from registered course materials.</span>
          </Link>
          <Link href="/course-materials">
            <strong>Open course materials</strong>
            <span>Download and study the official course PDFs directly.</span>
          </Link>
          <Link href="/dashboard">
            <strong>Return to dashboard</strong>
            <span>Continue with your current student workspace tools.</span>
          </Link>
        </div>
      </section>

      <aside className="trust-note">
        <strong>Quality rule</strong>
        <p>
          NounCompass should not present a generic AI outline as an exam summary.
          This feature will return only after the output is useful enough for
          paid members.
        </p>
      </aside>
    </>
  );
}
