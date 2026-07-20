"use client";

import Link from "next/link";
import { useState } from "react";
import { navGroups } from "@/data/site";
import { useSignedInSession } from "@/lib/platform/use-auth-session";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const signedIn = useSignedInSession();

  return (
    <div className="mobile-menu">
      <button className="icon-button" type="button" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>
        <span className="sr-only">Toggle navigation</span>
        <span aria-hidden="true">{open ? "Close" : "Menu"}</span>
      </button>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile navigation">
          {navGroups.map((item) => item.items?.length ? <div key={item.label} className="mobile-nav-group"><button type="button" className="mobile-nav-toggle" aria-expanded={expanded === item.label} onClick={() => setExpanded((current) => current === item.label ? null : item.label)}><span>{item.label}</span><span aria-hidden="true">{expanded === item.label ? "-" : "+"}</span></button>{expanded === item.label && <div className="mobile-subnav">{item.href && <Link href={item.href} onClick={() => setOpen(false)}>Overview</Link>}{item.items.map((subItem) => <Link key={subItem.href} href={subItem.href} onClick={() => setOpen(false)}>{subItem.label}</Link>)}</div>}</div> : <Link key={item.label} href={item.href ?? "/"} onClick={() => setOpen(false)}>{item.label}</Link>)}
          <div className="mobile-auth-links">{signedIn ? <Link className="mobile-register-link" href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link> : <><Link href="/account/sign-in" onClick={() => setOpen(false)}>Sign in</Link><Link className="mobile-register-link" href="/account/sign-up" onClick={() => setOpen(false)}>Create free account</Link></>}</div>
        </nav>
      )}
    </div>
  );
}
