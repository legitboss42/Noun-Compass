import Link from "next/link";
import { Breadcrumbs, DisclaimerBox } from "@/components/article-elements";
import { StudyPlanner } from "@/components/study-planner";
import { createMetadata } from "@/lib/metadata";
import { requireUser } from "@/lib/platform/auth";
import { getStudyPlannerPremiumState } from "@/lib/platform/study-planner-access";
import { createClient } from "@/lib/supabase/server";
import { studyPlannerCoursesForCodes, studyPlannerStats } from "@/lib/study-planner-catalog";

export const metadata = createMetadata(
  "NOUN Study Planner and Reading Timetable Generator",
  "Build a personalized weekly NOUN study timetable using your courses, availability, and study rhythm.",
  "/tools/study-planner",
);

export default async function StudyPlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const params = await searchParams;
  const user = await requireUser("/tools/study-planner");
  const premium = await getStudyPlannerPremiumState(user.id);
  const supabase = await createClient();
  const [{ data: profile }, { data: savedPlan }] = supabase
    ? await Promise.all([
        supabase
          .from("profiles")
          .select("selected_course_codes")
          .eq("id", user.id)
          .maybeSingle(),
        premium
          ? supabase
          .from("study_plans")
          .select("id,reminders_enabled")
          .eq("user_id", user.id)
          .maybeSingle()
          : Promise.resolve({ data: null }),
      ])
    : [{ data: null }, { data: null }];
  const { count: savedCalendarSessionCount } =
    premium && supabase && savedPlan
      ? await supabase
          .from("study_plan_sessions")
          .select("id", { count: "exact", head: true })
          .eq("plan_id", savedPlan.id)
          .eq("user_id", user.id)
      : { count: 0 };
  const savedSessionCutoff = new Date();
  savedSessionCutoff.setHours(savedSessionCutoff.getHours() - 1);
  const { data: savedCalendarSessions } =
    premium && supabase && savedPlan
      ? await supabase
          .from("study_plan_sessions")
          .select("id,title,course_code,course_title,starts_at,ends_at")
          .eq("plan_id", savedPlan.id)
          .eq("user_id", user.id)
          .gte("starts_at", savedSessionCutoff.toISOString())
          .order("starts_at", { ascending: true })
          .limit(10)
      : { data: [] };

  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "NOUN Study Planner",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    url: "https://nouncompass.me/tools/study-planner",
    description:
      "Generate a weekly reading timetable for NOUN courses using student availability, workdays, and suggested course data already available on NounCompass.",
  };

  return (
    <main id="main-content">
      <div className="category-hero">
        <div className="container">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Tools", href: "/tools" },
              { label: "Study Planner" },
            ]}
          />
          <span className="eyebrow">Plan with clarity</span>
          <h1>NOUN study planner</h1>
          <p>
            Create a realistic weekly reading timetable around your actual
            work-life schedule. Course suggestions come from the curriculum and
            material data already available on NounCompass, but your final
            registered course list should always come from official NOUN
            records.
          </p>
        </div>
      </div>

      <div className="container section">
        <StudyPlanner
          error={params.error}
          notice={params.notice}
          premium={premium}
          savedCalendarSessionCount={savedCalendarSessionCount ?? 0}
          savedCalendarSessions={savedCalendarSessions ?? []}
          stats={studyPlannerStats}
          remindersEnabled={savedPlan?.reminders_enabled ?? false}
          registeredCourses={studyPlannerCoursesForCodes((profile?.selected_course_codes ?? []) as string[])}
        />

        <div className="seo-intro">
          <h2>How to use this planner well</h2>
          <p>
            Use this tool to turn your selected courses, available hours, study
            rhythm, and preferred workload into a reading timetable you can
            actually follow from week to week.
          </p>
          <p>
            The planner does not connect to your student portal or confirm your
            final registration. Before you rely on a schedule, double-check your
            current course list, official deadlines, and any study materials you
            still need.
          </p>
          <p>
            Right now, the planner recognizes{" "}
            {studyPlannerStats.recognizedCourseCodes.toLocaleString()}{" "}
            curriculum-backed course codes.{" "}
            {studyPlannerStats.recognizedWithMaterials.toLocaleString()} already
            have at least one matching material in the library, while{" "}
            {studyPlannerStats.recognizedWithoutMaterials.toLocaleString()} do
            not yet have a downloadable match on NounCompass.
          </p>
        </div>

        <section className="related">
          <span className="eyebrow">Use with these guides</span>
          <h2>Keep your plan tied to your real courses</h2>
          <div>
            <Link href="/course-materials">
              <span>Study library</span>
              <strong>Course materials</strong>
              <small>
                Find the matching code and material before you build your week.
              </small>
            </Link>
            <Link href="/articles/how-to-register-noun-courses">
              <span>Registration help</span>
              <strong>Course registration guide</strong>
              <small>
                Confirm your actual registered courses before you plan around
                them.
              </small>
            </Link>
            <Link href="/student-guides">
              <span>More support</span>
              <strong>Student guides</strong>
              <small>
                Continue into registration, fees, results, and portal help.
              </small>
            </Link>
          </div>
        </section>

        <DisclaimerBox />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
      />
    </main>
  );
}
