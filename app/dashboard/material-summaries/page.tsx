import Link from "next/link";
import type { Metadata } from "next";
import { CourseMaterialSummaryTool } from "@/components/course-material-summary-tool";
import { courseMaterials } from "@/lib/course-materials";
import { materialKeyForIndex } from "@/lib/platform/ai-practice-materials";
import { normalizeCourseCode } from "@/lib/platform/course-codes";
import { membershipIsActive } from "@/lib/platform/membership";
import { requireUser } from "@/lib/platform/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Exam Summaries",
  alternates: null,
  robots: { index: false, follow: false },
};

export default async function MaterialSummariesPage() {
  const user = await requireUser("/dashboard/material-summaries");
  const supabase = await createClient();
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
      .gt("ends_at", new Date().toISOString())
      .order("ends_at", { ascending: false })
      .limit(1)
      .maybeSingle() ?? Promise.resolve({ data: null }),
  ]);

  const premium = membershipIsActive(membership?.status, membership?.ends_at);
  const registeredCourseCodes = new Set(
    Array.isArray(profile?.selected_course_codes)
      ? profile.selected_course_codes.map((code) => normalizeCourseCode(String(code))).filter(Boolean)
      : [],
  );
  const registeredMaterials = courseMaterials
    .map((material, index) => ({ material, materialKey: materialKeyForIndex(index) }))
    .filter(({ material }) => registeredCourseCodes.has(normalizeCourseCode(material.code)));

  return (
    <>
      <header className="platform-heading">
        <div>
          <span className="eyebrow">Premium study support</span>
          <h1>Exam summaries</h1>
          <p>
            Generate exam-focused PDF-ready summaries only from the official
            materials linked to courses saved in your dashboard.
          </p>
        </div>
      </header>

      {!registeredCourseCodes.size ? (
        <section className="platform-panel">
          <span className="eyebrow">Semester setup required</span>
          <h2>Add your registered courses first</h2>
          <p>
            Exam summaries are restricted to your saved dashboard courses. Add
            the course codes from your current registration record, then return
            here.
          </p>
          <Link className="button" href="/dashboard/profile">Add registered courses</Link>
        </section>
      ) : registeredMaterials.length ? (
        <section className="platform-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Available materials</span>
              <h2>Your registered course materials</h2>
            </div>
            <Link href="/course-materials">Open full library</Link>
          </div>
          <div className="platform-course-grid">
            {registeredMaterials.map(({ material, materialKey }) => (
              <article key={`${material.code}-${material.url}`}>
                <span>{material.sourceFaculty}</span>
                <h3>{material.code}: {material.title}</h3>
                <p>
                  {[material.level && `${material.level} level`, material.semester && `${material.semester} semester`, material.creditUnits && `${material.creditUnits} units`]
                    .filter(Boolean)
                    .join(" · ") || "Registered course material"}
                </p>
                <div className="course-prep-actions">
                  <Link href={`/course-materials?q=${encodeURIComponent(material.code)}`}>Open material</Link>
                  <CourseMaterialSummaryTool
                    materialKey={materialKey}
                    premium={premium}
                    registered
                    signedIn
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="platform-panel">
          <span className="eyebrow">No matched material yet</span>
          <h2>No official material match for your saved courses</h2>
          <p>
            Your dashboard courses are saved, but this library has not matched
            an official material for them yet. You can search the full material
            library or update your course codes if one was entered incorrectly.
          </p>
          <div className="course-prep-actions">
            <Link className="button" href="/course-materials">Search course materials</Link>
            <Link href="/dashboard/profile">Update registered courses</Link>
          </div>
        </section>
      )}

      <aside className="trust-note">
        <strong>Access rule</strong>
        <p>
          Exam summaries are premium-only and limited to your registered dashboard
          courses. They are study aids, not official exam forecasts.
        </p>
      </aside>
    </>
  );
}
