"use client";

import { useState } from "react";

type AiQuestionDraftToolProps = {
  configured: boolean;
};

export function AiQuestionDraftTool({ configured }: AiQuestionDraftToolProps) {
  const [csv, setCsv] = useState("");
  const [message, setMessage] = useState(
    configured
      ? "Paste authorised course-material text to generate a draft CSV for review."
      : "AI drafting is disabled until the server environment variables are configured.",
  );
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setMessage("Generating draft CSV...");
    setCsv("");

    const response = await fetch("/api/admin/questions/ai-drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseCode: data.get("courseCode"),
        courseTitle: data.get("courseTitle"),
        sourceUnit: data.get("sourceUnit"),
        sourcePage: data.get("sourcePage"),
        materialExcerpt: data.get("materialExcerpt"),
        questionCount: data.get("questionCount"),
      }),
    });

    const result = await response.json() as {
      csv?: string;
      rowCount?: number;
      error?: string;
    };
    setPending(false);
    if (!response.ok || !result.csv) {
      setMessage(result.error ?? "Could not generate draft CSV.");
      return;
    }
    setCsv(result.csv);
    setMessage(`${result.rowCount ?? 0} draft rows generated. Review before importing.`);
  }

  async function copyCsv() {
    if (!csv) return;
    await navigator.clipboard.writeText(csv);
    setMessage("Draft CSV copied. Paste it into the CSV importer after editorial review.");
  }

  return (
    <div className="admin-form">
      <p>
        This helper creates draft CSV only. It does not import, approve, or publish
        questions, and it must only use authorised course material.
      </p>
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form-row">
          <label>
            Course code
            <input name="courseCode" required placeholder="GST101" disabled={!configured || pending} />
          </label>
          <label>
            Course title
            <input name="courseTitle" placeholder="Optional" disabled={!configured || pending} />
          </label>
          <label>
            Number of questions
            <input
              name="questionCount"
              type="number"
              min="1"
              max="25"
              defaultValue="10"
              disabled={!configured || pending}
            />
          </label>
        </div>
        <div className="admin-form-row">
          <label>
            Source unit
            <input name="sourceUnit" required placeholder="Unit 1" disabled={!configured || pending} />
          </label>
          <label>
            Source page
            <input name="sourcePage" placeholder="Optional" disabled={!configured || pending} />
          </label>
        </div>
        <label>
          Authorised course-material excerpt
          <textarea
            name="materialExcerpt"
            rows={10}
            minLength={600}
            required
            placeholder="Paste official, owned, licensed, or otherwise authorised course-material text here."
            disabled={!configured || pending}
          />
        </label>
        <button className="admin-button" type="submit" disabled={!configured || pending}>
          {pending ? "Generating..." : "Generate draft CSV"}
        </button>
      </form>
      <p aria-live="polite">{message}</p>
      {csv ? (
        <div className="admin-form">
          <label>
            Generated draft CSV
            <textarea value={csv} readOnly rows={12} />
          </label>
          <button className="admin-button admin-button-secondary" type="button" onClick={copyCsv}>
            Copy CSV
          </button>
        </div>
      ) : null}
    </div>
  );
}
