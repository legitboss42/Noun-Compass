import Link from "next/link";

import { PracticeRunner } from "@/components/practice-runner";
import { requireUser } from "@/lib/platform/auth";
import { createQuestionStore } from "@/lib/platform/question-store";

export default async function DashboardPracticePage() {
  const user = await requireUser("/dashboard/practice");
  const { banks, premium, dueCount, sessions } = await createQuestionStore().dashboard(user.id);
  const completed = sessions.find((session) => session.status === "completed");

  return (
    <>
      <header className="platform-heading">
        <div>
          <span className="eyebrow">Original exam preparation</span>
          <h1>Practice and revise</h1>
          <p>
            Published banks use original reviewed questions. Incorrect answers return to the first revision box;
            correct answers move through 1, 3, 7, 14, and 30-day intervals.
          </p>
        </div>
        {!premium && <Link className="button" href="/membership">See semester pass</Link>}
      </header>

      <section className="platform-stat-grid" aria-label="Practice progress">
        <article><span>Revision due</span><strong>{dueCount}</strong><small>Questions scheduled for review now</small></article>
        <article><span>Sessions</span><strong>{sessions.length}</strong><small>Your ten most recent sessions</small></article>
        <article><span>Latest score</span><strong>{completed ? `${String(completed.score)}%` : "—"}</strong><small>Based on the complete session total</small></article>
      </section>

      <PracticeRunner banks={banks} premium={premium} dueCount={dueCount} />

      {sessions.length ? (
        <section className="platform-panel">
          <h2>Recent progress</h2>
          <div className="platform-ticket-list">
            {sessions.map((session) => {
              const bank = session.question_banks as { course_code?: string } | null;
              return (
                <article key={String(session.id)}>
                  <div>
                    <strong>{bank?.course_code ?? "Course"} · {String(session.mode)}</strong>
                    <span>{String(session.status)}</span>
                  </div>
                  <small>
                    {session.score === null ? "No score yet" : `${String(session.score)}%`} · {String(session.question_count)} questions · {new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" }).format(new Date(String(session.started_at)))}
                  </small>
                  {session.status === "completed" ? <Link href={`/attempts/${String(session.id)}/results`}>View results</Link> : null}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </>
  );
}
