import Link from "next/link";
import { CategoryCard } from "@/components/article-card";
import { FeaturedGrid, HomeSupportAside, LatestArticles, NewsletterBlock, SearchHero, StartHerePaths } from "@/components/home-sections";
import { categories, site } from "@/data/site";
import { getAllArticles } from "@/lib/articles";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata("NOUN Student Guides for Admission, Fees, Portal, and Results", "Independent NOUN student guides for admission, school fees, portal tasks, results, study centres, GST courses, and student support.", "/");

export default function Home() {
  const articles = getAllArticles();
  const highlightedArticles = articles.slice(0, 8);
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
  return <main id="main-content"><SearchHero /><StartHerePaths /><FeaturedGrid articles={articles} /><section className="band"><div className="container"><div className="section-heading"><div><span className="eyebrow">Find the right path</span><h2>Help by student task</h2></div></div><div className="category-grid">{categories.map((category) => <CategoryCard key={category.slug} {...category} />)}</div></div></section><div className="container content-sidebar"><LatestArticles articles={articles.slice(0, 4)} /><HomeSupportAside /></div><section className="section container"><div className="section-heading"><div><span className="eyebrow">Useful tools</span><h2>Plan your next step</h2></div><Link href="/tools">View available tools -&gt;</Link></div><div className="tool-grid"><Link href="/fees"><span>01</span><h3>School Fees Checker</h3><p>Review an estimated semester breakdown by programme, level, and semester before confirming the final amount officially.</p></Link><Link href="/tools/study-planner"><span>02</span><h3>NOUN Study Planner</h3><p>Generate a weekly reading timetable from your courses, free hours, workdays, and study rhythm.</p></Link><Link href="/tools/cgpa-calculator"><span>03</span><h3>NOUN CGPA Calculator</h3><p>Estimate your grade points, quality points, semester CGPA, and likely class band from your entered scores.</p></Link></div></section><NewsletterBlock /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(featuredGuidesSchema) }} /></main>;
}
