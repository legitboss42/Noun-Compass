import Link from "next/link";

import { PracticeRunner } from "@/components/practice-runner";
import { requireUser } from "@/lib/platform/auth";
import { createQuestionStore } from "@/lib/platform/question-store";
import { createAdminClient } from "@/lib/supabase/admin";

type AiPracticeHistoryRow = {
  id: string;
  course_code: string | null;
  course_title: string | null;
  mode: string | null;
  status: string | null;
  score: number | null;
  question_count: number | null;
  created_at: string;
  completed_at: string | null;
};

export default async function DashboardPracticePage() {
  const user = await requireUser("/dashboard/practice");
  const { banks, premium, dueCount, sessions } = await createQuestionStore().dashboard(user.id);
  const admin = createAdminClient();
  const { data: aiSessions } = admin
    ? await admin
        .from("ai_practice_sessions")
        .select("id,course_code,course_title,mode,status,score,question_count,created_at,completed_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)
    : { data: [] };
  const completed = sessions.find((session) => session.status === "completed");
  const aiHistory = (aiSessions ?? []) as AiPracticeHistoryRow[];

  return (
    <>
      <header className="platform-heading">
        <div>
          <span className="eyebrow">Exam preparation</span>
          <h1>Practice and revise</h1>
          <p>
            Published banks use original questions that have been checked before release. Incorrect answers return to the first revision box;
            correct answers move through 1, 3, 7, 14, and 30-day intervals.
          </p>
        </div>
        <div className="platform-form-actions">
          <Link className="button" href="/dashboard/ai-practice">Generate AI practice</Link>
          {!premium && <Link className="button button-secondary" href="/membership">See semester pass</Link>}
        </div>
      </header>

      <section className="platform-stat-grid" aria-label="Practice progress">
        <article><span>Revision due</span><strong>{dueCount}</strong><small>Questions scheduled for review now</small></article>
        <article><span>Sessions</span><strong>{sessions.length}</strong><small>Your ten most recent sessions</small></article>
        <article><span>AI practice</span><strong>{aiHistory.length}</strong><small>Your ten most recent generated sessions</small></article>
        <article><span>Latest score</span><strong>{completed ? `${String(completed.score)}%` : "-"}</strong><small>From your most recent completed session</small></article>
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
                    <strong>{bank?.course_code ?? "Course"} - {String(session.mode)}</strong>
                    <span>{String(session.status)}</span>
                  </div>
                  <small>
                    {session.score === null ? "No score yet" : `${String(session.score)}%`} - {String(session.question_count)} questions - {new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" }).format(new Date(String(session.started_at)))}
                  </small>
                  {session.status === "completed" ? <Link href={`/attempts/${String(session.id)}/results`}>View results</Link> : null}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="platform-panel">
        <div className="platform-panel-heading">
          <div>
            <span className="eyebrow">Saved to your profile</span>
            <h2>AI practice history</h2>
          </div>
          <Link href="/dashboard/ai-practice">Generate new practice</Link>
        </div>
        {aiHistory.length ? (
          <div className="platform-ticket-list">
            {aiHistory.map((session) => (
              <article key={session.id}>
                <div>
                  <strong>
                    {session.course_code ?? "Course"} - {session.course_title ?? "AI practice"}
                  </strong>
                  <span>{session.status ?? "started"}</span>
                </div>
                <small>
                  {session.score === null ? "No score yet" : `${session.score}%`} - {String(session.question_count ?? 0)} questions - {String(session.mode ?? "practice")} - {new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" }).format(new Date(session.created_at))}
                </small>
                {session.status === "active" ? (
                  <Link href={`/dashboard/ai-practice?session=${session.id}`}>Continue test</Link>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <p>No AI-generated practice sessions yet.</p>
        )}
      </section>
    </>
  );
}
