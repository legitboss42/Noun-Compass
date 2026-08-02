import Link from "next/link";
import { CheckoutButton } from "@/components/checkout-button";
import { Breadcrumbs } from "@/components/article-elements";
import { SectionScrollButton } from "@/components/section-scroll-button";
import { isCheckoutAvailable, platformConfig } from "@/lib/platform/config";
import { createMetadata } from "@/lib/metadata";
import { getCurrentUser } from "@/lib/platform/auth";
import { membershipIsActive } from "@/lib/platform/membership";
import { createClient } from "@/lib/supabase/server";

export const metadata = createMetadata(
  "NOUN Compass Semester Pass",
  "See what is free and what the optional 180-day NounCompass exam-preparation pass includes.",
  "/membership",
);

export default async function MembershipPage() {
  const user = await getCurrentUser();
  const supabase = user ? await createClient() : null;
  const { data: membership } = user && supabase
    ? await supabase
        .from("memberships")
        .select("status,ends_at")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gt("ends_at", new Date().toISOString())
        .order("ends_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };
  const premium = membershipIsActive(membership?.status, membership?.ends_at);
  const accessEnd = membership?.ends_at
    ? new Intl.DateTimeFormat("en-NG", { dateStyle: "long", timeZone: "Africa/Lagos" }).format(new Date(membership.ends_at))
    : "";

  if (premium) {
    return (
      <main id="main-content" className="experience-page membership-page membership-active-page">
        <div className="category-hero category-hero-enhanced membership-hero">
          <div className="container">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Membership" }]} />
            <span className="eyebrow">Semester Pass active</span>
            <h1>Your premium tools are ready</h1>
            <p>Your access is active{accessEnd ? ` until ${accessEnd}` : ""}. This page now focuses only on the features you already own and how to use them well.</p>
            <div className="category-hero-actions">
              <Link className="button" href="/dashboard/ai-practice">Start a Practice Exam</Link>
              <Link className="category-hero-secondary" href="/dashboard">Open dashboard <span aria-hidden="true">&rarr;</span></Link>
            </div>
            <aside className="category-hero-note"><strong>No extra purchase needed.</strong><span>NounCompass will not suggest another Semester Pass while your current access remains active.</span></aside>
          </div>
        </div>
        <section className="container section membership-layout membership-active-layout">
          <article className="membership-card">
            <span className="membership-pill">Active access</span>
            <span className="eyebrow">Your premium toolkit</span>
            <h2>Make each study session count</h2>
            <ul>
              <li>Generate Practice Exams from registered course materials.</li>
              <li>Use timed practice and saved explanations where available.</li>
              <li>Save study sessions to your calendar and enable reminders.</li>
              <li>Continue unfinished tests and review Practice history.</li>
              <li>Exam summaries are temporarily under maintenance.</li>
            </ul>
            <Link className="button" href="/dashboard/ai-practice">Open Practice Exam</Link>
            <Link href="/course-materials">Open course materials</Link>
          </article>
          <div className="membership-comparison">
            <section><span className="membership-section-icon" aria-hidden="true">01</span><h2>Start with your real courses</h2><p>Keep your registered-course list current so Practice Exam only shows materials that matter to this semester.</p><ul><li><Link href="/dashboard/profile">Update registered courses</Link></li><li><Link href="/course-materials">Open course materials</Link></li><li><Link href="/dashboard/ai-practice">Generate a Practice Exam</Link></li></ul></section>
            <section><span className="membership-section-icon" aria-hidden="true">02</span><h2>Turn each score into revision</h2><p>Use your saved result to identify weak topics, return to the official material, and continue unfinished attempts from Practice history.</p><ul><li>Review explanations after each attempt.</li><li>Write short answers from memory.</li><li>Schedule weak topics in the Study Planner.</li></ul></section>
            <aside className="trust-note"><strong>Keep your plan current</strong><p>Check your registered courses before each new semester and use the planner around the time you can realistically protect.</p><Link href="/tools/study-planner">Open Study Planner</Link></aside>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main id="main-content" className="experience-page membership-page">
      <div className="category-hero category-hero-enhanced membership-hero">
        <div className="container">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Membership" }]} />
          <span className="eyebrow">Optional exam-preparation access</span>
          <h1>Get more from every study session</h1>
          <p>Public student guides, official resource links, calculators, and planning tools remain available. The Semester Pass adds deeper Practice Exam sessions, explanations, and revision tracking.</p>
          <div className="category-hero-actions">
            <SectionScrollButton className="button" targetId="semester-pass-details">See what the pass includes</SectionScrollButton>
            <Link className="category-hero-secondary" href={user ? "/dashboard" : "/account/sign-in?next=/membership"}>{user ? "Return to dashboard" : "Sign in to your account"} <span aria-hidden="true">&rarr;</span></Link>
          </div>
          <aside className="category-hero-note"><strong>One payment, 180 days.</strong><span>No automatic renewal. Free public information is not placed behind the Semester Pass.</span></aside>
        </div>
      </div>
      <section id="semester-pass-details" className="container section membership-layout">
        <article className="membership-card">
          <span className="membership-pill">One-time payment</span>
          <span className="eyebrow">Semester Pass</span>
          <div className="membership-price"><strong>NGN 2,500</strong><span>one payment</span></div>
          <p>180 days of premium access. No automatic renewal and no recurring charge.</p>
          <ul><li>Practice Exams from registered course materials</li><li>Detailed explanations</li><li>Weak-topic and revision tracking</li><li>Progress history and calendar reminders</li><li>Exam summaries are temporarily under maintenance.</li></ul>
          <CheckoutButton available={isCheckoutAvailable()} />
          <small>Secure payment through Flutterwave. Transaction charges are covered by NounCompass.</small>
        </article>
        <div className="membership-comparison">
          <section><span className="membership-section-icon" aria-hidden="true">01</span><h2>Useful without paying</h2><p>Your essential student information and planning tools stay open.</p><ul><li>Public student guides</li><li>Official course-material links</li><li>Fee, CGPA, result, and study tools</li><li>Basic semester dashboard</li><li>Published timetable matching</li></ul></section>
          <section><span className="membership-section-icon" aria-hidden="true">02</span><h2>More focused with the pass</h2><p>Premium access supports repeated practice and structured revision.</p><ul><li>Higher Practice Exam limits</li><li>Complete explanations and performance history</li><li>Calendar export and reminders</li><li>Cross-device preparation progress</li></ul></section>
          <aside className="trust-note"><strong>Built for honest preparation</strong><p>The pass does not buy active TMA answers, leaked examinations, guaranteed grades, or access to NOUN systems.</p><Link href="/terms">Read the membership terms</Link></aside>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Offer", name: "NOUN Compass Semester Pass", price: platformConfig.semesterPass.amountKobo / 100, priceCurrency: "NGN", description: "180 days of optional premium exam-preparation access", url: "https://nouncompass.me/membership" }) }} />
    </main>
  );
}
