import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type ArticleMeta = {
  title: string;
  seoTitle?: string;
  slug: string;
  description: string;
  seoDescription?: string;
  category: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  author: string;
  reviewer: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: string;
  officialSourceUrl: string;
  relatedArticles: string[];
  image: string;
  featured?: boolean;
  sourceReviewSummary?: string;
  reviewHighlights?: string[];
  reviewedSources?: { label: string; url: string }[];
};

export type Article = ArticleMeta & { content: string };

const contentDirectory = path.join(process.cwd(), "content", "articles");

export function getAllArticles(): Article[] {
  if (!fs.existsSync(contentDirectory)) return [];
  return fs
    .readdirSync(contentDirectory)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const source = fs.readFileSync(path.join(contentDirectory, file), "utf8");
      const { data, content } = matter(source);
      return { ...(data as ArticleMeta), content };
    })
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export function getArticle(slug: string) {
  return getAllArticles().find((article) => article.slug === slug);
}

export function getArticlesByCategory(category: string) {
  return getAllArticles().filter((article) => article.category === category);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}
