import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "@/app/account/actions";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { BrandLogo } from "@/components/BrandLogo";
import { PlatformNavigation } from "@/components/platform-navigation";
import { hasAdminPermission, type AdminPermission } from "@/lib/platform/admin-permissions";
import { requireAdmin } from "@/lib/platform/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import "./admin.css";

export const metadata: Metadata = {
  title: "NounCompass Administration",
  alternates: null,
  robots: { index: false, follow: false },
};

const links: readonly (readonly [string, string, AdminPermission])[] = [
  ["Overview", "/admin", "overview.read"],
  ["Users", "/admin/users", "users.read"],
  ["Memberships", "/admin/memberships", "memberships.read"],
  ["Payments", "/admin/payments", "payments.read"],
  ["Questions", "/admin/questions", "questions.read"],
  ["Articles", "/admin/articles", "articles.read"],
  ["Support", "/admin/support", "support.read"],
  ["Analytics", "/admin/analytics", "analytics.read"],
  ["Schedules", "/admin/schedules", "schedules.write"],
  ["Settings", "/admin/settings", "settings.read"],
  ["Audit log", "/admin/audit-log", "audit.read"],
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin("/admin");
  const allowedLinks = links
    .filter(([, , permission]) => hasAdminPermission(session.roles, permission))
    .map(([label, href]) => [label, href] as const);
  const admin = createAdminClient();
  const { data: profile } = await admin
    ?.from("profiles")
    .select("display_name")
    .eq("id", session.user.id)
    .maybeSingle() ?? { data: null };

  return (
    <main id="main-content" className="admin-shell">
      <div className="container admin-layout">
        <aside className="admin-sidebar">
          <Link className="admin-brand" href="/admin" aria-label="NounCompass administration">
            <BrandLogo tone="light" />
          </Link>
          <PlatformNavigation ariaLabel="Administration" links={allowedLinks} />
          <div className="admin-identity">
            <strong>{profile?.display_name || "Administrator"}</strong>
            <small>{session.user.email ?? "Authenticated account"}</small>
            <div className="admin-role-list">
              {session.roles.filter((role) => role !== "student").map((role) => (
                <span key={role}>{role.replaceAll("_", " ")}</span>
              ))}
            </div>
          </div>
          <div className="admin-sidebar-footer">
            <Link href="/dashboard">Student dashboard</Link>
            <form action={signOut}>
              <button type="submit">Sign out</button>
            </form>
          </div>
        </aside>
        <div className="admin-main">
          <details className="admin-mobile-bar">
            <summary>Administration menu</summary>
            <PlatformNavigation ariaLabel="Mobile administration" links={allowedLinks} />
          </details>
          <AdminBreadcrumbs />
          {children}
        </div>
      </div>
    </main>
  );
}
