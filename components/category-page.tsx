import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { Breadcrumbs } from "@/components/article-elements";
import { TrendingSidebar } from "@/components/home-sections";
import { SocialLinks } from "@/components/social-links";
import { categories, type Category } from "@/data/site";
import type { ArticleMeta } from "@/lib/articles";

const searchFallbackLinks = [
  { label: "Admissions", href: "/admission" },
  { label: "Fees", href: "/fees" },
  { label: "Portal & Registration", href: "/portal" },
  { label: "Results", href: "/results" },
  { label: "Study Centres", href: "/study-centres" },
  { label: "NELFUND", href: "/articles/is-noun-eligible-for-nelfund" },
];

export function CategoryPage({
  category,
  articles,
  allArticles,
  query = "",
}: {
  category: Category;
  articles: ArticleMeta[];
  allArticles: ArticleMeta[];
  query?: string;
}) {
  const guideLabel = /guide/i.test(category.name) ? category.name : `${category.name} guides`;
  const trimmedQuery = query.trim();
  const siblingCategories = categories.filter((item) => item.slug !== category.slug).slice(0, 6);
  const prioritySocialCategories = new Set(["admission", "portal", "results", "student-guides"]);

  return (
    <main id="main-content">
      <div className="category-hero">
        <div className="container">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: category.name }]} />
          <span className="eyebrow">{category.eyebrow}</span>
          <h1>{category.name}</h1>
          <p>{category.description}</p>
          {category.slug === "student-guides" && (
            <form className="search-box category-search" action="/student-guides">
              <label className="sr-only" htmlFor="guide-search">
                Search student guides
              </label>
              <input
                id="guide-search"
                name="q"
                defaultValue={query}
                placeholder="Search fees, registration, TMA, results, study centres, NELFUND..."
              />
              <button type="submit">Search guides</button>
            </form>
          )}
        </div>
      </div>

      <div className="container content-sidebar">
        <section id="guides" className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Reviewed student help</span>
              <h2>{trimmedQuery ? `Search results for "${trimmedQuery}"` : guideLabel}</h2>
            </div>
          </div>

          {articles.length ? (
            <>
              <div className="search-support-row">
                {trimmedQuery && (
                  <p>Try a related phrase if you need broader matches, then use the category links below to keep going.</p>
                )}
                <div className="search-support-links">
                  {searchFallbackLinks.map((item) => (
                    <Link key={item.href} href={item.href}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="archive-grid">
                {articles.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state search-empty-state">
              <h2>{trimmedQuery ? "No matching guide found yet" : "New guides are being prepared"}</h2>
              <p>
                {trimmedQuery
                  ? "Try a shorter topic, a course code, or one of the sections below. Search works from the article titles, summaries, categories, and keywords already on the site."
                  : "Use our existing student guides while this section grows."}
              </p>
              <div className="search-support-links">
                {searchFallbackLinks.map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label}
                  </Link>
                ))}
              </div>
              <Link className="button" href="/student-guides">
                Browse all student guides
              </Link>
            </div>
          )}

          {(category.slug === "examinations" || category.slug === "gst") && <aside className="platform-upgrade contextual-exam-prep"><div><span className="eyebrow">Free account option</span><h2>{category.slug === "gst" ? "Prepare for supported GST courses" : "Turn exam guidance into study practice"}</h2><p>Check the supported course list, create a free account, and try a short diagnostic when sample questions are available.</p></div><Link className="button" href="/exam-prep">See exam preparation</Link><Link href="/dashboard/practice">Try free diagnostic</Link></aside>}

          <div className="seo-intro">
            <h2>How NOUN Compass approaches {category.name.toLowerCase()}</h2>
            {category.slug === "portal" && (
              <p>
                Start with the exact task you need to finish. For most account issues, that means
                checking the current <Link href="/articles/nouonline-student-dashboard">student dashboard</Link>,
                then using the right guide for <Link href="/articles/noun-portal-password-reset">password reset</Link>,
                <Link href="/articles/update-profile-nouonline"> profile updates</Link>, or the next
                registration step.
              </p>
            )}
            {category.slug === "results" && (
              <p>
                Open the <Link href="/tools/result-checker">NOUN result checker</Link> when you have a
                matriculation number, start with <Link href="/articles/how-to-find-noun-results-on-my-progress">My progress</Link>,
                continue to <Link href="/articles/how-to-open-your-noun-result-statement-from-the-support-portal">Result statement</Link> when you need the deeper academic record, and use the <Link href="/tools/cgpa-calculator">CGPA calculator</Link> only for planning before you compare it with your official NOUN result page.
              </p>
            )}
            <p>
              {category.description} We start with the task a student is trying to finish, explain
              the records and decisions involved, and point out what still needs to be checked on
              the official NOUN side.
            </p>
            <p>
              Dates, fees, requirements, and portal labels can change. Treat old screenshots,
              forwarded messages, and another student&apos;s record as helpful context, not final proof.
            </p>
            <p>
              Before you act, check the programme, level, semester, student details, and deadline
              that apply to your own case. Save receipts, references, and final records so you can
              spot problems early and explain them clearly if support asks questions later.
            </p>
            <p>
              If two sources disagree, follow the one that matches your current official record. Use the
              instruction tied most closely to your current official record, and ask an authorized
              channel when the difference could affect payment or academic progress.
            </p>
            <p>
              Some problems overlap. A {category.name.toLowerCase()} issue can also affect payment,
              registration, exams, results, or support. Follow the related links, but compare every
              final action with your own current official record.
            </p>
            <p>
              Keep control of your personal information. Do not share passwords, one-time codes,
              full payment-card details, or open portal access with an outside website or random
              helper.
            </p>
            <p>
              NOUN Compass cannot access student accounts, take payments, change records, or make
              academic decisions. Your current official NOUN record should always come first.
            </p>
          </div>

          {prioritySocialCategories.has(category.slug) && (
            <SocialLinks
              className="priority-social-links"
              title={`Follow NounCompass for ${category.name.toLowerCase()} updates`}
              intro="These are the NounCompass social pages for quick reminders and short updates."
            />
          )}

          <section className="related">
            <span className="eyebrow">Related topic hubs</span>
            <h2>Keep exploring related NOUN help</h2>
            <div>
              {siblingCategories.map((item) => (
                <Link key={item.slug} href={`/${item.slug}`}>
                  <span>{item.eyebrow}</span>
                  <strong>{item.name}</strong>
                  <small>{item.description}</small>
                </Link>
              ))}
            </div>
          </section>
        </section>

        <TrendingSidebar articles={allArticles} />
      </div>
    </main>
  );
}
