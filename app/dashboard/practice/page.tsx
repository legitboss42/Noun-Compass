import Link from "next/link";
import { PracticeRunner } from "@/components/practice-runner";
import { requireUser } from "@/lib/platform/auth";
import { membershipIsActive } from "@/lib/platform/membership";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPracticePage() {
  const user = await requireUser("/dashboard/practice");
  const supabase = await createClient();
  const [{ data: banks }, { data: membership }] = supabase ? await Promise.all([
    supabase.from("question_banks").select("course_code,course_title").eq("status", "published").order("course_code"),
    supabase.from("memberships").select("status,ends_at").eq("user_id", user.id).order("ends_at", { ascending: false }).limit(1).maybeSingle(),
  ]) : [{ data: [] }, { data: null }];
  const premium = membershipIsActive(membership?.status, membership?.ends_at);
  return <><header className="platform-heading"><div><span className="eyebrow">Original exam preparation</span><h1>Practice and revise</h1><p>Published banks use original reviewed questions. Incorrect answers return to the first revision box; correct answers move through 1, 3, 7, 14, and 30-day intervals.</p></div>{!premium && <Link className="button" href="/membership">See semester pass</Link>}</header><PracticeRunner banks={banks ?? []} premium={premium} /></>;
}
