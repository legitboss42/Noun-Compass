import Link from "next/link";
import type { ReactNode } from "react";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="admin-page-header">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions ? <div className="admin-page-actions">{actions}</div> : null}
    </header>
  );
}
export function AdminFeedback({
  error,
  notice,
}: {
  error?: string;
  notice?: string;
}) {
  return (
    <>
      {error ? (
        <p className="admin-feedback admin-feedback-error" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="admin-feedback admin-feedback-success" role="status">
          {notice}
        </p>
      ) : null}
    </>
  );
}

export function AdminStatCard({
  label,
  value,
  detail,
  href,
  unavailable = false,
}: {
  label: string;
  value: ReactNode;
  detail: string;
  href?: string;
  unavailable?: boolean;
}) {
  const content = (
    <>
      <span>{label}</span>
      <strong>{unavailable ? "Unavailable" : value}</strong>
      <small>{detail}</small>
    </>
  );
  return href ? (
    <Link className="admin-stat-card" href={href}>
      {content}
    </Link>
  ) : (
    <article className="admin-stat-card">{content}</article>
  );
}

export function AdminStatusBadge({ value }: { value: string | null | undefined }) {
  const status = (value ?? "unknown").toLowerCase();
  const tone = [
    "active",
    "success",
    "published",
    "resolved",
    "verified",
    "completed",
  ].includes(status)
    ? "positive"
    : ["failed", "revoked", "rejected", "urgent", "chargeback"].includes(status)
      ? "negative"
      : ["pending", "review", "reviewing", "in-progress", "high"].includes(status)
        ? "warning"
        : "neutral";
  return (
    <span className={`admin-status admin-status-${tone}`}>
      {status.replaceAll("-", " ")}
    </span>
  );
}

export type AdminColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

export function AdminDataTable<T>({
  caption,
  columns,
  rows,
  rowKey,
  emptyTitle = "No matching records",
  emptyDescription = "Try changing the current search or filters.",
}: {
  caption: string;
  columns: readonly AdminColumn<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (!rows.length) {
    return (
      <AdminEmptyState title={emptyTitle} description={emptyDescription} />
    );
  }
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={column.className}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td key={column.key} className={column.className}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="admin-empty-state">
      <span aria-hidden="true">○</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

export function AdminPagination({
  page,
  pageSize,
  total,
  buildHref,
}: {
  page: number;
  pageSize: number;
  total: number;
  buildHref: (page: number) => string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  return (
    <nav className="admin-pagination" aria-label="Pagination">
      {page > 1 ? <Link href={buildHref(page - 1)}>Previous</Link> : <span />}
      <span>
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? <Link href={buildHref(page + 1)}>Next</Link> : <span />}
    </nav>
  );
}

export function AdminConfirmationFields({
  phrase,
  reasonLabel = "Reason",
}: {
  phrase: string;
  reasonLabel?: string;
}) {
  return (
    <div className="admin-confirmation">
      <label>
        {reasonLabel}
        <textarea name="reason" minLength={5} maxLength={1000} required rows={3} />
      </label>
      <label>
        Type <strong>{phrase}</strong> to confirm
        <input
          name="confirmation"
          required
          autoComplete="off"
          pattern={phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}
        />
      </label>
    </div>
  );
}
