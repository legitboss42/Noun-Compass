import Link from "next/link";
import { BlogCover } from "@/components/BlogCover";
import { getCategory } from "@/data/site";
import type { ArticleMeta } from "@/lib/articles";
import { formatDate } from "@/lib/articles";

export function ArticleCard({ article, large = false, compact = false, rank }: { article: ArticleMeta; large?: boolean; compact?: boolean; rank?: number }) {
  const categoryLabel = getCategory(article.category)?.name ?? article.category.replace("-", " ");
  return <article className={`article-card ${large ? "article-card-large" : ""} ${compact ? "article-card-compact" : ""}`}><Link className="card-image" href={`/articles/${article.slug}`} aria-label={article.title}><BlogCover title={article.title} subtitle={rank ? `Trending guide ${String(rank).padStart(2, "0")}` : article.description} category={article.category} image={article.image} imageAlt={article.title} mode="card" priorityImage={large} /></Link><div className="card-body"><Link className="category-label" href={`/${article.category}`}>{categoryLabel}</Link><h3><Link href={`/articles/${article.slug}`}>{article.title}</Link></h3><p>{article.description}</p><div className="card-meta"><span>{article.readingTime}</span><span>Updated {formatDate(article.updatedAt)}</span></div></div></article>;
}

export function CategoryCard({ name, slug, description }: { name: string; slug: string; description: string }) {
  return <Link className="category-card" href={`/${slug}`}><span>Explore</span><h3>{name}</h3><p>{description}</p><strong>View guides -&gt;</strong></Link>;
}
