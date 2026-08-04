import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { Breadcrumbs, DisclaimerBox } from "@/components/article-elements";
import { FeeChecker } from "@/components/fee-checker";
import { SocialLinks } from "@/components/social-links";
import { getArticlesByCategory } from "@/lib/articles";
import { createMetadata } from "@/lib/metadata";
import { getCurrentUser } from "@/lib/platform/auth";
import styles from "./fees.module.css";
import { nounUpdateFeeSnapshotRetrievedAt, pureduFeeSnapshotRetrievedAt } from "@/data/curricula";

export const metadata = createMetadata("NOUN Fees Checker (2026): Cost by Programme", "Free NOUN fees checker: see estimated school fees by programme, level, and semester, plus course, exam, and compulsory charges before you pay.", "/fees");

export default async function FeesPage() {
  const user = await getCurrentUser();
  const articles = getArticlesByCategory("fees");
  const formatDate = (value: string) => new Intl.DateTimeFormat("en-NG", { dateStyle: "long" }).format(new Date(value));
  const prioritizedArticles = [...articles].sort((left, right) => feeGuidePriority(left) - feeGuidePriority(right)).slice(0, 6);
  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "NOUN School Fees Checker",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    url: "https://nouncompass.me/fees",
    description: "Check NOUN fee breakdowns and browse semester course lists with the NounCompass fees checker.",
  };

  return <main id="main-content" className="experience-page">
    <div className={`category-hero ${styles.feesHero}`}><div className="container">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "School Fees Checker" }]} />
      <span className="eyebrow">Plan before you pay</span>
      <h1>NOUN school fees checker</h1>
      <p>Select your faculty, programme, level, and semester to view the available fee breakdown and semester course list inside the NounCompass checker.</p>
      <div className={styles.points}><span>9 faculties</span><span>99 programmes</span><span>488 fee breakdowns listed</span></div>
      <div className={styles.heroActions}>
        {user ? <a className="button" href="#fee-checker">Open fee checker</a> : <Link className="button" href="/account/sign-in?next=/fees">Sign in to check fees</Link>}
        {!user && <Link href="/account/sign-up">Create a free account <span aria-hidden="true">→</span></Link>}
      </div>
      <p className={styles.heroUpdated}>Fee data last refreshed {formatDate(pureduFeeSnapshotRetrievedAt)}. Confirm the final amount on your current NOUN portal before paying.</p>
    </div></div>
    <div className={`container ${styles.content}`}>
      <div id="fee-checker" className={styles.checkerShell}>
        {user ? <FeeChecker /> : <section className={`platform-panel ${styles.accountGate}`}><div><span className="eyebrow">Account required</span><h2>Sign in to build your fee estimate</h2><p>Create a free NounCompass account or sign in to review the breakdown, semester courses, and downloadable report. Your latest result will also remain available in your student workspace.</p></div><div className="platform-auth-links"><Link className="button" href="/account/sign-in?next=/fees">Sign in</Link><Link href="/account/sign-up">Create free account</Link></div></section>}
      </div>
      <aside className={styles.planningNote}>
        <span aria-hidden="true">i</span>
        <div><strong>Use this as a planning estimate.</strong><p>Primary fee data was refreshed on {formatDate(pureduFeeSnapshotRetrievedAt)}, with fallback updates from {formatDate(nounUpdateFeeSnapshotRetrievedAt)}. Your current portal bill remains the final amount.</p></div>
      </aside>
      <section className={styles.workflowLinks}>
        <span className="eyebrow">Your payment journey</span>
        <h2>Move from estimate to verified payment</h2>
        <div><Link href="/articles/noun-school-fees-new-students"><em>01</em><strong>Understand the charges</strong><span>Review the likely compulsory and semester costs.</span></Link><Link href="/articles/how-to-pay-noun-school-fees#understanding-the-noun-e-wallet-system"><em>02</em><strong>Check your e-wallet</strong><span>Compare balances, charges, and existing records.</span></Link><Link href="/articles/how-to-pay-noun-school-fees"><em>03</em><strong>Pay through the right route</strong><span>Follow the Remita process and keep every reference.</span></Link><Link href="/articles/how-to-register-noun-courses"><em>04</em><strong>Verify before registration</strong><span>Confirm the payment reflected before selecting courses.</span></Link></div>
      </section>
      <DisclaimerBox />
      <section className={styles.guides}>
        <div className="section-heading"><div><span className="eyebrow">Understand your payment</span><h2>Essential school fee guides</h2></div><Link href="/student-guides?q=school+fees">View all fee guides</Link></div>
        <div className="archive-grid">{prioritizedArticles.map((article) => <ArticleCard key={article.slug} article={article} ctaLabel="Read guide" />)}</div>
      </section>
      <section className={styles.explainer}>
        <header><span className="eyebrow">Know what the estimate means</span><h2>Plan confidently without treating an estimate as a bill</h2><p>NounCompass combines available fee breakdowns and semester course lists so you can understand the likely structure before opening the portal.</p></header>
        <div className={styles.explainerGrid}><article><span>01</span><h3>Coverage</h3><p>All 99 listed programmes are included: 473 complete fee breakdowns and 15 additional cases where a course list is available without a confirmed amount.</p></article><article><span>02</span><h3>Final verification</h3><p>Compare the estimate with your current portal bill, especially when your programme, level, semester, or registered courses have changed.</p></article><article><span>03</span><h3>Keep proof</h3><p>Save the invoice, transaction reference, receipt, and course-registration record. If payment does not reflect, avoid paying twice and use the <Link href="/articles/noun-support-ticket-guide">support guide</Link>.</p></article></div>
        <p className={styles.fundingNote}>Planning around student finance support? Read the <Link href="/articles/is-noun-eligible-for-nelfund">NOUN NELFUND eligibility guide</Link> before relying on a funding claim.</p>
      </section>
      <SocialLinks
        className="priority-social-links"
        title="Follow NounCompass for school fees and payment updates"
        intro="Use the NounCompass social pages for fee reminders, Remita guidance, and short updates tied to the fees checker."
      />
    </div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} />
  </main>;
}

function feeGuidePriority(article: { title: string; slug: string }) {
  const text = `${article.title} ${article.slug}`.toLowerCase();
  if (text.includes("school fees")) return 0;
  if (text.includes("e-wallet")) return 1;
  if (text.includes("remita")) return 2;
  if (text.includes("refund")) return 3;
  if (text.includes("course registration")) return 4;
  if (text.includes("nelfund")) return 6;
  return 5;
}
