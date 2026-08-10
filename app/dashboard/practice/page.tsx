import Link from "next/link";

import { requireUser } from "@/lib/platform/auth";
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

function formatWhen(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(new Date(value));
}

export default async function DashboardPracticePage() {
  const user = await requireUser("/dashboard/practice");
  const admin = createAdminClient();
  const { data: aiSessions } = admin
    ? await admin
        .from("ai_practice_sessions")
        .select("id,course_code,course_title,mode,status,score,question_count,created_at,completed_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)
    : { data: [] };

  const history = (aiSessions ?? []) as AiPracticeHistoryRow[];
  const completed = history.filter((session) => session.status === "completed");
  const unfinished = history.filter(
    (session) => session.status === "active" || session.status === "generating",
  );
  const latestScore = completed.find((session) => session.score !== null);
  const averageScore = completed.length
    ? Math.round(
        completed.reduce((total, session) => total + (session.score ?? 0), 0) / completed.length,
      )
    : null;

  return (
    <>
      <header className="platform-heading">
        <div>
          <span className="eyebrow">Practice history</span>
          <h1>Your exam practice record</h1>
          <p>
            Every Practice Exam you generate from your registered course
            materials is saved here with its score and answer review.
          </p>
        </div>
        <div className="platform-form-actions">
          <Link className="button" href="/dashboard/ai-practice">Open Practice Exam</Link>
          <Link className="button button-secondary" href="/course-materials">Open course materials</Link>
        </div>
      </header>

      <section className="platform-stat-grid" aria-label="Practice progress">
        <article><span>Completed</span><strong>{completed.length}</strong><small>Attempts you finished and scored</small></article>
        <article><span>Unfinished</span><strong>{unfinished.length}</strong><small>Tests you can still continue</small></article>
        <article><span>Latest score</span><strong>{latestScore ? `${latestScore.score}%` : "-"}</strong><small>From your most recent completed test</small></article>
        <article><span>Average score</span><strong>{averageScore === null ? "-" : `${averageScore}%`}</strong><small>Across your completed tests</small></article>
      </section>

      <section className="platform-panel">
        <div className="platform-panel-heading">
          <div>
            <span className="eyebrow">Saved to your profile</span>
            <h2>Practice Exam history</h2>
          </div>
          <Link href="/dashboard/ai-practice">Generate new practice exam</Link>
        </div>
        {history.length ? (
          <div className="platform-ticket-list">
            {history.map((session) => (
              <article key={session.id}>
                <div>
                  <strong>
                    {session.course_code ?? "Course"} - {session.course_title ?? "Practice Exam"}
                  </strong>
                  <span>{session.status ?? "started"}</span>
                </div>
                <small>
                  {session.score === null ? "No score yet" : `${session.score}%`} - {String(session.question_count ?? 0)} questions - {String(session.mode ?? "practice")} - {formatWhen(session.created_at)}
                </small>
                {session.status === "active" || session.status === "generating" || session.status === "failed" ? (
                  <Link href={`/dashboard/ai-practice?session=${session.id}`}>
                    {session.status === "active" ? "Continue test" : "Resume generation"}
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="eyebrow">No practice exams yet</span>
            <h3>Generate your first Practice Exam</h3>
            <p>
              Pick a course you have registered, and NounCompass builds a test
              from its official course material. Your score and answer review
              are saved here afterwards.
            </p>
            <Link className="button" href="/dashboard/ai-practice">Start your first test</Link>
          </div>
        )}
      </section>
    </>
  );
}
