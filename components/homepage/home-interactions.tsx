"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HomeIcon } from "@/components/homepage/home-icons";
import { homeNavigation } from "@/components/homepage/home-data";
import { useSignedInSession } from "@/lib/platform/use-auth-session";
import { createClient } from "@/lib/supabase/client";
import {
  getStudentNavigationKey,
  signedInStudentNavigation,
  signedOutMobileNavigation,
} from "@/lib/platform/student-navigation";
import styles from "@/components/homepage/homepage.module.css";

export function HomepageAuthLinks() {
  const signedIn = useSignedInSession();

  if (signedIn) {
    return (
      <Link className={styles.primaryHeaderAction} href="/dashboard">
        Dashboard
      </Link>
    );
  }

  return (
    <>
      <Link className={styles.signInAction} href="/account/sign-in">
        Sign in
      </Link>
      <Link className={styles.primaryHeaderAction} href="/account/sign-up">
        Get started
      </Link>
    </>
  );
}

export function PremiumAwareMembershipAction() {
  const signedIn = useSignedInSession();
  const [premium, setPremium] = useState(false);

  useEffect(() => {
    if (!signedIn) {
      return;
    }
    let active = true;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const userId = data.user?.id;
      if (!userId) return;
      const { data: membership } = await supabase
        .from("memberships")
        .select("status,ends_at")
        .eq("user_id", userId)
        .eq("status", "active")
        .gt("ends_at", new Date().toISOString())
        .order("ends_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!active) return;
      setPremium(Boolean(
        membership?.status === "active" &&
        membership.ends_at &&
        new Date(membership.ends_at).getTime() > Date.now(),
      ));
    }).catch(() => {});
    return () => {
      active = false;
    };
  }, [signedIn]);

  if (signedIn && premium) {
    return (
      <Link className={styles.primaryButton} href="/dashboard/practice">
        Use premium tools
        <HomeIcon name="arrow" size={18} />
      </Link>
    );
  }

  return (
    <Link className={styles.primaryButton} href="/membership">
      View Semester Pass
      <HomeIcon name="arrow" size={18} />
    </Link>
  );
}

export function HomepageDesktopNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className={styles.desktopNavigation}>
      {homeNavigation.map((item) => {
        const groupActive = item.items?.some(
          (subItem) =>
            pathname === subItem.href ||
            (subItem.href !== "/" && pathname.startsWith(`${subItem.href}/`)),
        );

        return item.items ? (
          <details className={styles.navigationGroup} key={item.label}>
            <summary aria-current={groupActive ? "page" : undefined}>
              {item.label}
            </summary>
            <div className={styles.navigationDropdown}>
              {item.items.map((subItem) => {
                const active =
                  pathname === subItem.href ||
                  (subItem.href !== "/" &&
                    pathname.startsWith(`${subItem.href}/`));

                return (
                  <Link
                    aria-current={active ? "page" : undefined}
                    href={subItem.href}
                    key={subItem.href}
                  >
                    {subItem.label}
                  </Link>
                );
              })}
            </div>
          </details>
        ) : (
          <Link
            aria-current={
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(`${item.href}/`))
                ? "page"
                : undefined
            }
            className={
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(`${item.href}/`))
                ? styles.navigationActive
                : undefined
            }
            href={item.href ?? "/"}
            key={item.label}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function HomepageMobileMenu() {
  const [open, setOpen] = useState(false);
  const signedIn = useSignedInSession();

  return (
    <div className={styles.mobileMenu}>
      <button
        aria-controls="homepage-mobile-menu"
        aria-expanded={open}
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        className={styles.mobileMenuButton}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <HomeIcon name="menu" />
      </button>
      {open && (
        <nav
          aria-label="Mobile navigation"
          className={styles.mobileMenuPanel}
          id="homepage-mobile-menu"
        >
          {homeNavigation.map((item) =>
            item.items ? (
              <details className={styles.mobileMenuGroup} key={item.label}>
                <summary>{item.label}</summary>
                <div>
                  {item.items.map((subItem) => (
                    <Link
                      href={subItem.href}
                      key={subItem.href}
                      onClick={() => setOpen(false)}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              </details>
            ) : (
              <Link
                href={item.href ?? "/"}
                key={item.label}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ),
          )}
          <div className={styles.mobileMenuAccount}>
            {signedIn ? (
              <Link href="/dashboard" onClick={() => setOpen(false)}>
                Open dashboard
              </Link>
            ) : (
              <>
                <Link href="/account/sign-in" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
                <Link href="/account/sign-up" onClick={() => setOpen(false)}>
                  Create free account
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}

export function MobileBottomNavigation() {
  const pathname = usePathname();
  const signedIn = useSignedInSession();
  const items = signedIn ? signedInStudentNavigation : signedOutMobileNavigation;
  const activeKey = getStudentNavigationKey(pathname, signedIn);

  return (
    <nav aria-label="Mobile quick navigation" className={styles.bottomNavigation}>
      {items.map((item) => {
        const active = activeKey === item.key;
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={active ? styles.bottomNavigationActive : undefined}
            href={item.href}
            key={item.key}
          >
            <HomeIcon name={item.icon} size={21} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
