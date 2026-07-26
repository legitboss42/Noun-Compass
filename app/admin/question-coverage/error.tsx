"use client";

export default function QuestionCoverageError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="admin-panel" role="alert">
      <h1>Coverage data is unavailable</h1>
      <p>The private-engine aggregate could not be loaded. No placeholder metric has been substituted.</p>
      <button className="admin-button" type="button" onClick={reset}>Try again</button>
    </section>
  );
}
