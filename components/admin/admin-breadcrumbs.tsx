"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const labels: Record<string, string> = {
  admin: "Administration",
  users: "Users",
  memberships: "Memberships",
  payments: "Payments",
  questions: "Questions",
  articles: "Articles",
  support: "Support",
  analytics: "Analytics",
  settings: "Settings",
  schedules: "Schedules",
  "audit-log": "Audit log",
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) return null;

  return (
    <nav className="admin-breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const current = index === segments.length - 1;
          const label =
            labels[segment] ??
            (segment.length > 18 ? "Record" : segment.replaceAll("-", " "));
          return (
            <li key={href}>
              {current ? (
                <span aria-current="page">{label}</span>
              ) : (
                <Link href={href}>{label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
