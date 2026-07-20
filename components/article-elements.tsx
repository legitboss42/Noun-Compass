import Link from "next/link";
import Image from "next/image";
import { createElement, type HTMLAttributes, type ReactNode } from "react";
import type { ArticleMeta } from "@/lib/articles";
import { formatDate } from "@/lib/articles";
import type { ArticleFaq } from "@/lib/article-faqs";
import { getEditorialProfile } from "@/lib/editorial";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return <nav className="breadcrumbs" aria-label="Breadcrumb">{items.map((item, index) => <span key={item.label}>{index > 0 && <i>/</i>}{item.href ? <Link href={item.href}>{item.label}</Link> : item.label}</span>)}</nav>;
}

export function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function headingText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(headingText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return headingText((children as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

export function MdxHeading({
  children,
  level = 2,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { level?: 2 | 3 | 4 | 5 | 6 }) {
  const id = slugifyHeading(headingText(children));
  return createElement(`h${level}`, { id: id || undefined, ...props }, children);
}

export function TableOfContents({ headings = [] }: { headings?: { id: string; label: string }[] }) {
  if (!headings.length) return null;
  return <nav className="toc" aria-label="Table of contents"><strong>In this guide</strong><ol>{headings.map((heading) => <li key={heading.id}><a href={`#${heading.id}`}>{heading.label}</a></li>)}</ol></nav>;
}

export function SourceNote({ url }: { url: string }) {
  return <aside className="source-note"><strong>Check the official page</strong><p>Use this NOUN page to confirm anything that can change, including dates, charges, requirements, and course-material details.</p><a href={url} target="_blank" rel="noopener noreferrer">Visit the NOUN source</a></aside>;
}

export function LastCheckedBox({ date }: { date: string }) {
  return <div className="last-checked"><span aria-hidden="true">OK</span><p><strong>Checked on {formatDate(date)}.</strong> NOUN pages and procedures can change, so compare the steps here with what you see in your own account.</p></div>;
}

export function FAQBlock({ faqs }: { faqs: ArticleFaq[] }) {
  return <section id="faq" className="faq"><span className="eyebrow">Questions students ask</span><h2>Quick answers</h2><p className="faq-intro">Open any question for the answer.</p><div className="faq-list">{faqs.map((faq, index) => <details key={faq.question} className="faq-item" name="article-faq"><summary><span className="faq-question-wrap"><span className="faq-number">{String(index + 1).padStart(2, "0")}</span><span className="faq-question">{faq.question}</span></span><span className="faq-toggle" aria-hidden="true"><span className="faq-toggle-line faq-toggle-line-horizontal" /><span className="faq-toggle-line faq-toggle-line-vertical" /></span></summary><div className="faq-answer"><p>{faq.answer}</p></div></details>)}</div></section>;
}

export function AuthorBox({ author, reviewer }: { author: string; reviewer: string }) {
  const authorProfile = getEditorialProfile(author);
  const reviewerProfile = getEditorialProfile(reviewer);
  return <aside className="author-box"><div className="author-avatar">NC</div><div><span className="eyebrow">Who checked this guide</span><h2><Link href={authorProfile.href}>{author}</Link></h2><p>{author} prepared the guide, and <Link href={reviewerProfile.href}>{reviewer}</Link> checked the sources, the steps, and any advice that could affect a student&apos;s record or payment.</p><Link href="/editorial-policy">How we write and review guides</Link></div></aside>;
}

export function DisclaimerBox() {
  return <aside className="disclaimer-box"><strong>Before you rely on this</strong><p>NOUN Compass is an independent student-help website, not part of NOUN. For fees, admissions, deadlines, and course materials, your current NOUN record and official NOUN pages come first.</p></aside>;
}

export function SourceReviewBox({
  summary,
  reviewedSources,
  reviewHighlights,
  reviewedAt,
}: {
  summary?: string;
  reviewedSources?: { label: string; url: string }[];
  reviewHighlights?: string[];
  reviewedAt: string;
}) {
  if (!summary && !reviewedSources?.length && !reviewHighlights?.length) return null;
  return <aside className="source-review-box"><strong>What we checked</strong>{summary ? <p>{summary}</p> : null}<p><strong>Sources checked:</strong> {formatDate(reviewedAt)}.</p>{reviewHighlights?.length ? <ul>{reviewHighlights.map((item) => <li key={item}>{item}</li>)}</ul> : null}{reviewedSources?.length ? <div className="source-review-links">{reviewedSources.map((item) => <a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer">{item.label}</a>)}</div> : null}</aside>;
}

export function RelatedReads({ articles }: { articles: ArticleMeta[] }) {
  return <section className="related"><span className="eyebrow">If you need the next step</span><h2>Guides that may help</h2><div>{articles.map((article) => <Link key={article.slug} href={`/articles/${article.slug}`}><span>{article.category.replace("-", " ")}</span><strong>{article.title}</strong><small>{article.readingTime}</small></Link>)}</div></section>;
}

export function AdPlaceholder({ position }: { position: string }) {
  const enabled = false;
  if (!enabled) return null;
  return <aside className="ad-placeholder" aria-label="Advertisement">Ad space: {position}</aside>;
}

export function ArticleScreenshot({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  const dimensions: Record<string, { width: number; height: number }> = {
    "/images/guides/portal-screenshots/bursary-menu-safe.png": { width: 245, height: 650 },
    "/images/guides/portal-screenshots/check-payment-status-safe.png": { width: 995, height: 700 },
    "/images/guides/portal-screenshots/course-registration-form-safe.png": { width: 995, height: 750 },
    "/images/guides/portal-screenshots/course-registration-menu-safe.png": { width: 245, height: 650 },
    "/images/guides/portal-screenshots/dashboard-navigation-safe.png": { width: 1000, height: 650 },
    "/images/guides/portal-screenshots/exam-registration-form-safe.png": { width: 995, height: 750 },
    "/images/guides/portal-screenshots/official-support-portal-safe.png": { width: 1200, height: 800 },
    "/images/guides/portal-screenshots/registerable-courses-safe.png": { width: 995, height: 750 },
    "/images/guides/portal-screenshots/semester-registration-safe.png": { width: 995, height: 750 },
    "/images/guides/portal-screenshots/student-dashboard-menu-safe.png": { width: 1000, height: 155 },
    "/images/guides/portal-screenshots/wallet-funding-form-safe.png": { width: 995, height: 750 },
    "/images/guides/portal-screenshots/elearn-dashboard-safe.png": { width: 887, height: 1318 },
    "/images/guides/portal-screenshots/elearn-course-list-safe.png": { width: 887, height: 818 },
    "/images/guides/portal-screenshots/elearn-course-page-safe.png": { width: 586, height: 1836 },
    "/images/guides/portal-screenshots/elearn-tma-list-safe.png": { width: 253, height: 167 },
    "/images/guides/portal-screenshots/elearn-tma-instructions-safe.png": { width: 556, height: 209 },
    "/images/guides/portal-screenshots/elearn-tma-submission-safe.png": { width: 269, height: 332 },
    "/images/guides/portal-screenshots/elearn-tma-scores-safe.png": { width: 779, height: 1361 },
    "/images/guides/portal-screenshots/elearn-help-area-safe.png": { width: 823, height: 375 },
    "/images/guides/results-screenshots/results-full-grade-table-safe.png": { width: 882, height: 1055 },
    "/images/guides/results-screenshots/results-summary-stats-safe.png": { width: 431, height: 171 },
    "/images/guides/results-screenshots/results-performance-standing-safe.png": { width: 424, height: 177 },
    "/images/guides/results-screenshots/results-outstanding-courses-safe.png": { width: 394, height: 1598 },
    "/images/guides/results-screenshots/results-registration-slip-blocked-safe.png": { width: 929, height: 49 },
    "/images/guides/portal-screenshots/registration-selection-status.svg": { width: 1200, height: 675 },
    "/images/guides/portal-screenshots/private-record-status.svg": { width: 1200, height: 675 },
    "/images/guides/portal-screenshots/public-source-status.svg": { width: 1200, height: 675 },
    "/images/guides/portal-screenshots/payment-record-reconstruction.svg": { width: 1200, height: 675 },
    "/images/guides/portal-screenshots/registration-slip-reconstruction.svg": { width: 1200, height: 675 },
    "/images/guides/portal-screenshots/result-record-reconstruction.svg": { width: 1200, height: 675 },
    "/images/guides/portal-screenshots/profile-update-reconstruction.svg": { width: 1200, height: 675 },
    "/images/guides/portal-screenshots/public-source-reconstruction.svg": { width: 1200, height: 675 },
    "/images/guides/portal-screenshots/selection-unavailable-reconstruction.svg": { width: 1200, height: 675 },
    "/images/guides/portal-screenshots/support-ticket-reconstruction.svg": { width: 1200, height: 675 },
  };
  const size = dimensions[src] ?? { width: 1200, height: 800 };
  const isReconstruction = src.endsWith(".svg");

  return (
    <figure className="article-screenshot">
      <div>
        <Image
          src={src}
          alt={alt}
          width={size.width}
          height={size.height}
          sizes="(max-width: 820px) 100vw, 760px"
        />
      </div>
      <figcaption>
        {caption} {isReconstruction
          ? "This is a teaching diagram, not a live student record."
          : "This came from an official NOUN page; personal information has been removed."}
      </figcaption>
    </figure>
  );
}
