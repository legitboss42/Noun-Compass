import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/platform/auth";
import { signOut } from "@/app/account/actions";

export const metadata: Metadata = {
  title: "Student Dashboard",
  alternates: null,
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireUser("/dashboard");
  return <main id="main-content" className="platform-shell"><div className="container platform-layout"><aside className="platform-sidebar"><span className="eyebrow">Student workspace</span><nav aria-label="Student dashboard"><Link href="/dashboard">Overview</Link><Link href="/dashboard/profile">Semester setup</Link><Link href="/dashboard/practice">Exam preparation</Link><Link href="/dashboard/support">Support</Link><Link href="/membership">Membership</Link></nav><form action={signOut}><button type="submit">Sign out</button></form></aside><div className="platform-main">{children}</div></div></main>;
}
