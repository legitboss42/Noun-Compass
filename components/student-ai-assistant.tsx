"use client";

import Link from "next/link";
import { useState } from "react";

type Feature = "performance-coach" | "course-qa" | "answer-explanation" | "admission-guidance" | "fee-explanation" | "academic-support" | "support-draft";
type Material = { key: string; code: string; title: string };
type Session = { id: string; courseCode: string; label: string; questions: Array<{ id: string; prompt: string }> };
type Answer = {
  title: string;
  answer: string;
  bullets: string[];
  citations: Array<{ heading: string; pageStart?: number; pageEnd?: number; quote: string }>;
  warnings: string[];
  actions: Array<{ label: string; href: string }>;
};

const features: Array<{ key: Feature; label: string; description: string }> = [
  { key: "performance-coach", label: "Performance coach", description: "Review real completed Practice Exam results." },
  { key: "course-qa", label: "Ask course material", description: "Get a page-cited answer from a registered course." },
  { key: "answer-explanation", label: "Explain an answer", description: "Simplify one completed Practice Exam answer." },
  { key: "fee-explanation", label: "Explain fee estimate", description: "Understand your last saved fee-checker result." },
  { key: "admission-guidance", label: "Admission guidance", description: "Get cautious planning guidance, not an admission decision." },
  { key: "academic-support", label: "Academic support", description: "Find the right NounCompass workflow or tool." },
  { key: "support-draft", label: "Draft support ticket", description: "Turn a problem description into a safer support request." },
];

export function StudentAiAssistant({ materials, sessions }: { materials: Material[]; sessions: Session[] }) {
  const [feature, setFeature] = useState<Feature>("performance-coach");
  const [question, setQuestion] = useState("");
  const [materialKey, setMaterialKey] = useState(materials[0]?.key ?? "");
  const [sessionId, setSessionId] = useState(sessions[0]?.id ?? "");
  const selectedSession = sessions.find((session) => session.id === sessionId) ?? sessions[0];
  const [questionId, setQuestionId] = useState(selectedSession?.questions[0]?.id ?? "");
  const [result, setResult] = useState<Answer | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const currentFeature = features.find((item) => item.key === feature)!;

  function chooseSession(value: string) {
    setSessionId(value);
    const next = sessions.find((session) => session.id === value);
    setQuestionId(next?.questions[0]?.id ?? "");
  }

  async function run() {
    setBusy(true);
    setStatus("");
    setResult(null);
    try {
      const response = await fetch("/api/ai/student-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature,
          question,
          draft: question,
          materialKey,
          sessionId,
          questionId,
        }),
      });
      const payload = await response.json() as { result?: Answer; message?: string; cached?: boolean; remaining?: number };
      if (!response.ok || !payload.result) {
        setStatus(payload.message || "The assistant could not complete this request.");
        return;
      }
      setResult(payload.result);
      setStatus(payload.cached ? "Loaded from the safe answer cache; no new AI request was used." : `Answer generated safely${typeof payload.remaining === "number" ? ` · ${payload.remaining} request(s) remaining for this feature today` : ""}.`);
    } catch {
      setStatus("The assistant request was interrupted. No automatic retry was made.");
    } finally {
      setBusy(false);
    }
  }

  const needsQuestion = ["course-qa", "admission-guidance", "academic-support", "support-draft"].includes(feature);
  const disabled = busy || (feature === "course-qa" && !materialKey) || (feature === "answer-explanation" && (!sessionId || !questionId)) || (needsQuestion && question.trim().length < 8);

  return (
    <section className="platform-panel student-ai-assistant">
      <div className="student-ai-feature-grid" aria-label="Assistant features">
        {features.map((item) => (
          <button
            aria-pressed={feature === item.key}
            data-active={feature === item.key ? "true" : undefined}
            key={item.key}
            onClick={() => { setFeature(item.key); setResult(null); setStatus(""); }}
            type="button"
          >
            <strong>{item.label}</strong><span>{item.description}</span>
          </button>
        ))}
      </div>
      <div className="student-ai-workspace">
        <div><span className="eyebrow">On-demand assistance</span><h2>{currentFeature.label}</h2><p>{currentFeature.description}</p></div>
        {feature === "course-qa" ? (
          <label>Registered course material<select value={materialKey} onChange={(event) => setMaterialKey(event.target.value)}>{materials.map((material) => <option key={material.key} value={material.key}>{material.code} — {material.title}</option>)}</select></label>
        ) : null}
        {feature === "answer-explanation" ? (
          <div className="platform-form-grid">
            <label>Completed exam<select value={sessionId} onChange={(event) => chooseSession(event.target.value)}>{sessions.map((session) => <option key={session.id} value={session.id}>{session.courseCode} — {session.label}</option>)}</select></label>
            <label>Question<select value={questionId} onChange={(event) => setQuestionId(event.target.value)}>{selectedSession?.questions.map((item, index) => <option key={item.id} value={item.id}>{index + 1}. {item.prompt.slice(0, 80)}</option>)}</select></label>
          </div>
        ) : null}
        {needsQuestion ? (
          <label>{feature === "support-draft" ? "Describe the problem without passwords or sensitive identifiers" : "Your question"}<textarea maxLength={feature === "support-draft" ? 1800 : 900} onChange={(event) => setQuestion(event.target.value)} rows={5} value={question} /></label>
        ) : null}
        {feature === "course-qa" && !materials.length ? <p className="form-message form-message-error">Add a registered course with an indexed official material first.</p> : null}
        {feature === "answer-explanation" && !sessions.length ? <p className="form-message form-message-error">Complete a Practice Exam before requesting an answer explanation.</p> : null}
        <button className="button" disabled={disabled} onClick={() => void run()} type="button">{busy ? "Checking and generating…" : "Run assistant"}</button>
        {status ? <p className={result ? "form-message form-message-success" : "form-message form-message-error"} role="status">{status}</p> : null}
        {result ? (
          <article className="student-ai-answer">
            <h3>{result.title}</h3><p>{result.answer}</p>
            {result.bullets.length ? <ul>{result.bullets.map((item) => <li key={item}>{item}</li>)}</ul> : null}
            {result.citations.length ? <details><summary>Verified source passages</summary>{result.citations.map((citation, index) => <blockquote key={`${citation.heading}-${index}`}><strong>{citation.heading}{citation.pageStart ? ` · pages ${citation.pageStart}-${citation.pageEnd}` : ""}</strong><p>“{citation.quote}”</p></blockquote>)}</details> : null}
            {result.warnings.map((warning) => <p className="platform-privacy-note" key={warning}>{warning}</p>)}
            {result.actions.length ? <div className="platform-form-actions">{result.actions.map((action) => <Link className="button button-secondary" href={action.href} key={`${action.href}-${action.label}`}>{action.label}</Link>)}</div> : null}
          </article>
        ) : null}
      </div>
      <p className="platform-privacy-note">AI is called only when you press Run assistant. Exact repeated requests use cached answers. Outputs are limited guidance and must not replace official NOUN records or decisions.</p>
    </section>
  );
}
