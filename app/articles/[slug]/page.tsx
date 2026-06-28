import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import {
  AdPlaceholder,
  ArticleScreenshot,
  AuthorBox,
  Breadcrumbs,
  DisclaimerBox,
  FAQBlock,
  LastCheckedBox,
  MdxHeading,
  RelatedReads,
  SourceNote,
  TableOfContents,
  slugifyHeading,
} from "@/components/article-elements";
import { BlogCover } from "@/components/BlogCover";
import { getAllArticles, getArticle, formatDate } from "@/lib/articles";
import { getArticleFaqs } from "@/lib/article-faqs";
import { getCategory, site } from "@/data/site";

export function generateStaticParams() {
  return getAllArticles().map(({ slug }) => ({ slug }));
}

function extractMdxFaqs(content: string) {
  const faqStart = content.search(/^##\s+Frequently Asked Questions/im);
  if (faqStart < 0) return [];
  const faqContent = content.slice(faqStart).split(/\n##\s+/)[0];
  const matches = [...faqContent.matchAll(/^###\s+(.+)\n+([\s\S]*?)(?=\n###\s+|\n##\s+|$)/gm)];

  return matches
    .map((match) => ({
      question: match[1].trim(),
      answer: match[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(),
    }))
    .filter((faq) => faq.question && faq.answer);
}

function hasMdxFaqSection(content: string) {
  return /^##\s+Frequently Asked Questions/im.test(content);
}

function extractHeadings(content: string) {
  return [...content.matchAll(/^##\s+(.+)$/gm)]
    .map((match) => match[1].replace(/\[(.*?)\]\([^)]+\)/g, "$1").trim())
    .map((label) => ({ label, id: slugifyHeading(label) }))
    .filter((heading, index, list) => heading.id && list.findIndex((item) => item.id === heading.id) === index)
    .slice(0, 12);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) return {};

  const url = `${site.url}/articles/${slug}`;
  const image = `${url}/opengraph-image`;
  const seoTitle = article.seoTitle ?? article.title;
  const seoDescription = article.seoDescription ?? article.description;

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: [article.primaryKeyword, ...article.secondaryKeywords],
    authors: [
      {
        name: article.author,
        url: article.author === "Victor Chinukwue" ? `${site.url}/authors/victor` : `${site.url}/authors/editorial-team`,
      },
    ],
    creator: article.author,
    publisher: site.name,
    category: article.category,
    alternates: { canonical: url },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author],
      tags: [article.primaryKeyword, ...article.secondaryKeywords],
      images: [{ url: image, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: [image],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) notFound();

  const allArticles = getAllArticles();
  const related = article.relatedArticles
    .map((item) => getArticle(item))
    .filter(Boolean)
    .slice(0, 3) as typeof allArticles;
  const faqs = getArticleFaqs(article.slug);
  const mdxFaqs = extractMdxFaqs(article.content);
  const usesInlineFaqSection = hasMdxFaqSection(article.content);
  const visibleFaqs = [...faqs, ...mdxFaqs].filter(
    (faq, index, list) => list.findIndex((item) => item.question === faq.question) === index,
  );
  const headings = extractHeadings(article.content);
  const authorUrl =
    article.author === "Victor Chinukwue"
      ? `${site.url}/authors/victor`
      : `${site.url}/authors/editorial-team`;
  const category = getCategory(article.category);
  const categoryLabel = category?.name ?? article.category.replace("-", " ");
  const articleUrl = `${site.url}/articles/${article.slug}`;
  const categoryUrl = `${site.url}/${article.category}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    image: `${articleUrl}/opengraph-image`,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    inLanguage: "en-NG",
    isAccessibleForFree: true,
    keywords: [article.primaryKeyword, ...article.secondaryKeywords].join(", "),
    articleSection: categoryLabel,
    author:
      article.author === "Victor Chinukwue"
        ? { "@type": "Person", name: article.author, url: authorUrl }
        : { "@type": "Organization", name: article.author, url: authorUrl },
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
      logo: { "@type": "ImageObject", url: `${site.url}/images/brand/nouncompass-icon.png` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: article.title,
    url: articleUrl,
    description: article.description,
    inLanguage: "en-NG",
    isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
    breadcrumb: { "@id": `${articleUrl}#breadcrumb` },
    about: [article.primaryKeyword, ...article.secondaryKeywords],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${articleUrl}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: categoryLabel, item: categoryUrl },
      { "@type": "ListItem", position: 3, name: article.title, item: articleUrl },
    ],
  };

  const faqSchema = visibleFaqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: visibleFaqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }
    : null;

  const internalHubLinks = [
    { href: categoryUrl, label: `${categoryLabel} hub`, description: `Browse more ${categoryLabel.toLowerCase()} guides.` },
    { href: "/student-guides", label: "All student guides", description: "Search every NOUN Compass guide in one place." },
    { href: "/course-materials", label: "Course materials library", description: "Match course codes with the right study materials." },
    { href: "/tools", label: "Student tools", description: "Open the fees checker and study planner." },
  ];

  return (
    <main id="main-content">
      <article>
        <header className="article-header">
          <div className="container article-header-inner">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: categoryLabel, href: `/${article.category}` },
                { label: article.title },
              ]}
            />
            <Link className="category-label" href={`/${article.category}`}>
              {categoryLabel}
            </Link>
            <h1>{article.title}</h1>
            <p className="article-deck">{article.description}</p>
            <div className="article-meta">
              <span>
                By <strong>{article.author}</strong>
              </span>
              <span>
                Reviewed by <strong>{article.reviewer}</strong>
              </span>
              <span>Updated {formatDate(article.updatedAt)}</span>
              <span>{article.readingTime}</span>
            </div>
          </div>
        </header>

        <div className="container article-layout">
          <aside className="article-side">
            <TableOfContents headings={headings} />
            <AdPlaceholder position="sidebar" />
          </aside>

          <div className="article-main">
            <figure className="article-feature-image">
              <BlogCover
                title={article.title}
                subtitle={article.description}
                category={article.category}
                image={article.image}
                mode="feature"
              />
              <figcaption>
                Branded cover image for this guide. Check the official NOUN pages for final dates,
                fees, or account details.
              </figcaption>
            </figure>

            <LastCheckedBox date={article.updatedAt} />

            <div className="summary-box">
              <strong>Quick take</strong>
              <p>
                {article.description} Check the final details in your own portal or the matching
                official NOUN page.
              </p>
            </div>

            <AdPlaceholder position="after intro" />

            <div className="prose">
              <MDXRemote
                source={article.content}
                components={{
                  ArticleScreenshot,
                  h2: (props) => <MdxHeading level={2} {...props} />,
                  h3: (props) => <MdxHeading level={3} {...props} />,
                  h4: (props) => <MdxHeading level={4} {...props} />,
                }}
                options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
              />
            </div>

            <SourceNote url={article.officialSourceUrl} />

            <section className="related">
              <span className="eyebrow">Keep exploring</span>
              <h2>Continue with the right NOUN hub</h2>
              <div>
                {internalHubLinks.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <span>{categoryLabel}</span>
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </Link>
                ))}
              </div>
            </section>

            <AdPlaceholder position="before FAQ" />

            {!usesInlineFaqSection && visibleFaqs.length > 0 && <FAQBlock faqs={visibleFaqs} />}

            <RelatedReads articles={related.length ? related : allArticles.slice(0, 3)} />
            <AdPlaceholder position="below related articles" />
            <AuthorBox author={article.author} reviewer={article.reviewer} />
            <DisclaimerBox />
          </div>
        </div>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
    </main>
  );
}
