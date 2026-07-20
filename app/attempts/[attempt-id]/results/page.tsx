import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/platform/auth";
import { createQuestionStore, StoreError } from "@/lib/platform/question-store";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Practice Results", robots: { index: false, follow: false }, alternates: null };

export default async function AttemptResultsPage({ params }: { params: Promise<{ "attempt-id": string }> }) {
  const user = await requireUser("/dashboard/practice");
  let result;
  try { result = await createQuestionStore().complete(user.id, (await params)["attempt-id"]); } catch (error) { if (error instanceof StoreError && error.status === 404) notFound(); throw error; }
  return <main id="main-content" className="platform-shell"><div className="container narrow section"><Link href="/dashboard/practice">← Back to practice</Link><section className="platform-panel"><span className="eyebrow">Completed attempt</span><h1>{result.score}%</h1><p>{result.correct} correct from {result.total} questions; {result.answered} answered.</p></section><div className="platform-ticket-list">{result.review.map((item, index) => <article key={item.questionVersionId}><div><strong>{index + 1}. {item.prompt}</strong><span>{item.correct ? "Correct" : "Needs review"}</span></div><p><strong>Your answer:</strong> {item.selectedAnswer}</p><p><strong>Correct answer:</strong> {item.correctAnswer}</p><p>{item.explanation}</p></article>)}</div></div></main>;
}
