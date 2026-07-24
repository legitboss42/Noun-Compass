import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { NewsletterForm } from "@/components/newsletter-form";
import { HomeIcon } from "@/components/homepage/home-icons";
import {
  quickAccessItems,
  studentTools,
  trustPoints,
} from "@/components/homepage/home-data";
import {
  HomepageDesktopNavigation,
  HomepageAuthLinks,
  HomepageMobileMenu,
} from "@/components/homepage/home-interactions";
import { socialLinks, site } from "@/data/site";
import type { ArticleMeta } from "@/lib/articles";
import { formatDate } from "@/lib/articles";
import styles from "@/components/homepage/homepage.module.css";

type HomepageMetric = {
  value: string;
  label: string;
  note: string;
  icon: "book" | "graduation" | "calendar" | "document";
};

type MembershipSummary = {
  price: string;
  durationDays: number;
};

export function HomepageHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link aria-label="NOUN Compass homepage" className={styles.headerLogo} href="/">
          <BrandLogo variant="lockup" tone="color" priority />
        </Link>
        <HomepageDesktopNavigation />
        <div className={styles.headerActions}>
          <Link
            aria-label="Search student guides"
            className={styles.headerSearch}
            href="/student-guides#guides"
          >
            <HomeIcon name="search" size={20} />
          </Link>
          <div className={styles.desktopAuthActions}>
            <HomepageAuthLinks />
          </div>
          <HomepageMobileMenu />
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  const featurePoints = [
    { icon: "document" as const, label: "Past questions", detail: "& mock exams" },
    { icon: "book" as const, label: "Course materials", detail: "& downloads" },
    { icon: "tools" as const, label: "Smart study", detail: "tools" },
    { icon: "shield" as const, label: "Clear guidance", detail: "with source checks" },
  ];

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <span className={styles.badge}>
              <HomeIcon name="compass" size={15} />
              The NOUN student companion
            </span>
            <h1>
              Everything you need to succeed at <em>NOUN</em>
            </h1>
            <p className={styles.heroIntro}>
              Access exam preparation, course materials, student tools, fees
              information and practical guidance in one independent platform
              built for NOUN students.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryButton} href="/exam-prep">
                Explore exam preparation
                <HomeIcon name="arrow" size={18} />
              </Link>
              <Link className={styles.secondaryButton} href="/course-materials">
                Browse course materials
                <HomeIcon name="book" size={18} />
              </Link>
            </div>
            <ul className={styles.heroFeatures}>
              {featurePoints.map((item) => (
                <li key={item.label}>
                  <span className={styles.featureIcon}>
                    <HomeIcon name={item.icon} size={18} />
                  </span>
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.detail}</small>
                  </span>
                </li>
              ))}
            </ul>
            <aside className={styles.heroTrust}>
              <HomeIcon name="shield" size={20} />
              <p>
                <strong>Independent student support.</strong> NounCompass is not
                NOUN. Confirm final fees, dates and account details on official
                university pages.
              </p>
              <Link href="/editorial-policy">How we review guides</Link>
            </aside>
          </div>
          <div className={styles.heroVisual}>
            <span aria-hidden="true" className={styles.heroHalo} />
            <span aria-hidden="true" className={styles.heroDots} />
            <picture>
              <source
                media="(max-width: 700px)"
                srcSet="/images/home/noun-student-hero-mobile.webp"
                type="image/webp"
              />
              <Image
                alt="Nigerian university student using a tablet"
                className={styles.heroImage}
                height={1380}
                priority
                sizes="(max-width: 700px) 88vw, (max-width: 1100px) 45vw, 540px"
                src="/images/home/noun-student-hero-desktop.webp"
                width={920}
              />
            </picture>
            <div className={styles.heroResourceCard}>
              <span className={styles.resourceCardIcon}>
                <HomeIcon name="book" size={20} />
              </span>
              <div>
                <strong>Start with your course code</strong>
                <p>Find the matching material and review current study guidance.</p>
              </div>
              <Link href="/course-materials">
                Search materials <HomeIcon name="arrow" size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className={styles.sectionHeading}>
      <div>
        {eyebrow && <span>{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {href && linkLabel && (
        <Link href={href}>
          {linkLabel} <HomeIcon name="arrow" size={16} />
        </Link>
      )}
    </div>
  );
}

function QuickAccessSection() {
  return (
    <section className={`${styles.section} ${styles.quickAccess}`}>
      <div className={styles.container}>
        <SectionHeading
          eyebrow="Start here"
          title="Quick access"
          description="Open the part of NounCompass that matches what you need to do now."
        />
        <div className={styles.quickGrid}>
          {quickAccessItems.map((item) => (
            <article className={styles.quickCard} key={item.title}>
              <span className={`${styles.cardIcon} ${styles[item.tone]}`}>
                <HomeIcon name={item.icon} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <Link href={item.href}>
                {item.cta} <HomeIcon name="arrow" size={16} />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function StudentToolsSection() {
  return (
    <section className={`${styles.section} ${styles.toolsSection}`}>
      <div className={styles.container}>
        <SectionHeading
          title="Powerful tools for smarter study"
          description="Plan, calculate and check the details that shape your academic work."
          href="/tools"
          linkLabel="View all tools"
        />
        <div className={styles.toolsGrid}>
          {studentTools.map((tool) => (
            <Link className={styles.toolCard} href={tool.href} key={tool.title}>
              <span className={`${styles.cardIcon} ${styles[tool.tone]}`}>
                <HomeIcon name={tool.icon} />
              </span>
              <span className={styles.toolCopy}>
                <strong>{tool.title}</strong>
                <small>{tool.description}</small>
              </span>
              <HomeIcon className={styles.toolArrow} name="arrow" size={18} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlatformMetrics({ metrics }: { metrics: HomepageMetric[] }) {
  return (
    <section className={styles.metricsSection} aria-label="NounCompass platform facts">
      <div className={`${styles.container} ${styles.metricsGrid}`}>
        {metrics.map((metric) => (
          <article key={metric.label}>
            <span>
              <HomeIcon name={metric.icon} />
            </span>
            <div>
              <strong>{metric.value}</strong>
              <h2>{metric.label}</h2>
              <p>{metric.note}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MembershipSection({ membership }: { membership: MembershipSummary }) {
  const benefits = [
    "Access to published question banks",
    "Untimed practice and timed mocks",
    "Detailed explanations",
    "Weak-topic and revision tracking",
    "Progress exports and reminders",
  ];

  return (
    <section className={`${styles.section} ${styles.membershipSection}`} aria-labelledby="membership-title">
      <div className={`${styles.container} ${styles.membershipCard}`}>
        <div className={styles.membershipIllustration} aria-hidden="true">
          <span><HomeIcon name="graduation" size={74} /></span>
          <i />
        </div>
        <div className={styles.membershipCopy}>
          <span className={styles.membershipEyebrow}>Optional premium access</span>
          <h2 id="membership-title">
            Get more from your revision with the Semester Pass
          </h2>
          <p>
            Public guides and planning tools stay free. The pass adds focused
            exam-practice features for one semester.
          </p>
          <ul>
            {benefits.map((benefit) => (
              <li key={benefit}>
                <HomeIcon name="check" size={16} />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
        <aside className={styles.priceCard}>
          <span>One-time payment</span>
          <strong>{membership.price}</strong>
          <p>{membership.durationDays} days of access. No automatic renewal.</p>
          <Link className={styles.primaryButton} href="/membership">
            View Semester Pass
            <HomeIcon name="arrow" size={18} />
          </Link>
          <small>
            Secure checkout uses the existing Flutterwave flow when available.
          </small>
        </aside>
      </div>
    </section>
  );
}

function LatestUpdatesSection({ articles }: { articles: ArticleMeta[] }) {
  return (
    <section className={`${styles.section} ${styles.updatesSection}`} aria-labelledby="latest-updates-title">
      <div className={styles.container}>
        <SectionHeading
          eyebrow="Latest from NounCompass"
          title="Recently updated student guidance"
          description="See what has changed recently, then open the full guide for the details."
          href="/student-guides"
          linkLabel="Browse all guides"
        />
        <div className={styles.updatesGrid}>
          {articles.map((article) => (
            <article className={styles.updateCard} key={article.slug}>
              <div className={styles.updateMeta}>
                <span>{article.category.replaceAll("-", " ")}</span>
                <time dateTime={article.updatedAt}>{formatDate(article.updatedAt)}</time>
              </div>
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <Link href={`/articles/${article.slug}`}>
                Read the guide <HomeIcon name="arrow" size={16} />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustAndNewsletterSection() {
  return (
    <section className={`${styles.section} ${styles.trustNewsletter}`}>
      <div className={styles.container}>
        <div className={styles.trustGrid}>
          <div>
            <SectionHeading
              eyebrow="Trust comes from clarity"
              title="Reliable, practical, built for NOUN"
              description="The platform is designed to help students act with more confidence without pretending to be the university."
            />
            <div className={styles.trustPoints}>
              {trustPoints.map((point) => (
                <article key={point.title}>
                  <span><HomeIcon name={point.icon} /></span>
                  <div>
                    <h3>{point.title}</h3>
                    <p>{point.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <aside className={styles.newsletterPanel}>
            <span className={styles.newsletterIcon}><HomeIcon name="mail" /></span>
            <h2>Stay connected, without the noise</h2>
            <p>
              Get occasional reminders, newly updated guides and exam-preparation
              notices from NounCompass.
            </p>
            <div className={styles.newsletterFormWrap}>
              <NewsletterForm />
            </div>
            <div className={styles.socialRow}>
              {socialLinks.map((item) => (
                <a
                  href={item.href}
                  key={item.label}
                  rel="noreferrer"
                  target="_blank"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export function Homepage({
  articles,
  membership,
  metrics,
}: {
  articles: ArticleMeta[];
  membership: MembershipSummary;
  metrics: HomepageMetric[];
}) {
  return (
    <>
      <main className={`nc-homepage ${styles.page}`} id="main-content">
        <HeroSection />
        <QuickAccessSection />
        <StudentToolsSection />
        <PlatformMetrics metrics={metrics} />
        <MembershipSection membership={membership} />
        <LatestUpdatesSection articles={articles} />
        <TrustAndNewsletterSection />
      </main>
    </>
  );
}

export function HomepageFooter() {
  const footerGroups = [
    {
      title: "Platform",
      links: [
        ["Exam preparation", "/exam-prep"],
        ["Course materials", "/course-materials"],
        ["Student tools", "/tools"],
        ["Semester Pass", "/membership"],
      ],
    },
    {
      title: "Student resources",
      links: [
        ["Admissions", "/admission"],
        ["School fees", "/fees"],
        ["Portal help", "/portal"],
        ["Results", "/results"],
        ["Examinations", "/examinations"],
        ["Study centres", "/study-centres"],
        ["GST", "/gst"],
        ["Student guides", "/student-guides"],
      ],
    },
    {
      title: "Trust & support",
      links: [
        ["About", "/about"],
        ["Contact", "/contact"],
        ["Editorial policy", "/editorial-policy"],
        ["Corrections policy", "/corrections-policy"],
        ["Academic integrity", "/academic-integrity"],
        ["Refund policy", "/refund-policy"],
      ],
    },
    {
      title: "Legal",
      links: [
        ["Privacy policy", "/privacy-policy"],
        ["Terms", "/terms"],
        ["Disclaimer", "/disclaimer"],
        ["Copyright policy", "/copyright-policy"],
        ["Takedown policy", "/takedown-policy"],
      ],
    },
  ];

  return (
    <footer className={styles.footer}>
      <div className={`${styles.container} ${styles.footerGrid}`}>
        <div className={styles.footerBrand}>
          <Link aria-label="NOUN Compass homepage" href="/">
            <BrandLogo variant="lockup" tone="dark" />
          </Link>
          <p>{site.description}</p>
          <p className={styles.footerDisclaimer}>
            Independent of the National Open University of Nigeria. Always
            confirm final account details on official NOUN pages.
          </p>
          <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
        </div>
        {footerGroups.map((group) => (
          <nav aria-label={`${group.title} links`} key={group.title}>
            <h2>{group.title}</h2>
            {group.links.map(([label, href]) => (
              <Link href={href} key={href}>{label}</Link>
            ))}
          </nav>
        ))}
      </div>
      <div className={`${styles.container} ${styles.footerBottom}`}>
        <p>© {new Date().getFullYear()} NOUN Compass. All rights reserved.</p>
        <a
          aria-label="Built and managed by WebGrowth"
          className={styles.webGrowthCredit}
          href="https://webgrowth.info"
          rel="noopener noreferrer"
          target="_blank"
        >
          <span>Built and managed by</span>
          <Image
            alt="WebGrowth"
            height={48}
            src="/images/brand/web-growth-logo.webp"
            width={220}
          />
        </a>
      </div>
    </footer>
  );
}
