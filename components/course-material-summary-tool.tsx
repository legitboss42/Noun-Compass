"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type CourseSummaryResult = {
  courseCode: string;
  courseTitle: string;
  generatedAt: string;
  summary: {
    title: string;
    examFocus: string;
    keyAreas: Array<{ heading: string; whyItMatters: string; points: string[] }>;
    definitions: string[];
    formulasOrProcesses: string[];
    likelyQuestionAngles: string[];
    revisionChecklist: string[];
    caution: string;
  };
};

type Props = {
  materialKey: string;
  premium: boolean;
  registered: boolean;
  signedIn: boolean;
};

export function CourseMaterialSummaryTool({ materialKey, premium, registered, signedIn }: Props) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CourseSummaryResult | null>(null);

  async function generateSummary() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/tools/material-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialKey }),
      });
      const payload = await response.json() as CourseSummaryResult & { message?: string };
      if (!response.ok) throw new Error(payload.message || "Summary could not be generated.");
      setResult(payload);
    } catch (summaryError) {
      setError(summaryError instanceof Error ? summaryError.message : "Summary could not be generated.");
    } finally {
      setBusy(false);
    }
  }

  if (!signedIn) {
    return <a href="/account/sign-in?next=/course-materials">Sign in for exam summary</a>;
  }

  if (!premium) {
    return <a href="/membership">Unlock exam summary</a>;
  }

  if (!registered) {
    return <a href="/dashboard/profile">Add course to dashboard first</a>;
  }

  return (
    <div className="material-summary-tool">
      <button type="button" onClick={generateSummary} disabled={busy}>
        {busy ? "Generating summary..." : "Generate exam summary"}
      </button>
      {busy ? <p role="status">Reading the course material and building your exam-focused summary.</p> : null}
      {error ? <p className="form-message form-message-error" role="alert">{error}</p> : null}
      {result ? (
        <section className="material-summary-result">
          <div className="material-summary-actions">
            <strong>{result.courseCode} summary ready</strong>
            <button type="button" onClick={() => window.print()}>Print / Save as PDF</button>
          </div>
          <article ref={reportRef} className="material-summary-document">
            <header>
              <Image src="/images/brand/nouncompass-logo.svg" alt="NOUN Compass" width={310} height={80} />
              <span>Premium exam summary</span>
            </header>
            <section className="material-summary-hero">
              <span>{result.courseCode}</span>
              <h2>{result.summary.title || result.courseTitle}</h2>
              <p>{result.summary.examFocus}</p>
            </section>
            <dl className="material-summary-meta">
              <div><dt>Course</dt><dd>{result.courseTitle}</dd></div>
              <div><dt>Source</dt><dd>Official NOUN eCourseware excerpt</dd></div>
              <div><dt>Generated</dt><dd>{new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" }).format(new Date(result.generatedAt))}</dd></div>
            </dl>
            <section>
              <h3>High-yield study areas</h3>
              <div className="material-summary-areas">
                {result.summary.keyAreas.map((area, index) => (
                  <article key={`${area.heading}-${index}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <h4>{area.heading}</h4>
                    <p>{area.whyItMatters}</p>
                    <ul>{area.points.map((point) => <li key={point}>{point}</li>)}</ul>
                  </article>
                ))}
              </div>
            </section>
            <section className="material-summary-grid">
              <div>
                <h3>Definitions to master</h3>
                <ul>{result.summary.definitions.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <div>
                <h3>Formulas or processes</h3>
                <ul>{result.summary.formulasOrProcesses.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <div>
                <h3>Likely question angles</h3>
                <ul>{result.summary.likelyQuestionAngles.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <div>
                <h3>Revision checklist</h3>
                <ul>{result.summary.revisionChecklist.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            </section>
            <footer>
              <strong>Use this responsibly</strong>
              <p>{result.summary.caution}</p>
              <p>NounCompass summary · Not an official NOUN exam forecast · Confirm with your course material.</p>
            </footer>
          </article>
        </section>
      ) : null}
    </div>
  );
}
