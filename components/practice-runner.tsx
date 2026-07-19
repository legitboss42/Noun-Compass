"use client";

import { useState } from "react";

type Question = { id: string; prompt: string; topic: string; options: Array<{ id: string; label: string; text: string }> };

export function PracticeRunner({ banks, premium }: { banks: Array<{ course_code: string; course_title: string }>; premium: boolean }) {
  const [courseCode, setCourseCode] = useState(banks[0]?.course_code ?? "");
  const [mode, setMode] = useState<"diagnostic" | "practice" | "timed-mock">("diagnostic");
  const [sessionId, setSessionId] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<{ score: number; correct: number; answered: number } | null>(null);
  const [startedAt, setStartedAt] = useState(0);

  async function start() {
    setStatus("Starting session…"); setResult(null); setFeedback("");
    const response = await fetch("/api/practice/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseCode, mode }) });
    const payload = await response.json() as { message?: string; session?: { id: string }; questions?: Question[] };
    if (!response.ok || !payload.session || !payload.questions) return setStatus(payload.message || "Session could not start.");
    setSessionId(payload.session.id); setQuestions(payload.questions); setIndex(0); setSelected(""); setStatus(""); setStartedAt(Date.now());
    window.gtag?.("event", "practice_started", { course_code: courseCode, mode });
  }

  async function answer() {
    if (!selected) return setStatus("Choose an answer first.");
    const question = questions[index];
    const response = await fetch(`/api/practice/sessions/${sessionId}/answer`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionVersionId: question.id, selectedOptionId: selected, durationMs: Date.now() - startedAt }) });
    const payload = await response.json() as { message?: string; correct?: boolean | null; explanation?: string | null };
    if (!response.ok) return setStatus(payload.message || "Answer could not be saved.");
    setFeedback(payload.correct === null ? "Answer saved. Feedback appears when the timed mock ends." : `${payload.correct ? "Correct." : "Not quite."} ${payload.explanation ?? ""}`);
    if (index < questions.length - 1) { setIndex(index + 1); setSelected(""); setStartedAt(Date.now()); }
    else {
      const completed = await fetch(`/api/practice/sessions/${sessionId}/complete`, { method: "POST" });
      const summary = await completed.json() as { score: number; correct: number; answered: number };
      setResult(summary); setQuestions([]); window.gtag?.("event", "practice_completed", { course_code: courseCode, mode, score: summary.score });
    }
  }

  if (!banks.length) return <div className="empty-state"><h2>Question banks are in editorial review</h2><p>The practice runner is ready, but no bank is exposed until reviewed questions have been published.</p></div>;
  if (questions.length) { const question = questions[index]; return <section className="practice-runner"><div className="practice-progress"><span>{courseCode} · {mode}</span><strong>{index + 1} / {questions.length}</strong></div><span className="eyebrow">{question.topic}</span><h2>{question.prompt}</h2><div className="practice-options">{question.options.map((option) => <label key={option.id}><input type="radio" name="answer" checked={selected === option.id} onChange={() => setSelected(option.id)} /><span><strong>{option.label}</strong>{option.text}</span></label>)}</div>{feedback && <p className="form-message form-message-success" role="status">{feedback}</p>}{status && <p className="form-message form-message-error" role="status">{status}</p>}<button className="button" type="button" onClick={answer}>{index === questions.length - 1 ? "Finish session" : "Save and continue"}</button></section>; }
  return <section className="platform-panel"><h2>Start a practice session</h2>{result && <p className="form-message form-message-success">Session complete: {result.score}% ({result.correct}/{result.answered} correct).</p>}<div className="platform-form-grid"><label>Course<select value={courseCode} onChange={(event) => setCourseCode(event.target.value)}>{banks.map((bank) => <option key={bank.course_code} value={bank.course_code}>{bank.course_code} — {bank.course_title}</option>)}</select></label><label>Mode<select value={mode} onChange={(event) => setMode(event.target.value as typeof mode)}><option value="diagnostic">Free diagnostic</option><option value="practice" disabled={!premium}>Premium practice</option><option value="timed-mock" disabled={!premium}>Premium timed mock</option></select></label></div>{status && <p className="form-message form-message-error" role="status">{status}</p>}<button className="button" type="button" onClick={start}>Start session</button></section>;
}
