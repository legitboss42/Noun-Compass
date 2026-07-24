import "server-only";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const requiredFields = [
  "title",
  "slug",
  "description",
  "category",
  "primaryKeyword",
  "author",
  "reviewer",
  "publishedAt",
  "updatedAt",
  "readingTime",
  "officialSourceUrl",
  "image",
] as const;

export type ArticleAdminRecord = {
  fileName: string;
  filePath: string;
  title: string;
  slug: string;
  category: string;
  publishedAt: string | null;
  updatedAt: string | null;
  readingTime: string | null;
  author: string | null;
  reviewer: string | null;
  image: string | null;
  draft: boolean;
  metadataComplete: boolean;
  missingFields: string[];
  brokenRelatedArticles: string[];
  missingImage: boolean;
  invalidFrontmatter: string | null;
};

export function inspectArticles(): ArticleAdminRecord[] {
  const directory = path.join(process.cwd(), "content", "articles");
  if (!fs.existsSync(directory)) return [];
  const sources = fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".mdx"))
    .map((fileName) => {
      const filePath = path.join(directory, fileName);
      try {
        const parsed = matter(fs.readFileSync(filePath, "utf8"));
        return { fileName, filePath, data: parsed.data, error: null };
      } catch (error) {
        return {
          fileName,
          filePath,
          data: {} as Record<string, unknown>,
          error: error instanceof Error ? error.message : "Invalid frontmatter",
        };
      }
    });
  const slugs = new Set(
    sources
      .map((source) => String(source.data.slug ?? "").trim())
      .filter(Boolean),
  );

  return sources
    .map(({ fileName, filePath, data, error }) => {
      const missingFields = requiredFields.filter((field) => {
        const fieldValue = data[field];
        return (
          fieldValue === null ||
          fieldValue === undefined ||
          (typeof fieldValue === "string" && !fieldValue.trim())
        );
      });
      const related = Array.isArray(data.relatedArticles)
        ? data.relatedArticles.map(String)
        : [];
      const image = typeof data.image === "string" ? data.image : null;
      const imagePath = image
        ? path.join(process.cwd(), "public", image.replace(/^\/+/, ""))
        : null;
      return {
        fileName,
        filePath,
        title: String(data.title ?? fileName),
        slug: String(data.slug ?? fileName.replace(/\.mdx$/, "")),
        category: String(data.category ?? "Uncategorised"),
        publishedAt:
          typeof data.publishedAt === "string" ? data.publishedAt : null,
        updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : null,
        readingTime:
          typeof data.readingTime === "string" ? data.readingTime : null,
        author: typeof data.author === "string" ? data.author : null,
        reviewer: typeof data.reviewer === "string" ? data.reviewer : null,
        image,
        draft: data.draft === true,
        metadataComplete: missingFields.length === 0 && !error,
        missingFields,
        brokenRelatedArticles: related.filter((slug) => !slugs.has(slug)),
        missingImage: Boolean(imagePath && !fs.existsSync(imagePath)),
        invalidFrontmatter: error,
      };
    })
    .sort((left, right) => left.title.localeCompare(right.title));
}
