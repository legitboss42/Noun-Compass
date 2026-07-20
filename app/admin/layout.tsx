import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/platform/auth";

export const metadata: Metadata = {
  title: "NounCompass Administration",
  alternates: null,
  robots: { index: false, follow: false },
};

const links = [
  ["Overview", "/admin"], ["Questions", "/admin/questions"], ["Schedules", "/admin/schedules"],
  ["Terms", "/admin/terms"], ["Notices", "/admin/notices"], ["Users", "/admin/users"],
  ["Memberships", "/admin/memberships"], ["Payments", "/admin/payments"], ["Support", "/admin/support"],
  ["Audit log", "/admin/audit-log"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["support_agent", "content_editor", "academic_reviewer", "super_admin"], "/admin");
  return <main id="main-content" className="platform-shell"><div className="container platform-layout platform-layout-admin"><aside className="platform-sidebar"><span className="eyebrow">Operations</span><nav aria-label="Administration">{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav><Link href="/dashboard">Student dashboard</Link></aside><div className="platform-main">{children}</div></div></main>;
}
