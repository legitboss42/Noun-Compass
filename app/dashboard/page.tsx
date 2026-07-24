import Link from "next/link";
import { LocalProfileImport } from "@/components/local-profile-import";
import { requireUser } from "@/lib/platform/auth";
import { membershipIsActive } from "@/lib/platform/membership";
import { createClient } from "@/lib/supabase/server";
import { studyPlannerCatalog } from "@/lib/study-planner-catalog";
import {
  courseMaterialDownloadUrl,
  findCourseMaterial,
} from "@/lib/course-materials";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const user = await requireUser("/dashboard");
  const params = await searchParams;
  const feedback =
    params.notice === "forbidden"
      ? {
          message: "You don’t have permission to view that page.",
          className: "form-message form-message-error",
        }
      : params.notice
        ? {
            message: params.notice,
            className: "form-message form-message-success",
          }
        : null;
  const supabase = await createClient();
  const [
    { data: profile },
    { data: membership },
    { data: notices },
    { data: revisions },
  ] = supabase
    ? await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase
          .from("memberships")
          .select("status,starts_at,ends_at")
          .eq("user_id", user.id)
          .order("ends_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("notices")
          .select("id,title,body,source_url,expires_at")
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("revision_state")
          .select("question_id,due_at,box")
          .eq("user_id", user.id)
          .lte("due_at", new Date().toISOString())
          .limit(20),
      ])
    : [{ data: null }, { data: null }, { data: [] }, { data: [] }];

  const selectedCodes = (profile?.selected_course_codes ?? []) as string[];
  const { data: scheduleEntries } =
    supabase && selectedCodes.length
      ? await supabase
          .from("exam_schedule_entries")
          .select(
            "id,course_code,course_title,exam_date,starts_at,venue,exam_schedule_versions(label,exam_mode,source_url,academic_terms(name,session_code))",
          )
          .in("course_code", selectedCodes)
          .gte("exam_date", new Date().toISOString().slice(0, 10))
          .order("exam_date")
          .order("starts_at")
          .limit(30)
      : { data: [] };
  const courses = selectedCodes.map(
    (code) =>
      studyPlannerCatalog.find((course) => course.code === code) ?? {
        code,
        title: "Course not yet verified",
        units: null,
        materialAvailable: false,
        source: "material-library" as const,
        faculties: [],
      },
  );
  const premium = membershipIsActive(membership?.status, membership?.ends_at);

  return (
    <>
      <header className="platform-heading">
        <div>
          <span className="eyebrow">Semester overview</span>
          <h1>
            Welcome{profile?.display_name ? `, ${profile.display_name}` : ""}
          </h1>
          <p>
            See your selected courses, official resources, study progress, and
            the next step to take in one place.
          </p>
        </div>
        <Link className="button" href="/dashboard/profile">
          {profile?.onboarding_completed_at
            ? "Update semester"
            : "Set up semester"}
        </Link>
      </header>
      {feedback && (
        <p className={feedback.className} role="alert">
          {feedback.message}
        </p>
      )}
      <LocalProfileImport />
      <section className="platform-stat-grid" aria-label="Dashboard summary">
        <article>
          <span>Selected courses</span>
          <strong>{courses.length}</strong>
          <small>
            {courses.filter((course) => course.materialAvailable).length} with
            official materials indexed
          </small>
        </article>
        <article>
          <span>Revision due</span>
          <strong>{revisions?.length ?? 0}</strong>
          <small>Based on your five-box revision schedule</small>
        </article>
        <article>
          <span>Membership</span>
          <strong>{premium ? "Premium" : "Free"}</strong>
          <small>
            {premium && membership?.ends_at
              ? `Ends ${new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeZone: "Africa/Lagos" }).format(new Date(membership.ends_at))}`
              : "Core planning tools remain free"}
          </small>
        </article>
      </section>
      <section className="platform-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Your courses</span>
            <h2>Semester resources</h2>
          </div>
          <Link href="/course-materials">Search all materials</Link>
        </div>
        {courses.length ? (
          <div className="platform-course-grid">
            {courses.map((course) => {
              const material = findCourseMaterial(course.code, course.title);
              return (
                <article key={course.code}>
                  <div>
                    <strong>{course.code}</strong>
                    <span
                      className={`confidence confidence-${course.source === "curriculum" ? "verified" : "user"}`}
                    >
                      {course.source === "curriculum"
                        ? "Verified"
                        : "User-entered"}
                    </span>
                  </div>
                  <h3>{course.title}</h3>
                  <p>
                    {course.units
                      ? `${course.units} credit units`
                      : "Units not verified"}
                  </p>
                  {material ? (
                    <a href={courseMaterialDownloadUrl(material)}>
                      Open official material
                    </a>
                  ) : (
                    <Link href={`/course-materials?q=${course.code}`}>
                      Check material index
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <h2>No courses selected yet</h2>
            <p>
              Add your real registered course codes. NounCompass does not access
              your NOUN account.
            </p>
            <Link className="button" href="/dashboard/profile">
              Set up semester
            </Link>
          </div>
        )}
      </section>
      {scheduleEntries?.length ? (
        <section className="platform-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Published official schedule</span>
              <h2>Your upcoming examinations</h2>
            </div>
          </div>
          <div className="platform-ticket-list">
            {scheduleEntries.map((entry) => {
              const version = entry.exam_schedule_versions as unknown as {
                label: string;
                exam_mode: string;
                source_url: string;
                academic_terms: { name: string; session_code: string } | null;
              } | null;
              return (
                <article key={entry.id}>
                  <div>
                    <strong>
                      {entry.course_code} -{" "}
                      {entry.course_title || "Examination"}
                    </strong>
                    <span>{version?.exam_mode ?? "schedule"}</span>
                  </div>
                  <p>
                    {new Intl.DateTimeFormat("en-NG", {
                      dateStyle: "full",
                      timeZone: "Africa/Lagos",
                    }).format(
                      new Date(`${entry.exam_date}T00:00:00+01:00`),
                    )}{" "}
                    - {String(entry.starts_at).slice(0, 5)}
                    {entry.venue ? ` - ${entry.venue}` : ""}
                  </p>
                  {version?.source_url && (
                    <a
                      href={version.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Confirm official timetable source
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
      {notices?.length ? (
        <section className="platform-panel">
          <h2>Notices we have checked</h2>
          <div className="platform-notice-list">
            {notices.map((notice) => (
              <article key={notice.id}>
                <h3>{notice.title}</h3>
                <p>{notice.body}</p>
                {notice.source_url && (
                  <a
                    href={notice.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Confirm source
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>
      ) : null}
      <section className="platform-action-grid">
        <Link href="/fees">
          <strong>Estimate fees</strong>
          <span>
            Use programme and semester data, then confirm on your portal.
          </span>
        </Link>
        <Link href="/tools/cgpa-calculator">
          <strong>Check CGPA</strong>
          <span>Estimate grade points without storing result records.</span>
        </Link>
        <Link href="/tools/study-planner">
          <strong>Build study timetable</strong>
          <span>Plan reading around your actual free hours.</span>
        </Link>
        <Link href="/dashboard/practice">
          <strong>Prepare for exams</strong>
          <span>
            Use practice questions as more checked banks are released.
          </span>
        </Link>
      </section>
    </>
  );
}
