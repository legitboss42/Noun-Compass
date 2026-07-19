import Link from "next/link";
import { PracticeRunner } from "@/components/practice-runner";
import { requireUser } from "@/lib/platform/auth";
import { membershipIsActive } from "@/lib/platform/membership";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPracticePage() {
  const user = await requireUser("/dashboard/practice");
  const supabase = await createClient();
  const [{ data: banks }, { data: membership }, { count: dueCount }, { data: sessions }] = supabase ? await Promise.all([
    supabase.from("question_banks").select("course_code,course_title").eq("status", "published").order("course_code"),
    supabase.from("memberships").select("status,ends_at").eq("user_id", user.id).order("ends_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("revision_state").select("question_id", { count: "exact", head: true }).eq("user_id", user.id).lte("due_at", new Date().toISOString()),
    supabase.from("practice_sessions").select("id,mode,status,score,question_count,started_at,completed_at,question_banks(course_code)").eq("user_id", user.id).order("started_at", { ascending: false }).limit(10),
  ]) : [{ data: [] }, { data: null }, { count: 0 }, { data: [] }];
  const premium = membershipIsActive(membership?.status, membership?.ends_at);
  return <><header className="platform-heading"><div><span className="eyebrow">Original exam preparation</span><h1>Practice and revise</h1><p>Published banks use original reviewed questions. Incorrect answers return to the first revision box; correct answers move through 1, 3, 7, 14, and 30-day intervals.</p></div>{!premium && <Link className="button" href="/membership">See semester pass</Link>}</header><section className="platform-stat-grid" aria-label="Practice progress"><article><span>Revision due</span><strong>{dueCount ?? 0}</strong><small>Questions scheduled for review now</small></article><article><span>Sessions</span><strong>{sessions?.length ?? 0}</strong><small>Your ten most recent sessions</small></article><article><span>Latest score</span><strong>{sessions?.find((session) => session.status === "completed")?.score ?? "—"}{sessions?.some((session) => session.status === "completed") ? "%" : ""}</strong><small>Based on the complete session total</small></article></section><PracticeRunner banks={banks ?? []} premium={premium} dueCount={dueCount ?? 0} />{sessions?.length ? <section className="platform-panel"><h2>Recent progress</h2><div className="platform-ticket-list">{sessions.map((session) => { const bank = session.question_banks as unknown as { course_code: string } | null; return <article key={session.id}><div><strong>{bank?.course_code ?? "Course"} · {session.mode}</strong><span>{session.status}</span></div><small>{session.score === null ? "No score yet" : `${session.score}%`} · {session.question_count} questions · {new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" }).format(new Date(session.started_at))}</small></article>; })}</div></section> : null}</>;
}
