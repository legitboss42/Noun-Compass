"use client";

import type { ComponentProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { HomeIcon } from "@/components/homepage/home-icons";
import {
  getStudentNavigationKey,
  signedInStudentNavigation,
} from "@/lib/platform/student-navigation";

type StudentMobileHeaderProps = {
  displayName?: string | null;
  email?: string | null;
  signOutAction: ComponentProps<"form">["action"];
};

const drawerLinks = [
  ["Dashboard", "/dashboard"],
  ["Profile", "/dashboard/profile"],
  ["Exam preparation", "/dashboard/practice"],
  ["Study planner", "/tools/study-planner"],
  ["Course materials", "/course-materials"],
  ["Membership", "/membership"],
  ["Support", "/dashboard/support"],
  ["Public website", "/"],
] as const;

export function StudentMobileHeader({
  displayName,
  email,
  signOutAction,
}: StudentMobileHeaderProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="student-mobile-header">
      <Link className="student-mobile-brand" href="/dashboard" aria-label="Open dashboard">
        <BrandLogo variant="lockup" tone="light" priority />
      </Link>
      <button
        aria-controls="student-mobile-drawer"
        aria-expanded={open}
        aria-label={open ? "Close student menu" : "Open student menu"}
        className="student-mobile-menu-button"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <HomeIcon name="menu" size={23} />
      </button>
      {open ? (
        <div className="student-mobile-drawer" id="student-mobile-drawer">
          <div className="student-mobile-drawer-head">
            <strong>{displayName || "Student Workspace"}</strong>
            <small>{email || "Signed-in account"}</small>
          </div>
          <nav aria-label="Student workspace menu">
            {drawerLinks.map(([label, href]) => {
              const active =
                pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  data-active={active ? "true" : undefined}
                  href={href}
                  key={href}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <form action={signOutAction}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      ) : null}
    </header>
  );
}

export function StudentMobileBottomNavigation() {
  const pathname = usePathname();
  const activeKey = getStudentNavigationKey(pathname, true);

  return (
    <nav className="student-bottom-navigation" aria-label="Student quick navigation">
      {signedInStudentNavigation.map((item) => {
        const active = activeKey === item.key;
        return (
          <Link
            aria-current={active ? "page" : undefined}
            data-active={active ? "true" : undefined}
            href={item.href}
            key={item.key}
          >
            <HomeIcon name={item.icon} size={22} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
