"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type PlatformNavigationProps = {
  ariaLabel: string;
  links: readonly (readonly [string, string])[];
};

export function PlatformNavigation({
  ariaLabel,
  links,
}: PlatformNavigationProps) {
  const pathname = usePathname();

  return (
    <nav aria-label={ariaLabel}>
      {links.map(([label, href]) => {
        const active =
          pathname === href ||
          (href !== "/dashboard" &&
            href !== "/admin" &&
            pathname.startsWith(`${href}/`));

        return (
          <Link
            aria-current={active ? "page" : undefined}
            data-active={active ? "true" : undefined}
            href={href}
            key={href}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
