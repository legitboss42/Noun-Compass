import Link from "next/link";
import { CategoryCard } from "@/components/article-card";
import { FeaturedGrid, HomeSupportAside, LatestArticles, NewsletterBlock, SearchHero, StartHerePaths, TopicClusterHighlights } from "@/components/home-sections";
import { categories, site } from "@/data/site";
import { getAllArticles } from "@/lib/articles";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata("NOUN Student Guides for Admission, Fees, Portal, and Results", "Independent NOUN student guides for admission, school fees, portal tasks, results, study centres, GST courses, and student support.", "/");

export default function Home() {
  const articles = getAllArticles();
  const homepagePrioritySlugs = [
    "how-to-pay-noun-school-fees",
    "how-to-register-noun-courses",
    "how-to-check-noun-results",
    "how-to-open-your-noun-result-statement-from-the-support-portal",
    "how-to-submit-tma-on-noun-elearn",
    "nelfund-application-status-meanings-explained",
  ];
  const highlightedArticles = homepagePrioritySlugs
    .map((slug) => articles.find((article) => article.slug === slug))
    .filter(Boolean) as typeof articles;
  const latestArticles = articles.filter((article) => !homepagePrioritySlugs.includes(article.slug)).slice(0, 3);
  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "NOUN Student Guides for Admission, Fees, Portal, and Results",
    url: site.url,
    description: "Independent NOUN student guides for admission, school fees, portal tasks, results, study centres, GST courses, and student support.",
    inLanguage: "en-NG",
    isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
    about: categories.map((category) => category.name),
  };
  const featuredGuidesSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Featured NOUN student guides",
    itemListElement: highlightedArticles.map((article, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${site.url}/articles/${article.slug}`,
      name: article.title,
    })),
  };
  return <main id="main-content"><SearchHero /><StartHerePaths /><FeaturedGrid articles={highlightedArticles.length ? highlightedArticles : articles} /><TopicClusterHighlights articles={articles} /><section className="band"><div className="container"><div className="section-heading"><div><span className="eyebrow">Find the right path</span><h2>Help by student task</h2></div></div><div className="category-grid">{categories.slice(0, 6).map((category) => <CategoryCard key={category.slug} {...category} />)}</div><div className="band-link-row"><Link href="/student-guides">Browse all student guide categories -&gt;</Link></div></div></section><div className="container content-sidebar"><LatestArticles articles={latestArticles} /><HomeSupportAside /></div><section className="section container"><div className="section-heading"><div><span className="eyebrow">Useful tools</span><h2>Plan your next step</h2></div><Link href="/tools">View available tools -&gt;</Link></div><div className="tool-grid tool-grid-single"><Link href="/fees"><span>01</span><h3>School Fees Checker</h3><p>Review an estimated semester breakdown by programme, level, and semester before confirming the final amount officially.</p></Link></div></section><NewsletterBlock /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(featuredGuidesSchema) }} /></main>;
}
