import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { BrandLogo } from "@/components/BrandLogo";
import { SectionBadge } from "@/components/SectionBadge";
import { NewsletterForm } from "@/components/newsletter-form";
import { examPrepCourses } from "@/data/exam-prep";
import type { ArticleMeta } from "@/lib/articles";

const startHerePaths = [
  {
    title: "New Student",
    description: "Begin with admission, first-semester fees, registration, and the records you should save.",
    href: "/articles/noun-school-fees-new-students",
    cta: "See new-student steps",
  },
  {
    title: "Returning Student",
    description: "Jump back into fees, registration, results checks, and support when something looks wrong.",
    href: "/articles/noun-school-fees-returning-students",
    cta: "See returning-student steps",
  },
  {
    title: "Need To Pay Fees",
    description: "Review fees, compulsory charges, and payment-safe guidance before you pay anything.",
    href: "/fees",
    cta: "Check fees",
  },
  {
    title: "Need Results Help",
    description: "Find result statements, CGPA help, and steps to take when a grade looks wrong.",
    href: "/results",
    cta: "Open result guides",
  },
  {
    title: "Need TMA/eLearn Help",
    description: "Get help with TMAs, score checks, and the mistakes that usually cause trouble on eLearn.",
    href: "/articles/noun-elearn-and-tma-guide",
    cta: "Open TMA help",
  },
  {
    title: "Need Study Centre Help",
    description: "Check study-centre guidance before you travel or rely on a location listing.",
    href: "/study-centres",
    cta: "Open study-centre help",
  },
  {
    title: "Need NELFUND Help",
    description: "See what is confirmed for NOUN students, what is still unclear, and what to double-check yourself.",
    href: "/articles/is-noun-eligible-for-nelfund",
    cta: "Open NELFUND guide",
  },
];

export function SearchHero() {
  return <section className="hero"><div className="container hero-inner"><div className="hero-brand-row"><BrandLogo variant="lockup" tone="light" className="hero-logo" /><SectionBadge>Independent NOUN help</SectionBadge></div><h1>NOUN help that gets to the point.</h1><p>Plain-language guides for admission, fees, registration, results, study centres, GST courses, eLearn tasks, and student support.</p><form className="search-box" action="/student-guides"><label className="sr-only" htmlFor="site-search">Search student guides</label><input id="site-search" name="q" placeholder="Search fees, registration, TMA, results, study centres, NELFUND..." /><button type="submit">Search guides</button></form><div className="quick-links"><span>Popular:</span><Link href="/articles/noun-school-fees-new-students">New student fees</Link><Link href="/articles/how-to-register-noun-courses">Course registration</Link><Link href="/articles/how-to-check-noun-results">Check results</Link></div><div className="hero-trust-panel"><strong>NOUN Compass is independent.</strong><p>We break down confusing NOUN tasks into clear steps, then point you to the official page for the final check.</p><Link href="/about">See how we review guides</Link></div></div></section>;
}

export function StartHerePaths() {
  return <section className="section container"><div className="section-heading"><div><SectionBadge>Start Here</SectionBadge><h2>Choose what you need help with</h2></div><Link href="/student-guides">Browse all NOUN guides</Link></div><div className="start-grid">{startHerePaths.map((item, index) => <Link key={item.title} className="start-card" href={item.href}><span className="start-card-number">{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.description}</p><strong>{item.cta}</strong></Link>)}</div></section>;
}

export function FeaturedGrid({ articles }: { articles: ArticleMeta[] }) {
  return <section className="section container"><div className="section-heading"><div><SectionBadge>Essential Guides</SectionBadge><h2>Popular NOUN help right now</h2></div><Link href="/student-guides">All guides</Link></div><div className="featured-grid">{articles.slice(0, 1).map((article) => <ArticleCard key={article.slug} article={article} large />)}<div className="featured-small">{articles.slice(1, 4).map((article) => <ArticleCard key={article.slug} article={article} compact />)}</div></div></section>;
}

export function TopicClusterHighlights({ articles }: { articles: ArticleMeta[] }) {
  const clusters = [
    {
      title: "Results and academic records",
      description: "See how to check results, open your statement, and understand CGPA and outstanding credits in one place.",
      href: "/results",
      slugs: [
        "how-to-check-noun-results",
        "how-to-open-your-noun-result-statement-from-the-support-portal",
        "how-to-read-noun-cgpa-class-of-degree-and-outstanding-credit",
      ],
    },
    {
      title: "TMA and eLearn steps",
      description: "Follow the full TMA path from finding the activity to submitting it and checking your score.",
      href: "/articles/noun-elearn-and-tma-guide",
      slugs: [
        "noun-elearn-and-tma-guide",
        "how-to-find-tma-on-noun-elearn",
        "how-to-submit-tma-on-noun-elearn",
      ],
    },
    {
      title: "Student finance and NELFUND",
      description: "Compare guides for fees, Remita, payment status, and the NELFUND questions students ask most.",
      href: "/fees",
      slugs: [
        "how-to-pay-noun-school-fees",
        "how-to-generate-remita-for-noun",
        "nelfund-application-status-meanings-explained",
      ],
    },
  ];

  return <section className="section container"><div className="section-heading"><div><SectionBadge>Topic Guides</SectionBadge><h2>Choose the next guide by topic</h2></div><Link href="/student-guides">See all guides</Link></div><div className="related">{clusters.map((cluster) => <div key={cluster.title}><span className="eyebrow">{cluster.title}</span><h2>{cluster.title}</h2><p>{cluster.description}</p><div>{cluster.slugs.map((slug) => articles.find((article) => article.slug === slug)).filter(Boolean).map((article) => <Link key={article!.slug} href={`/articles/${article!.slug}`}><span>{article!.category.replace("-", " ")}</span><strong>{article!.title}</strong><small>{article!.description}</small></Link>)}</div><p><Link href={cluster.href}>See guides in this topic</Link></p></div>)}</div></section>;
}

export function LatestArticles({ articles }: { articles: ArticleMeta[] }) {
  return <section className="section"><div className="section-heading"><div><SectionBadge>Recently updated</SectionBadge><h2>Latest articles</h2></div></div><div className="latest-list">{articles.map((article) => <ArticleCard key={article.slug} article={article} />)}</div></section>;
}

export function HomeSupportAside() {
  return <aside className="home-support" aria-labelledby="home-support-title"><SectionBadge>Quick help</SectionBadge><h2 id="home-support-title">Need help with your next NOUN task?</h2><p>Start with the guide that matches what you need to do, then confirm the final step on the official NOUN portal before you submit or pay.</p><div className="home-support-links"><Link href="/articles/nouonline-student-dashboard">Portal dashboard guide</Link><Link href="/articles/noun-tma-deadline-guide">TMA deadline guide</Link><Link href="/articles/how-to-pay-noun-school-fees">School fees payment guide</Link><Link href="/contact">Contact NounCompass</Link></div><div className="trust-note"><strong>Independent support</strong><p>NounCompass is an independent student guide website and is not the official NOUN website.</p><Link href="/disclaimer">Read our disclaimer</Link></div></aside>;
}

export function TrendingSidebar({ articles }: { articles: ArticleMeta[] }) {
  return <aside className="trending"><SectionBadge>Most useful now</SectionBadge><h2>Trending guides</h2>{articles.slice(0, 5).map((article, index) => <ArticleCard key={article.slug} article={article} rank={index + 1} />)}<div className="trust-note"><strong>Accuracy matters</strong><p>We keep update dates visible and tell you when you still need to check the final details on the portal.</p><Link href="/editorial-policy">See how we review guides</Link></div></aside>;
}

export function NewsletterBlock() {
  return <section className="newsletter container"><div><SectionBadge>Free email updates</SectionBadge><h2>Get NOUN updates by email for free.</h2><p>Join the NounCompass list for occasional timetable reminders, exam-preparation updates, and newly updated student guides. Email updates are not active yet.</p></div><NewsletterForm /></section>;
}

export function FreeExamPrepSection() {
  return <section className="section container free-exam-prep"><div className="section-heading"><div><SectionBadge>Free exam preparation</SectionBadge><h2>Check supported courses and try a free diagnostic</h2></div><Link href="/exam-prep">View all exam-prep courses</Link></div><p className="free-exam-prep-intro">Create a free account to save your semester courses and scores. Full practice will open after the question banks are checked and paid access is ready.</p><div className="platform-public-grid">{examPrepCourses.slice(0, 3).map((course) => <article key={course.code}><span>{course.level} level - Semester {course.semester}</span><h3 className="course-card-heading"><span>{course.code}</span>{course.title}</h3><p>{course.description}</p><Link href={`/exam-prep/${course.slug}`}>See course coverage</Link></article>)}</div><div className="free-exam-prep-actions"><Link className="button" href="/account/sign-up">Create account for free diagnostic</Link><Link href="/account/sign-in?next=/dashboard/practice">Already registered? Sign in</Link></div></section>;
}
