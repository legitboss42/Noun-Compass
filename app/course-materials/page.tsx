import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs, DisclaimerBox } from "@/components/article-elements";
import { courseMaterialDownloadUrl, courseMaterials, courseMaterialStats, courseMaterialsRetrievedAt } from "@/lib/course-materials";
import { createMetadata } from "@/lib/metadata";
import { site } from "@/data/site";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string; faculty?: string; page?: string }> }): Promise<Metadata> {
  const params = await searchParams;
  const base = createMetadata(
    "NOUN Course Materials Library",
    "Search NOUN course codes, open study guides, and download course materials from the NounCompass library.",
    "/course-materials",
  );
  const hasFilter = Boolean((params.q ?? "").trim() || (params.faculty ?? "").trim() || ((params.page ?? "").trim() && (params.page ?? "").trim() !== "1"));
  if (!hasFilter) return base;
  return {
    ...base,
    robots: { index: false, follow: true },
  };
}

const pageSize = 24;
const popularCodes = ["GST101", "GST102", "GST302", "CIT104", "MTH101", "ACC101", "BIO101", "CHM101"];

export default async function CourseMaterialsPage({ searchParams }: { searchParams: Promise<{ q?: string; faculty?: string; page?: string }> }) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const faculty = (params.faculty ?? "").trim();
  const requestedPage = Math.max(1, Number(params.page) || 1);
  const normalizedQuery = query.toLowerCase();
  const faculties = [...new Set(courseMaterials.map((material) => material.sourceFaculty))].sort();
  const filtered = courseMaterials.filter((material) =>
    (!faculty || material.sourceFaculty === faculty) &&
    (!normalizedQuery || `${material.code} ${material.title}`.toLowerCase().includes(normalizedQuery)),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(requestedPage, pageCount);
  const results = filtered.slice((page - 1) * pageSize, page * pageSize);
  const checked = new Intl.DateTimeFormat("en-NG", { dateStyle: "long" }).format(new Date(courseMaterialsRetrievedAt));
  const pageHref = (nextPage: number) => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (faculty) next.set("faculty", faculty);
    next.set("page", String(nextPage));
    return `/course-materials?${next.toString()}`;
  };
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "NOUN Course Materials Library",
    description: "Search NOUN course materials by course code or title and download them through the NounCompass library.",
    url: `${site.url}/course-materials`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: results.slice(0, 12).map((material, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `${material.code} ${material.title}`,
        url: `${site.url}/course-materials?q=${encodeURIComponent(material.code)}`,
      })),
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: "Course Materials Library", item: `${site.url}/course-materials` },
    ],
  };

  return <main id="main-content">
    <div className="category-hero"><div className="container">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Course Materials Library" }]} />
      <span className="eyebrow">Study library</span>
      <h1>NOUN Course Materials Library</h1>
      <p>Search by course code or title, review the course details, open a guide, and download the PDF from the NounCompass library. If you want to compare versions, you can also open the linked NOUN page.</p>
      <div className="material-stats"><span>{courseMaterialStats.uniqueCourseCodes.toLocaleString()} indexed course codes</span><span>{courseMaterialStats.sourcePages} linked NOUN course pages</span><span>Last checked {checked}</span></div>
    </div></div>

    <div className="container section material-library">
      <section className="seo-intro material-intro">
        <h2>Find the right course before you study</h2>
        <p>NOUN course titles, codes, levels, and semester placements can shift across programmes and sessions. Search with the exact code on your registration slip, compare the title and faculty, and make sure you are opening the right material for your own record.</p>
      </section>

      <aside className="material-source-disclaimer"><strong>About this library</strong><p>NounCompass organizes these course materials into a cleaner study library so students can find the right PDF faster. When you want to double-check the latest version or compare page details, use the linked NOUN page.</p><p>Report broken, outdated, inaccurate, or wrongly listed materials through our <Link href="/takedown-policy">review and takedown page</Link>, or email <a href={`mailto:${site.contactEmail}?subject=NOUN%20Compass%20material%20report`}>{site.contactEmail}</a>.</p></aside>

      <DisclaimerBox />

      <section className="material-how"><h2>How to use this library</h2><ol><li>Enter the course code from your current registration record.</li><li>Confirm the title, faculty, level, and semester shown in the result.</li><li>Open a related NOUN Compass guide if you need extra help.</li><li>If you want to compare versions, open the linked NOUN page.</li></ol></section>

      <section className="popular-codes"><h2>Popular course codes</h2><div>{popularCodes.map((code) => <Link key={code} href={`/course-materials?q=${code}`}>{code}</Link>)}</div></section>

      <section className="material-browser" aria-labelledby="material-results">
        <form className="material-filters" action="/course-materials">
          <label><span>Search course code or title</span><input name="q" defaultValue={query} placeholder="Try GST101, accounting, public health..." /></label>
          <label><span>Faculty source</span><select name="faculty" defaultValue={faculty}><option value="">All faculties</option>{faculties.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <button type="submit">Search library</button>
        </form>
        <div className="material-results-heading"><h2 id="material-results">Course library results</h2><span>{filtered.length.toLocaleString()} matches · page {page} of {pageCount}</span></div>
        <div className="material-list">{results.map((material) => <article key={`${material.code}-${material.url}`}>
          <div><strong>{material.code}</strong><span>{material.sourceFaculty}</span></div>
          <h3>{material.title}</h3>
          <p className="material-detail">{[material.level && `${material.level} level`, material.semester && `${material.semester} semester`, material.creditUnits && `${material.creditUnits} units`].filter(Boolean).join(" · ") || "Course material listing"}</p>
          <p>Use this page to confirm the course and download the matching PDF from the NounCompass library.</p>
          <small>Last checked: {checked}</small>
          <div className="material-actions"><Link href={`/student-guides?q=${encodeURIComponent(material.code)}`}>Open Guide</Link><a className="material-download" href={courseMaterialDownloadUrl(material)} download>Download PDF</a><a href={material.sourceUrl} target="_blank" rel="noopener noreferrer">Open NOUN Page</a></div>
          <span className="request-material">Need to compare versions or page details? Open the linked NOUN page.</span>
        </article>)}</div>
        {!results.length && <div className="empty-state"><h2>No match found yet</h2><p>Try the exact course code from your registration slip or remove the faculty filter.</p></div>}
        {pageCount > 1 && <nav className="pagination" aria-label="Course library pages">{page > 1 && <Link href={pageHref(page - 1)}>Previous</Link>}<span>Page {page} of {pageCount}</span>{page < pageCount && <Link href={pageHref(page + 1)}>Next</Link>}</nav>}
      </section>

      <section className="material-faq"><h2>Course materials library FAQ</h2><details><summary>Can I download the PDF here?</summary><p>Yes. NounCompass delivers the PDF directly through this library. If you want to compare it with the current NOUN page, use the linked NOUN button.</p></details><details><summary>How do I know a material matches my registered course?</summary><p>Compare the code and title with your current registration record, then double-check the course details before you study from it.</p></details><details><summary>How can I report a material concern?</summary><p>Use the <Link href="/takedown-policy">Takedown Policy</Link> to report a broken, outdated, inaccurate, or wrongly listed material. Include the page URL and course code so the concern can be reviewed.</p></details><details><summary>Why might a download temporarily fail?</summary><p>The source file may be temporarily unavailable, too large for direct delivery, or rate-limited for a short time. You can still use the NOUN page button if needed.</p></details><details><summary>What if I cannot find my course code?</summary><p>Search using only the code, check spacing, or contact your study centre when the listing remains unclear.</p></details></section>

      <section className="related material-related"><h2>Read next</h2><div><Link href="/gst"><strong>GST study guides</strong><small>Build a realistic study plan</small></Link><Link href="/articles/noun-course-materials-pdf"><strong>Materials guide</strong><small>Know when a PDF is enough and when it is not</small></Link><Link href="/portal"><strong>Portal help</strong><small>Handle registration and account tasks</small></Link><Link href="/articles/how-to-register-noun-courses"><strong>Course registration guide</strong><small>Check courses before you submit</small></Link><Link href="/articles/how-to-check-noun-results"><strong>Results guide</strong><small>Follow the next academic step</small></Link><Link href="/articles/noun-support-ticket-guide"><strong>Support guide</strong><small>Report a broken or unclear material properly</small></Link><Link href="/student-guides"><strong>Student guides</strong><small>Browse the full NOUN Compass library</small></Link></div></section>
    </div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
  </main>;
}
