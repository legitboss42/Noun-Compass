import type { Metadata } from "next";
import { requireUser } from "@/lib/platform/auth";
import { signOut } from "@/app/account/actions";
import { PlatformNavigation } from "@/components/platform-navigation";

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
  await requireUser("/dashboard");
  return <main id="main-content" className="platform-shell"><div className="container platform-layout"><aside className="platform-sidebar"><span className="eyebrow">Student workspace</span><PlatformNavigation ariaLabel="Student dashboard" links={dashboardLinks} /><form action={signOut}><button type="submit">Sign out</button></form></aside><div className="platform-main">{children}</div></div></main>;
}
