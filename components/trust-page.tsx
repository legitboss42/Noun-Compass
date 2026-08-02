import { Breadcrumbs } from "@/components/article-elements";
import Link from "next/link";

export function TrustPage({ title, eyebrow, intro, children, updated = "14 June 2026" }: { title: string; eyebrow: string; intro: string; children: React.ReactNode; updated?: string }) {
  return (
    <main id="main-content" className="trust-page">
      <div className="category-hero trust-page-hero">
        <div className="container">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{intro}</p>
          <div className="trust-hero-links">
            <Link href="/about">About NounCompass</Link>
            <Link href="/editorial-policy">Editorial standards</Link>
            <Link href="/contact">Contact the team</Link>
          </div>
        </div>
      </div>
      <article className="container narrow trust-prose">
        <div className="policy-date"><span>Document status</span><strong>Current</strong><span>Last updated {updated}</span></div>
        {children}
      </article>
    </main>
  );
}
