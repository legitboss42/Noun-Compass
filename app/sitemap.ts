import type { MetadataRoute } from "next";
import { navItems, site } from "@/data/site";
import { getAllArticles } from "@/lib/articles";
export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();
  const buildDate = new Date();
  const staticPaths = ["", ...navItems.map(({ href }) => href), "/about", "/contact", "/privacy-policy", "/terms", "/disclaimer", "/editorial-policy", "/corrections-policy", "/copyright-policy", "/takedown-policy", "/authors/victor", "/authors/editorial-team"];
  const staticEntries = [...new Set(staticPaths)].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: buildDate,
    changeFrequency: path === "" ? "weekly" as const : path.startsWith("/authors") ? "monthly" as const : "weekly" as const,
    priority: path === "" ? 1 : ["/student-guides", "/fees", "/portal", "/results", "/course-materials"].includes(path) ? 0.9 : 0.7,
  }));
  const articleEntries = articles.map((article) => ({
    url: `${site.url}/articles/${article.slug}`,
    lastModified: new Date(article.updatedAt),
    changeFrequency: "monthly" as const,
    priority: article.featured ? 0.9 : 0.8,
  }));
  return [...staticEntries, ...articleEntries];
}
