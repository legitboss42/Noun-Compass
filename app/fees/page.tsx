import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { Breadcrumbs, DisclaimerBox } from "@/components/article-elements";
import { FeeChecker } from "@/components/fee-checker";
import { SocialLinks } from "@/components/social-links";
import { getArticlesByCategory } from "@/lib/articles";
import { createMetadata } from "@/lib/metadata";
import styles from "./fees.module.css";
import { nounUpdateFeeSnapshotRetrievedAt, pureduFeeSnapshotRetrievedAt } from "@/data/curricula";

export const metadata = createMetadata("NOUN School Fees Checker, Remita, and Fee Guides", "Check NOUN fee breakdowns, plan payments, review Remita steps, and compare semester costs before paying officially.", "/fees");

export default function FeesPage() {
  const articles = getArticlesByCategory("fees");
  const formatDate = (value: string) => new Intl.DateTimeFormat("en-NG", { dateStyle: "long" }).format(new Date(value));
  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "NOUN School Fees Checker",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    url: "https://nouncompass.me/fees",
    description: "Check NOUN fee breakdowns and browse semester course lists with the NounCompass fees checker.",
  };

  return <main id="main-content">
    <div className={styles.hero}><div className={`container ${styles.heroInner}`}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "School Fees Checker" }]} />
      <span className="eyebrow">Plan before you pay</span>
      <h1>NOUN school fees checker</h1>
      <p>Select your faculty, programme, level, and semester to view the available fee breakdown and semester course list inside the NounCompass checker.</p>
      <div className={styles.points}><span>9 faculties</span><span>99 programmes</span><span>488 captured fee breakdowns</span></div>
    </div></div>
    <div className={`container ${styles.content}`}>
      <section className={styles.toolIntro}>
        <span className="eyebrow">Before using the checker</span>
        <h2>Use the estimate to plan, then confirm officially</h2>
        <p>The checker gives you a fast planning view of semester fees, course registration, and exam registration in one place. Use it to compare totals, review course rows, and prepare before you enter the portal.</p>
        <div className={styles.accuracyNote}><strong>Before you pay</strong><p>This checker was last refreshed on {formatDate(pureduFeeSnapshotRetrievedAt)} with fallback updates on {formatDate(nounUpdateFeeSnapshotRetrievedAt)}. Always use the final amount shown on your NOUN portal before you make payment.</p></div>
      </section>
      <FeeChecker />
      <section className={styles.workflowLinks}>
        <span className="eyebrow">Next steps</span>
        <h2>Understand each step before paying</h2>
        <div><Link href="/articles/noun-school-fees-new-students"><strong>School fees guide</strong><span>Plan new-student charges</span></Link><Link href="/articles/how-to-pay-noun-school-fees#understanding-the-noun-e-wallet-system"><strong>E-wallet guidance</strong><span>Check balances and records</span></Link><Link href="/articles/how-to-pay-noun-school-fees"><strong>Remita payment guide</strong><span>Keep your references and proof</span></Link><Link href="/articles/is-noun-eligible-for-nelfund"><strong>NELFUND guide</strong><span>See what applies to NOUN students</span></Link><Link href="/articles/how-to-register-noun-courses"><strong>Course registration</strong><span>Review courses before you submit</span></Link><Link href="/articles/noun-exam-registration-guide"><strong>Exam registration</strong><span>Confirm examinable courses</span></Link></div>
      </section>
      <DisclaimerBox />
      <section className={styles.guides}>
        <div className="section-heading"><div><span className="eyebrow">Understand your payment</span><h2>School fee guides</h2></div></div>
        <div className="archive-grid">{articles.map((article) => <ArticleCard key={article.slug} article={article} />)}</div>
      </section>
      <section className={styles.explainer}>
        <h2>How the school fees checker is built</h2>
        <p>NounCompass organizes fee breakdowns, programme selections, and semester course lists into one planning tool so students can review the likely structure before they pay.</p>
        <h3>What is available now</h3>
        <p>All 99 exposed programmes are listed. The checker currently shows 473 complete fee breakdowns, plus 15 additional recovered gaps. Where no fee amount was available, the course list still appears with fees marked pending.</p>
        <h3>How fee accuracy is handled</h3>
        <p>Use the checker as a planning tool, not as your final bill. Compare the result with your current portal amount before payment, especially if your programme, level, or semester has changed.</p>
        <h3>What to do after checking</h3>
        <p>Compare the estimate with your current portal bill, review every course code, and save the final invoice and payment receipt. If a payment does not reflect, avoid paying again immediately. Keep the transaction reference and use the <Link href="/articles/noun-support-ticket-guide">support-ticket guide</Link>.</p>
        <p>If you are planning around student finance support rather than direct self-funding, read the <Link href="/articles/is-noun-eligible-for-nelfund">NOUN NELFUND eligibility guide</Link> before you rely on any claim about funding.</p>
      </section>
      <SocialLinks
        className="priority-social-links"
        title="Follow NounCompass for school fees and payment updates"
        intro="Use the active NounCompass social pages for fee reminders, Remita guidance, and quick student-help posts tied to the fees checker."
      />
    </div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} />
  </main>;
}
