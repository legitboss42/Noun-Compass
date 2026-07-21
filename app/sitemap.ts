import type { MetadataRoute } from "next";
import { navItems, site } from "@/data/site";
import { getAllArticles } from "@/lib/articles";
export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();
  const staticPaths = [
    "",
    ...navItems.map(({ href }) => href),
    "/tools/cgpa-calculator",
    "/tools/result-checker",
    "/tools/study-planner",
    "/membership",
    "/refund-policy",
    "/academic-integrity",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/disclaimer",
    "/editorial-policy",
    "/corrections-policy",
    "/copyright-policy",
    "/takedown-policy",
  ];
  const highPriorityPaths = new Set([
    "/student-guides",
    "/fees",
    "/portal",
    "/results",
    "/course-materials",
    "/tools",
    "/tools/cgpa-calculator",
    "/tools/study-planner",
  ]);
  const staticEntries = [...new Set(staticPaths)].map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency:
      path === ""
        ? ("weekly" as const)
        : ("weekly" as const),
    priority: path === "" ? 1 : highPriorityPaths.has(path) ? 0.9 : 0.7,
  }));
  const articleEntries = articles.map((article) => ({
    url: `${site.url}/articles/${article.slug}`,
    lastModified: new Date(article.updatedAt),
    changeFrequency: "monthly" as const,
    priority: article.featured ? 0.9 : 0.8,
  }));
  return [...staticEntries, ...articleEntries];
}
