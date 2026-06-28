import { Breadcrumbs } from "@/components/article-elements";

export function TrustPage({ title, eyebrow, intro, children, updated = "14 June 2026" }: { title: string; eyebrow: string; intro: string; children: React.ReactNode; updated?: string }) {
  return <main id="main-content"><div className="category-hero"><div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} /><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{intro}</p></div></div><article className="container narrow trust-prose"><p className="policy-date">Last updated: {updated}</p>{children}</article></main>;
}
