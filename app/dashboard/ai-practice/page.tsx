import type { Metadata } from "next";
import Link from "next/link";
import { AiPracticeRunner } from "@/components/ai-practice-runner";
import { listAiPracticeMaterialsForCourseCodes } from "@/lib/platform/ai-practice-materials";
import { requireUser } from "@/lib/platform/auth";
import { membershipIsActive } from "@/lib/platform/membership";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Practice Exam",
  robots: { index: false, follow: false },
  alternates: null,
};

export default async function DashboardAiPracticePage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const user = await requireUser("/dashboard/ai-practice");
  const params = await searchParams;
  const supabase = await createClient();
  const now = new Date().toISOString();
  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase
      ?.from("profiles")
      .select("selected_course_codes")
      .eq("id", user.id)
      .maybeSingle() ?? Promise.resolve({ data: null }),
    supabase
      ?.from("memberships")
      .select("status,ends_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .gt("ends_at", now)
      .order("ends_at", { ascending: false })
      .limit(1)
      .maybeSingle() ?? Promise.resolve({ data: null }),
  ]);
  const selectedCodes = (profile?.selected_course_codes ?? []) as string[];
  const materials = listAiPracticeMaterialsForCourseCodes(selectedCodes);
  const premium = membershipIsActive(membership?.status, membership?.ends_at);

  return (
    <>
      <header className="platform-heading">
        <div>
          <span className="eyebrow">Practice exam</span>
          <h1>Generate a personal practice exam</h1>
          <p>
            Choose an official NOUN course material and NounCompass will generate a
            private practice set from the extracted material text. Published question
            banks remain human-reviewed separately.
          </p>
        </div>
      </header>
      <section className="platform-stat-grid" aria-label="Practice exam safeguards">
        <article>
          <span>Source controlled</span>
          <strong>Official</strong>
          <small>Only catalogue materials from NOUN eCourseware are accepted.</small>
        </article>
        <article>
          <span>Private practice</span>
          <strong>AI</strong>
          <small>Generated questions are for your session, not public publication.</small>
        </article>
        <article>
          <span>Semester Pass</span>
          <strong>{premium ? "Active" : "Free"}</strong>
          <small>
            {premium
              ? "Your paid access is active, so higher course-based question limits apply."
              : "Free accounts can generate one 15-question practice set per day."}
          </small>
        </article>
      </section>
      {materials.length ? (
        <AiPracticeRunner
          materials={materials}
          premium={premium}
          resumeSessionId={params.session}
        />
      ) : (
        <section className="platform-panel empty-state">
          <span className="eyebrow">Semester setup required</span>
          <h2>No registered course materials available yet</h2>
          <p>
            Add your registered course codes in the dashboard first. Practice Exam
            will then show only official materials that match those courses.
          </p>
          <Link className="button" href="/dashboard/profile">
            Add registered courses
          </Link>
        </section>
      )}
    </>
  );
}
