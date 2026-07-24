import type { Metadata } from "next";
import { requireUser } from "@/lib/platform/auth";
import { signOut } from "@/app/account/actions";
import { PlatformNavigation } from "@/components/platform-navigation";
import { StudentMobileBottomNavigation, StudentMobileHeader } from "@/components/student-mobile-navigation";
import { createClient } from "@/lib/supabase/server";

const dashboardLinks = [
  ["Overview", "/dashboard"],
  ["Semester setup", "/dashboard/profile"],
  ["Exam preparation", "/dashboard/practice"],
  ["Support", "/dashboard/support"],
  ["Membership", "/membership"],
] as const;

export const metadata: Metadata = {
  title: "Student Dashboard",
  alternates: null,
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/dashboard");
  const supabase = await createClient();
  const { data: profile } = await supabase
    ?.from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle() ?? { data: null };

  return <main id="main-content" className="platform-shell" data-auth-shell="student"><StudentMobileHeader displayName={profile?.display_name} email={user.email} signOutAction={signOut} /><div className="container platform-layout"><aside className="platform-sidebar"><span className="eyebrow">Student workspace</span><PlatformNavigation ariaLabel="Student dashboard" links={dashboardLinks} /><form action={signOut}><button type="submit">Sign out</button></form></aside><div className="platform-main">{children}</div></div><StudentMobileBottomNavigation /></main>;
}
