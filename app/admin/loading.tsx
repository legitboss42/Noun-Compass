export default function AdminLoading() {
  return (
    <div className="admin-panel" role="status" aria-live="polite">
      <div className="admin-loading-line" />
      <div className="admin-loading-line admin-loading-line-short" />
      <span className="admin-sr-summary">Loading administration data…</span>
    </div>
  );
}
