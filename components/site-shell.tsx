import Image from "next/image";
import Link from "next/link";
import { AuthHeaderLinks } from "@/components/auth-header-links";
import { BrandLogo } from "@/components/BrandLogo";
import { MobileMenu } from "@/components/mobile-menu";
import { SocialLinks } from "@/components/social-links";
import { navGroups, navItems, site } from "@/data/site";
import { EDITORIAL_PROFILE_URL } from "@/lib/editorial";

export function TopUtilityBar() {
  return <div className="utility"><div className="container utility-inner"><Link href="/disclaimer">Independent NOUN help</Link><a href="https://nou.edu.ng" target="_blank" rel="noopener noreferrer">Visit official NOUN website</a></div></div>;
}

export function Header() {
  return <><TopUtilityBar /><header className="site-header"><div className="container header-main"><Link className="logo" href="/" aria-label="NOUN Compass home"><BrandLogo variant="wordmark" tone="dark" className="brand-logo-header" /></Link><div className="header-actions"><Link className="search-link" href="/student-guides#guides">Search guides</Link><AuthHeaderLinks /><MobileMenu /></div></div><nav className="desktop-nav container" aria-label="Primary navigation">{navGroups.map((item) => item.items?.length ? <div key={item.label} className="desktop-nav-group"><Link className="desktop-nav-button" href={item.href ?? item.items[0].href}>{item.label}</Link><div className="desktop-subnav">{item.items.map((subItem) => <Link key={subItem.href} href={subItem.href}>{subItem.label}</Link>)}</div></div> : <Link key={item.label} href={item.href ?? "/"}>{item.label}</Link>)}</nav></header></>;
}

export function Footer() {
  const trustLinks = [
    ["About", "/about"],
    ["Contact", "/contact"],
    ["Privacy Policy", "/privacy-policy"],
    ["Terms", "/terms"],
    ["Disclaimer", "/disclaimer"],
    ["Editorial Policy", "/editorial-policy"],
    ["Corrections Policy", "/corrections-policy"],
    ["Copyright Policy", "/copyright-policy"],
    ["Takedown Policy", "/takedown-policy"],
    ["Refund Policy", "/refund-policy"],
    ["Academic Integrity", "/academic-integrity"],
  ];

  return <footer className="footer"><div className="container footer-grid"><div><Link className="logo logo-light" href="/"><BrandLogo variant="wordmark" tone="light" className="brand-logo-footer" /></Link><p>{site.tagline}. Straightforward help for NOUN students.</p><p className="footer-independence">NounCompass is independent. It is not part of NOUN and cannot act for the university.</p><a className="footer-credit" href="https://webgrowth.info" target="_blank" rel="noopener noreferrer" aria-label="Built and managed by WebGrowth"><span className="footer-credit-label">Built and managed by</span><Image src="/images/brand/web-growth-logo.webp" alt="WebGrowth" width={220} height={48} className="footer-credit-logo" /></a><a href={EDITORIAL_PROFILE_URL}>Meet the editorial team</a></div><div><h2>Student help</h2>{navItems.slice(0, 6).map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}<Link href="/exam-prep">Exam preparation</Link><Link href="/membership">Semester pass</Link><Link href="/dashboard">Student dashboard</Link></div><div><h2>Your account</h2><Link href="/account/sign-in">Sign in</Link><Link href="/account/sign-up">Create free account</Link><Link href="/dashboard">Continue in dashboard</Link></div><div><h2>Trust & legal</h2>{trustLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div></div><div className="container footer-social-wrap"><SocialLinks compact title="Follow NounCompass on social media" intro="Use the official NounCompass social pages for quick reminders, short updates, and site news." /></div><div className="container footer-bottom"><p>{site.disclaimer}</p><p>Copyright {new Date().getFullYear()} NOUN Compass</p></div></footer>;
}
