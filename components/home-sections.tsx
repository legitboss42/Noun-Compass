import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { BrandLogo } from "@/components/BrandLogo";
import { SectionBadge } from "@/components/SectionBadge";
import type { ArticleMeta } from "@/lib/articles";

const startHerePaths = [
  {
    title: "New Student",
    description: "Begin with admission, first-semester fees, registration, and the records you should save.",
    href: "/articles/noun-school-fees-new-students",
  },
  {
    title: "Returning Student",
    description: "Jump back into fees, registration, results checks, and support when something looks wrong.",
    href: "/articles/noun-school-fees-returning-students",
  },
  {
    title: "Need To Pay Fees",
    description: "Review fees, compulsory charges, and payment-safe guidance before you pay anything.",
    href: "/fees",
  },
  {
    title: "Need Results Help",
    description: "Find result statements, CGPA help, and steps to take when a grade looks wrong.",
    href: "/results",
  },
  {
    title: "Need TMA/eLearn Help",
    description: "Get help with TMAs, score checks, and the mistakes that usually cause trouble on eLearn.",
    href: "/articles/noun-elearn-and-tma-guide",
  },
  {
    title: "Need Study Centre Help",
    description: "Check study-centre guidance before you travel or rely on a location listing.",
    href: "/study-centres",
  },
  {
    title: "Need NELFUND Help",
    description: "See what is confirmed for NOUN students, what is still unclear, and what to double-check yourself.",
    href: "/articles/is-noun-eligible-for-nelfund",
  },
];

export function SearchHero() {
  return <section className="hero"><div className="container hero-inner"><div className="hero-brand-row"><BrandLogo variant="lockup" tone="light" className="hero-logo" /><SectionBadge>Independent NOUN help</SectionBadge></div><h1>Clearer help for NOUN students.</h1><p>Plain-language guides for admission, fees, registration, results, study centres, GST courses, eLearn tasks, and student support.</p><form className="search-box" action="/student-guides"><label className="sr-only" htmlFor="site-search">Search student guides</label><input id="site-search" name="q" placeholder="Search fees, registration, TMA, results, study centres, NELFUND..." /><button type="submit">Search guides</button></form><div className="quick-links"><span>Popular:</span><Link href="/articles/noun-school-fees-new-students">New student fees</Link><Link href="/articles/how-to-register-noun-courses">Course registration</Link><Link href="/articles/how-to-check-noun-results">Check results</Link></div><div className="hero-trust-panel"><strong>NOUN Compass is independent.</strong><p>We turn scattered NOUN tasks into clear steps, then point you back to the right official page for the final check.</p><Link href="/about">How we check our guides</Link></div></div></section>;
}

export function StartHerePaths() {
  return <section className="section container"><div className="section-heading"><div><SectionBadge>Start Here</SectionBadge><h2>Choose the student path that matches your next task</h2></div><Link href="/student-guides">Browse all guides -&gt;</Link></div><div className="start-grid">{startHerePaths.map((item, index) => <Link key={item.title} className="start-card" href={item.href}><span className="start-card-number">{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.description}</p><strong>Open path -&gt;</strong></Link>)}</div></section>;
}

export function FeaturedGrid({ articles }: { articles: ArticleMeta[] }) {
  return <section className="section container"><div className="section-heading"><div><SectionBadge>Essential Guides</SectionBadge><h2>Popular NOUN help right now</h2></div><Link href="/student-guides">All guides -&gt;</Link></div><div className="featured-grid">{articles.slice(0, 1).map((article) => <ArticleCard key={article.slug} article={article} large priorityImage />)}<div className="featured-small">{articles.slice(1, 4).map((article) => <ArticleCard key={article.slug} article={article} compact />)}</div></div></section>;
}

export function TopicClusterHighlights({ articles }: { articles: ArticleMeta[] }) {
  const clusters = [
    {
      title: "Results and academic records",
      description: "Build stronger result-reading authority with guides that cover My Progress, result statements, CGPA, and outstanding credits together.",
      href: "/results",
      slugs: [
        "how-to-check-noun-results",
        "how-to-open-your-noun-result-statement-from-the-support-portal",
        "how-to-read-noun-cgpa-class-of-degree-and-outstanding-credit",
      ],
    },
    {
      title: "TMA and eLearn workflow",
      description: "Keep the TMA cluster connected from finding the activity to submitting it safely and checking the score later.",
      href: "/articles/noun-elearn-and-tma-guide",
      slugs: [
        "noun-elearn-and-tma-guide",
        "how-to-find-tma-on-noun-elearn",
        "how-to-submit-tma-on-noun-elearn",
      ],
    },
    {
      title: "Student finance and NELFUND",
      description: "Strengthen payment and funding authority with connected guides for fees, Remita, status checks, and NELFUND uncertainty.",
      href: "/fees",
      slugs: [
        "how-to-pay-noun-school-fees",
        "how-to-generate-remita-for-noun",
        "nelfund-application-status-meanings-explained",
      ],
    },
  ];

  return <section className="section container"><div className="section-heading"><div><SectionBadge>Authority Clusters</SectionBadge><h2>Follow the next verified path by topic</h2></div><Link href="/student-guides">Explore all guides -&gt;</Link></div><div className="related">{clusters.map((cluster) => <div key={cluster.title}><span className="eyebrow">{cluster.title}</span><h2>{cluster.title}</h2><p>{cluster.description}</p><div>{cluster.slugs.map((slug) => articles.find((article) => article.slug === slug)).filter(Boolean).map((article) => <Link key={article!.slug} href={`/articles/${article!.slug}`}><span>{article!.category.replace("-", " ")}</span><strong>{article!.title}</strong><small>{article!.description}</small></Link>)}</div><p><Link href={cluster.href}>Open this cluster -&gt;</Link></p></div>)}</div></section>;
}

export function LatestArticles({ articles }: { articles: ArticleMeta[] }) {
  return <section className="section"><div className="section-heading"><div><SectionBadge>Recently reviewed</SectionBadge><h2>Latest articles</h2></div></div><div className="latest-list">{articles.map((article) => <ArticleCard key={article.slug} article={article} />)}</div></section>;
}

export function HomeSupportAside() {
  return <aside className="home-support" aria-labelledby="home-support-title"><SectionBadge>Quick help</SectionBadge><h2 id="home-support-title">Need the next safe step fast?</h2><p>Use the clearest guide for the task in front of you, then confirm the final step on the official NOUN portal before you submit or pay.</p><div className="home-support-links"><Link href="/articles/nouonline-student-dashboard">Portal dashboard guide</Link><Link href="/articles/noun-tma-deadline-guide">TMA deadline guide</Link><Link href="/articles/how-to-pay-noun-school-fees">School fees payment guide</Link><Link href="/contact">Contact NounCompass</Link></div><div className="trust-note"><strong>Independent support</strong><p>NounCompass is an independent student-help platform and is not the official NOUN website.</p><Link href="/disclaimer">Read the disclaimer -&gt;</Link></div></aside>;
}

export function TrendingSidebar({ articles }: { articles: ArticleMeta[] }) {
  return <aside className="trending"><SectionBadge>Most useful now</SectionBadge><h2>Trending guides</h2>{articles.slice(0, 5).map((article, index) => <ArticleCard key={article.slug} article={article} rank={index + 1} />)}<div className="trust-note"><strong>Accuracy matters</strong><p>We check the details that matter, keep update dates visible, and tell you when a final portal check is still necessary.</p><Link href="/editorial-policy">How we review guides -&gt;</Link></div></aside>;
}

export function NewsletterBlock() {
  return <section className="newsletter container"><div><SectionBadge>Independent guidance</SectionBadge><h2>Use this site to understand the task, then finish it with the right NOUN page open.</h2><p>NOUN Compass helps you make sense of the process before you pay, submit records, or act on a deadline.</p></div><span className="newsletter-status">Check trust pages</span></section>;
}
