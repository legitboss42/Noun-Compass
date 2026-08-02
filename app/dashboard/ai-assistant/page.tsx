import type { Metadata } from "next";
import { StudentAiAssistant } from "@/components/student-ai-assistant";
import { listAiPracticeMaterialsForCourseCodes } from "@/lib/platform/ai-practice-materials";
import { requireUser } from "@/lib/platform/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Study Assistant", robots: { index: false, follow: false }, alternates: null };
export const dynamic = "force-dynamic";

export default async function AiAssistantPage() {
  const user = await requireUser("/dashboard/ai-assistant");
  const admin = createAdminClient();
  if (!admin) throw new Error("Assistant storage is not configured.");
  const [{ data: profile }, { data: completed }] = await Promise.all([
    admin.from("profiles").select("selected_course_codes").eq("id", user.id).maybeSingle(),
    admin.from("ai_practice_sessions")
      .select("id,course_code,course_title,generated_questions,completed_at")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(5),
  ]);
  const materials = listAiPracticeMaterialsForCourseCodes((profile?.selected_course_codes ?? []) as string[])
    .map((material) => ({ key: material.key, code: material.code, title: material.title }));
  const sessions = (completed ?? []).map((session) => ({
    id: session.id,
    courseCode: session.course_code,
    label: `${session.course_title} · ${new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeZone: "Africa/Lagos" }).format(new Date(session.completed_at))}`,
    questions: ((session.generated_questions ?? []) as Array<{ id: string; prompt: string }>).map((question) => ({ id: question.id, prompt: question.prompt })),
  }));
  return <><header className="platform-heading"><div><span className="eyebrow">Grounded student AI</span><h1>Study assistant</h1><p>Use your registered course materials, saved tool results, and completed Practice Exams without giving the AI unrestricted access to your account.</p></div></header><StudentAiAssistant materials={materials} sessions={sessions} /></>;
}
