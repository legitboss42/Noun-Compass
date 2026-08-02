"use client";

import { useState } from "react";

type Answer = { title: string; answer: string; bullets: string[]; warnings: string[] };

export function AdminAiAssistant({
  feature,
  ticketId,
  articles = [],
}: {
  feature: "support-draft" | "admin-content-review";
  ticketId?: string;
  articles?: Array<{ slug: string; title: string }>;
}) {
  const [articleSlug, setArticleSlug] = useState(articles[0]?.slug ?? "");
  const [result, setResult] = useState<Answer | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true); setStatus(""); setResult(null);
    try {
      const response = await fetch("/api/admin/ai-assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ feature, ticketId, articleSlug }) });
      const payload = await response.json() as { result?: Answer; message?: string; cached?: boolean };
      if (!response.ok || !payload.result) { setStatus(payload.message || "The staff assistant could not complete this request."); return; }
      setResult(payload.result); setStatus(payload.cached ? "Loaded from cache; no new AI request was used." : "Draft generated for staff review only.");
    } catch { setStatus("The staff assistant request was interrupted. No automatic retry was made."); }
    finally { setBusy(false); }
  }
  return <section className="admin-panel"><h2>{feature === "support-draft" ? "AI-assisted reply draft" : "AI content intelligence"}</h2><p>{feature === "support-draft" ? "Creates a private suggestion from this ticket. It never sends a reply or changes ticket status." : "Reviews one repository article on demand. It never edits or publishes a file."}</p>{feature === "admin-content-review" ? <label>Article<select value={articleSlug} onChange={(event) => setArticleSlug(event.target.value)}>{articles.map((article) => <option key={article.slug} value={article.slug}>{article.title}</option>)}</select></label> : null}<button className="admin-button" disabled={busy || (feature === "admin-content-review" && !articleSlug)} onClick={() => void run()} type="button">{busy ? "Generating…" : "Generate private suggestion"}</button>{status ? <p className={result ? "admin-feedback admin-feedback-success" : "admin-feedback admin-feedback-error"}>{status}</p> : null}{result ? <article className="admin-ai-result"><h3>{result.title}</h3><p>{result.answer}</p>{result.bullets.length ? <ul>{result.bullets.map((item) => <li key={item}>{item}</li>)}</ul> : null}{result.warnings.map((warning) => <p key={warning}><strong>Warning:</strong> {warning}</p>)}</article> : null}</section>;
}
