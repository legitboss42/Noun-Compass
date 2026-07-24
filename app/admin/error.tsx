"use client";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="admin-panel" role="alert">
      <h1>Administration data could not be loaded</h1>
      <p>
        No changes were made. Try the request again; if it continues, check the
        database connection and server logs.
      </p>
      <button className="admin-button" type="button" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
