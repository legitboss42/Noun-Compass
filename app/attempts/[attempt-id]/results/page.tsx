import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { signOut } from "@/app/account/actions";
import { StudentMobileBottomNavigation, StudentMobileHeader } from "@/components/student-mobile-navigation";
import { requireUser } from "@/lib/platform/auth";
import { createQuestionStore, StoreError } from "@/lib/platform/question-store";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Practice Results",
  robots: { index: false, follow: false },
  alternates: null,
};

export default async function AttemptResultsPage({ params }: { params: Promise<{ "attempt-id": string }> }) {
  const user = await requireUser("/dashboard/practice");
  let result;
  try {
    result = await createQuestionStore().complete(user.id, (await params)["attempt-id"]);
  } catch (error) {
    if (error instanceof StoreError && error.status === 404) notFound();
    throw error;
  }

  const supabase = await createClient();
  const { data: profile } = (await supabase
    ?.from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle()) ?? { data: null };

  return (
    <main id="main-content" className="platform-shell attempt-results-shell" data-auth-shell="student">
      <StudentMobileHeader displayName={profile?.display_name} email={user.email} signOutAction={signOut} />
      <div className="container narrow attempt-results-content">
        <Link className="attempt-back-link" href="/dashboard/practice">&larr; Back to practice</Link>
        <section className="platform-heading attempt-score-card">
          <div><span className="eyebrow">Completed attempt</span><h1>{result.score}%</h1><p>{result.correct} correct from {result.total} questions; {result.answered} answered.</p></div>
          <Link className="button" href="/dashboard/practice">Start another session</Link>
        </section>
        <section className="platform-panel">
          <div className="section-heading"><div><span className="eyebrow">Answer review</span><h2>Learn from every question</h2></div></div>
          <div className="platform-ticket-list attempt-review-list">
            {result.review.map((item, index) => (
              <article key={item.questionVersionId}>
                <div><strong>{index + 1}. {item.prompt}</strong><span>{item.correct ? "Correct" : "Needs review"}</span></div>
                <p><strong>Your answer:</strong> {item.selectedAnswer}</p>
                <p><strong>Correct answer:</strong> {item.correctAnswer}</p>
                <p>{item.explanation}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
      <StudentMobileBottomNavigation />
    </main>
  );
}
