import { NextResponse } from "next/server";
import { requireStudyPlannerPremium } from "@/lib/platform/study-planner-access";
import { buildStudyPlanIcs } from "@/lib/platform/study-planner-premium";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const user = await requireStudyPlannerPremium("/tools/study-planner");
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ message: "Platform database is not configured." }, { status: 503 });
  }

  const { data: plan } = await admin
    .from("study_plans")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!plan) {
    return NextResponse.json({ message: "Save a study plan before exporting a calendar file." }, { status: 404 });
  }

  const { data: sessions, error } = await admin
    .from("study_plan_sessions")
    .select("id,title,course_code,course_title,starts_at,ends_at")
    .eq("plan_id", plan.id)
    .eq("user_id", user.id)
    .gte("starts_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .order("starts_at", { ascending: true });

  if (error) {
    return NextResponse.json({ message: "Calendar sessions could not be loaded." }, { status: 500 });
  }

  if (!sessions?.length) {
    return NextResponse.json({ message: "There are no upcoming saved study sessions to export." }, { status: 404 });
  }

  return new Response(buildStudyPlanIcs({ sessions }), {
    headers: {
      "Content-Disposition": "attachment; filename=nouncompass-study-plan.ics",
      "Content-Type": "text/calendar; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}
