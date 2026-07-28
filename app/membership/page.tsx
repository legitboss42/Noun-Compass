import Link from "next/link";
import { CheckoutButton } from "@/components/checkout-button";
import { Breadcrumbs } from "@/components/article-elements";
import { isCheckoutAvailable, platformConfig } from "@/lib/platform/config";
import { createMetadata } from "@/lib/metadata";
import { getCurrentUser } from "@/lib/platform/auth";
import { membershipIsActive } from "@/lib/platform/membership";
import { createClient } from "@/lib/supabase/server";

export const metadata = createMetadata("NOUN Compass Semester Pass", "See what is free and what the optional 180-day NounCompass exam-preparation pass includes.", "/membership");

export default async function MembershipPage() {
  const user = await getCurrentUser();
  const supabase = user ? await createClient() : null;
  const { data: membership } =
    user && supabase
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
    return <main id="main-content" className="experience-page"><div className="category-hero"><div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Membership" }]} /><span className="eyebrow">Semester Pass active</span><h1>Your premium tools are ready</h1><p>Your Semester Pass is active{accessEnd ? ` until ${accessEnd}` : ""}. Use this page as a quick guide to the premium features already available in your account.</p></div></div><section className="container section membership-layout membership-active-layout"><article className="membership-card"><span className="membership-pill">Active access</span><span className="eyebrow">How to use premium well</span><h2>Make each study session count</h2><ul><li>Generate Practice Exams from your registered course materials.</li><li>Create Exam summaries before revision sessions.</li><li>Use timed practice and saved explanations where available.</li><li>Save study sessions to your calendar and keep reminders enabled.</li><li>Review Practice history after every attempt.</li></ul><Link className="button" href="/dashboard/ai-practice">Open Practice Exam</Link><Link href="/dashboard/material-summaries">Open Exam summaries</Link></article><div className="membership-comparison"><section><span className="membership-section-icon" aria-hidden="true">01</span><h2>Start with your real courses</h2><p>Keep your dashboard course list current so Practice Exams and Exam summaries show the materials that matter to your semester.</p><ul><li><Link href="/dashboard/profile">Update registered courses</Link></li><li><Link href="/dashboard/material-summaries">Open Exam summaries</Link></li><li><Link href="/dashboard/ai-practice">Generate Practice Exam</Link></li></ul></section><section><span className="membership-section-icon" aria-hidden="true">02</span><h2>Turn summaries into revision</h2><p>Use each summary as a study map, then test yourself. The summaries are grounded study aids, not official exam forecasts.</p><ul><li>Read the high-yield areas first.</li><li>Write short answers from memory.</li><li>Use Practice Exam sessions to test weak topics.</li></ul></section><aside className="trust-note"><strong>No extra purchase needed</strong><p>You already have active premium access. NounCompass will not ask you to buy the Semester Pass again while this membership remains active.</p><Link href="/dashboard">Return to dashboard</Link></aside></div></section></main>;
  }

  return <main id="main-content" className="experience-page"><div className="category-hero"><div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Membership" }]} /><span className="eyebrow">Optional exam-preparation access</span><h1>Get more from every study session</h1><p>Core student guides, official resource links, calculators, and planning tools stay free. The Semester Pass adds deeper Practice Exam sessions, Exam summaries, explanations, and revision tracking.</p></div></div><section className="container section membership-layout"><article className="membership-card"><span className="membership-pill">One-time payment</span><span className="eyebrow">Semester Pass</span><div className="membership-price"><strong>NGN 2,500</strong><span>one payment</span></div><p>180 days of premium access. No automatic renewal and no recurring charge.</p><ul><li>Practice Exams from registered course materials</li><li>Exam summary PDF output</li><li>Detailed explanations</li><li>Weak-topic and revision tracking</li><li>Progress exports and reminders</li></ul><CheckoutButton available={isCheckoutAvailable()} /><small>Secure payment through Flutterwave. Transaction charges are covered by NounCompass.</small></article><div className="membership-comparison"><section><span className="membership-section-icon" aria-hidden="true">01</span><h2>Useful without paying</h2><p>Your essential student information and planning tools stay open.</p><ul><li>Public student guides</li><li>Official course-material links</li><li>Fee, CGPA, result, and study tools</li><li>Basic semester dashboard</li><li>Published timetable matching</li></ul></section><section><span className="membership-section-icon" aria-hidden="true">02</span><h2>More focused with the pass</h2><p>Premium access supports repeated practice and structured revision.</p><ul><li>Higher Practice Exam limits</li><li>Exam summary PDFs</li><li>Complete explanations and performance history</li><li>Five-box revision scheduling</li><li>Cross-device preparation progress</li></ul></section><aside className="trust-note"><strong>Built for honest preparation</strong><p>The pass does not buy active TMA answers, leaked examinations, guaranteed grades, or access to NOUN systems.</p><Link href="/terms">Read the membership terms</Link></aside></div></section><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Offer", name: "NOUN Compass Semester Pass", price: platformConfig.semesterPass.amountKobo / 100, priceCurrency: "NGN", description: "180 days of optional premium exam-preparation access", url: "https://nouncompass.me/membership" }) }} /></main>;
}
