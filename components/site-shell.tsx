import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { MobileMenu } from "@/components/mobile-menu";
import { navGroups, navItems, site } from "@/data/site";

export function TopUtilityBar() {
  return <div className="utility"><div className="container utility-inner"><Link href="/disclaimer">Independent NOUN help</Link><a href="https://nou.edu.ng" target="_blank" rel="noopener noreferrer">Visit official NOUN website</a></div></div>;
}

export function Header() {
  return <><TopUtilityBar /><header className="site-header"><div className="container header-main"><Link className="logo" href="/" aria-label="NOUN Compass home"><BrandLogo variant="wordmark" tone="dark" className="brand-logo-header" /></Link><div className="header-actions"><Link className="search-link" href="/student-guides#guides">Search guides</Link><MobileMenu /></div></div><nav className="desktop-nav container" aria-label="Primary navigation">{navGroups.map((item) => item.items?.length ? <div key={item.label} className="desktop-nav-group"><Link className="desktop-nav-button" href={item.href ?? item.items[0].href}>{item.label}</Link><div className="desktop-subnav" role="menu" aria-label={`${item.label} submenu`}>{item.items.map((subItem) => <Link key={subItem.href} href={subItem.href}>{subItem.label}</Link>)}</div></div> : <Link key={item.label} href={item.href ?? "/"}>{item.label}</Link>)}</nav></header></>;
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
  ];

  return <footer className="footer"><div className="container footer-grid"><div><Link className="logo logo-light" href="/"><BrandLogo variant="wordmark" tone="light" className="brand-logo-footer" /></Link><p>{site.tagline}. Straightforward help for NOUN students.</p><p className="footer-independence">NounCompass is run independently. It is not part of NOUN, and it does not act for the university.</p><Link href="/authors/editorial-team">Meet the editorial team</Link></div><div><h2>Student help</h2>{navItems.slice(0, 6).map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</div><div><h2>Trust & legal</h2>{trustLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div></div><div className="container footer-bottom"><p>{site.disclaimer}</p><p>Copyright {new Date().getFullYear()} NOUN Compass</p></div></footer>;
}
