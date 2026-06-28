import type { Metadata } from "next";
import { CategoryPage } from "@/components/category-page";
import { getCategory, site } from "@/data/site";
import { getAllArticles, getArticlesByCategory } from "@/lib/articles";
import { createMetadata } from "@/lib/metadata";

export function categoryMetadata(slug: string): Metadata {
  const category = getCategory(slug)!;
  const categoryTitles: Record<string, string> = {
    admission: "NOUN Admission Guides",
    portal: "NOUN Portal and Registration Guides",
    results: "NOUN Results Guides",
    examinations: "NOUN Examination Guides",
    "study-centres": "NOUN Study Centre Guides",
    gst: "NOUN GST Course Guides",
    "student-guides": "NOUN Student Guides",
  };
  const title = categoryTitles[slug] ?? (/guide/i.test(category.name) ? category.name : `NOUN ${category.name} Guides`);
  return createMetadata(title, category.description, `/${slug}`);
}

export function CategoryRoute({ slug, query = "" }: { slug: string; query?: string }) {
  const allArticles = getAllArticles();
  const normalizedQuery = query.trim().toLowerCase();
  const category = getCategory(slug)!;
  const articles = normalizedQuery
    ? allArticles.filter((article) => `${article.title} ${article.description} ${article.category} ${article.primaryKeyword} ${article.secondaryKeywords.join(" ")}`.toLowerCase().includes(normalizedQuery))
    : getArticlesByCategory(slug);
  const collectionSchema = !normalizedQuery ? {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description,
    url: `${site.url}/${slug}`,
    inLanguage: "en-NG",
    isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: articles.slice(0, 12).map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${site.url}/articles/${article.slug}`,
        name: article.title,
      })),
    },
  } : null;
  const breadcrumbSchema = !normalizedQuery ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: category.name, item: `${site.url}/${slug}` },
    ],
  } : null;
  return <><CategoryPage category={category} articles={articles} allArticles={allArticles} query={query} />{collectionSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />}{breadcrumbSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />}</>;
}
