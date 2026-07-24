import Link from "next/link";
import {
  AdminDataTable,
  AdminPageHeader,
  AdminStatusBadge,
  type AdminColumn,
} from "@/components/admin/admin-ui";
import { CopyPathButton } from "@/components/admin/copy-path-button";
import { requirePermission } from "@/lib/platform/admin-auth";
import {
  inspectArticles,
  type ArticleAdminRecord,
} from "@/lib/platform/article-admin";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("articles.read", "/admin/articles");
  const params = await searchParams;
  const allArticles = inspectArticles();
  const categories = [...new Set(allArticles.map((article) => article.category))].sort();
  const query = params.q?.trim().toLowerCase() ?? "";
  const articles = allArticles.filter((article) => {
    if (
      query &&
      !article.title.toLowerCase().includes(query) &&
      !article.slug.toLowerCase().includes(query)
    ) {
      return false;
    }
    if (params.category && article.category !== params.category) return false;
    if (params.status === "draft" && !article.draft) return false;
    if (params.status === "published" && article.draft) return false;
    if (
      params.health === "issues" &&
      article.metadataComplete &&
      !article.missingImage &&
      !article.brokenRelatedArticles.length
    ) {
      return false;
    }
    return true;
  });
  const issueCount = allArticles.filter(
    (article) =>
      !article.metadataComplete ||
      article.missingImage ||
      article.brokenRelatedArticles.length,
  ).length;
  const columns: AdminColumn<ArticleAdminRecord>[] = [
    {
      key: "article",
      header: "Article",
      render: (article) => (
        <>
          <strong>{article.title}</strong>
          <small>/articles/{article.slug}</small>
        </>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (article) => article.category,
    },
    {
      key: "dates",
      header: "Published / updated",
      render: (article) => (
        <>
          <strong>{article.publishedAt || "Not set"}</strong>
          <small>Updated {article.updatedAt || "not set"}</small>
        </>
      ),
    },
    {
      key: "editorial",
      header: "Editorial",
      render: (article) => (
        <>
          <strong>{article.author || "Author missing"}</strong>
          <small>{article.reviewer || "Reviewer missing"}</small>
          <small>{article.readingTime || "Reading time missing"}</small>
        </>
      ),
    },
    {
      key: "health",
      header: "Validation",
      render: (article) => (
        <div className="admin-table-actions">
          <AdminStatusBadge
            value={
              article.invalidFrontmatter
                ? "invalid"
                : article.metadataComplete &&
                    !article.missingImage &&
                    !article.brokenRelatedArticles.length
                  ? "verified"
                  : "review"
            }
          />
          {article.missingFields.length ? (
            <small>Missing: {article.missingFields.join(", ")}</small>
          ) : null}
          {article.missingImage ? <small>Image file is missing</small> : null}
          {article.brokenRelatedArticles.length ? (
            <small>
              Broken related slugs: {article.brokenRelatedArticles.join(", ")}
            </small>
          ) : null}
          {article.invalidFrontmatter ? (
            <small>{article.invalidFrontmatter}</small>
          ) : null}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (article) => (
        <AdminStatusBadge value={article.draft ? "draft" : "published"} />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (article) => (
        <div className="admin-table-actions">
          <Link
            className="admin-button admin-button-secondary admin-button-small"
            href={`/articles/${article.slug}`}
            target="_blank"
          >
            Preview
          </Link>
          <CopyPathButton value={article.filePath} />
          <details>
            <summary>Frontmatter summary</summary>
            <p><strong>File:</strong> {article.fileName}</p>
            <p><strong>Image:</strong> {article.image || "Not set"}</p>
            <p><strong>Author:</strong> {article.author || "Not set"}</p>
            <p><strong>Reviewer:</strong> {article.reviewer || "Not set"}</p>
          </details>
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Filesystem editorial inventory"
        title="Articles"
        description="Inspect the MDX content actually published from the repository. This surface validates metadata and links honestly; it does not pretend serverless filesystem edits are durable."
      />
      <div className="admin-stat-grid">
        <article className="admin-stat-card">
          <span>Total MDX articles</span>
          <strong>{allArticles.length}</strong>
          <small>Read directly from content/articles</small>
        </article>
        <article className="admin-stat-card">
          <span>Published files</span>
          <strong>{allArticles.filter((article) => !article.draft).length}</strong>
          <small>Files not marked draft</small>
        </article>
        <article className="admin-stat-card">
          <span>Draft files</span>
          <strong>{allArticles.filter((article) => article.draft).length}</strong>
          <small>Draft frontmatter is respected</small>
        </article>
        <article className="admin-stat-card">
          <span>Files needing review</span>
          <strong>{issueCount}</strong>
          <small>Metadata, image, frontmatter, or related-link issues</small>
        </article>
      </div>
      <section className="admin-panel">
        <form className="admin-filters" method="get">
          <label>
            Title or slug
            <input name="q" defaultValue={params.q ?? ""} />
          </label>
          <label>
            Category
            <select name="category" defaultValue={params.category ?? ""}>
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>
          <label>
            Publication
            <select name="status" defaultValue={params.status ?? ""}>
              <option value="">Any status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </label>
          <label>
            Validation
            <select name="health" defaultValue={params.health ?? ""}>
              <option value="">All files</option>
              <option value="issues">Needs review</option>
            </select>
          </label>
          <div className="admin-filter-actions">
            <button className="admin-button" type="submit">Apply</button>
            <Link className="admin-button admin-button-secondary" href="/admin/articles">Reset</Link>
          </div>
        </form>
      </section>
      <section className="admin-panel">
        <div className="admin-panel-heading">
          <h2>{articles.length.toLocaleString("en-NG")} matching files</h2>
        </div>
        <AdminDataTable
          caption="Filesystem MDX articles"
          columns={columns}
          rows={articles}
          rowKey={(article) => article.fileName}
        />
      </section>
    </>
  );
}
