"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Mode = "diagnostic" | "practice" | "timed-mock" | "revision";
type Question = { id: string; questionId: string; prompt: string; topic: string; module: string | null; unit: string | null; options: Array<{ id: string; label: string; text: string }> };
type ReviewItem = { questionId: string; questionVersionId: string; prompt: string; explanation: string; correct: boolean; selectedAnswer: string; correctAnswer: string };
type Result = { score: number; correct: number; answered: number; total: number; review: ReviewItem[] };

export function PracticeRunner({ banks, premium, dueCount }: { banks: Array<{ course_code: string; course_title: string }>; premium: boolean; dueCount: number }) {
  const [courseCode, setCourseCode] = useState(banks[0]?.course_code ?? "");
  const [mode, setMode] = useState<Mode>("diagnostic");
  const [moduleFilter, setModuleFilter] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [reportType, setReportType] = useState("unclear_question");
  const [questionStartedAt, setQuestionStartedAt] = useState(0);
  const [expiresAt, setExpiresAt] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt || !questions.length) return;
    const update = () => setRemainingSeconds(Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt, questions.length]);

  async function start() {
    setStatus("Starting session…");
    setResult(null);
    setFeedback("");
    const response = await fetch("/api/practice/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseCode, mode, module: moduleFilter || undefined, unit: unitFilter || undefined, difficulty: difficulty ? Number(difficulty) : undefined }) });
    const payload = await response.json() as { message?: string; session?: { id: string; expiresAt?: string | null }; questions?: Question[] };
    if (!response.ok || !payload.session || !payload.questions) return setStatus(payload.message || "Session could not start.");
    setSessionId(payload.session.id);
    setQuestions(payload.questions);
    setIndex(0);
    setSelected("");
    setAnswered(false);
    setStatus("");
    setQuestionStartedAt(Date.now());
    setExpiresAt(payload.session.expiresAt ?? "");
    setRemainingSeconds(payload.session.expiresAt ? Math.max(0, Math.ceil((new Date(payload.session.expiresAt).getTime() - Date.now()) / 1000)) : null);
    window.gtag?.("event", "practice_started", { course_code: courseCode, mode });
  }

  async function finish() {
    if (!sessionId) return;
    setStatus("Finishing session…");
    const completed = await fetch(`/api/practice/sessions/${sessionId}/complete`, { method: "POST" });
    const summary = await completed.json() as Result & { message?: string };
    if (!completed.ok) return setStatus(summary.message || "Session could not be completed.");
    setResult(summary);
    setQuestions([]);
    setExpiresAt("");
    setRemainingSeconds(null);
    setStatus("");
    window.gtag?.("event", "practice_completed", { course_code: courseCode, mode, score: summary.score });
  }

  function moveNext() {
    if (index >= questions.length - 1) return void finish();
    setIndex((current) => current + 1);
    setSelected("");
    setAnswered(false);
    setFeedback("");
    setStatus("");
    setQuestionStartedAt(Date.now());
  }

  async function answer() {
    if (answered) return moveNext();
    if (remainingSeconds === 0) return void finish();
    if (!selected) return setStatus("Choose an answer first.");
    const question = questions[index];
    setStatus("Saving answer…");
    const response = await fetch(`/api/practice/sessions/${sessionId}/answer`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionVersionId: question.id, selectedOptionId: selected, durationMs: Date.now() - questionStartedAt }) });
    const payload = await response.json() as { message?: string; correct?: boolean | null; explanation?: string | null };
    if (!response.ok) {
      if (response.status === 408) return void finish();
      return setStatus(payload.message || "Answer could not be saved.");
    }
    setStatus("");
    if (mode === "timed-mock") return moveNext();
    setAnswered(true);
    setFeedback(`${payload.correct ? "Correct." : "Not quite."} ${payload.explanation ?? ""}`);
  }

  async function bookmark(questionId: string) {
    const response = await fetch(`/api/questions/${questionId}/bookmark`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookmarked: true }) });
    setStatus(response.ok ? "Question saved for revision." : "Bookmark could not be saved.");
  }

  async function report(item: ReviewItem) {
    const response = await fetch("/api/question-reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId: item.questionId, questionVersionId: item.questionVersionId, sessionId, reportType }) });
    setStatus(response.ok ? "Thanks. Your report has been saved for review." : "Question report could not be saved.");
  }

  if (!banks.length) return <div className="empty-state"><h2>Practice questions are not live yet</h2><p>We will open this area when a course has enough checked questions ready for students.</p></div>;

  if (questions.length) {
    const question = questions[index];
    const timedOut = remainingSeconds === 0;
    const timerLabel = remainingSeconds === null ? null : `${Math.floor(remainingSeconds / 60).toString().padStart(2, "0")}:${(remainingSeconds % 60).toString().padStart(2, "0")}`;
    return <section className="practice-runner"><div className="practice-progress"><span>{courseCode} · {mode}</span><strong>{index + 1} / {questions.length}</strong>{timerLabel && <strong aria-live="polite">{timerLabel}</strong>}</div>{timedOut && <p className="form-message form-message-error" role="status">Time has ended. Finish the mock to see your result and explanations.</p>}<span className="eyebrow">{question.module ? `${question.module} · ` : ""}{question.unit ? `${question.unit} · ` : ""}{question.topic}</span><h2>{question.prompt}</h2><div className="practice-options">{question.options.map((option) => <label key={option.id}><input type="radio" name="answer" checked={selected === option.id} disabled={answered || timedOut} onChange={() => setSelected(option.id)} /><span><strong>{option.label}</strong>{option.text}</span></label>)}</div>{feedback && <p className="form-message form-message-success" role="status">{feedback}</p>}{status && <p className="form-message form-message-error" role="status">{status}</p>}<button className="button" type="button" onClick={timedOut ? finish : answer}>{timedOut ? "Finish timed mock" : answered ? index === questions.length - 1 ? "Finish session" : "Next question" : index === questions.length - 1 ? "Save final answer" : "Check answer"}</button></section>;
  }

  return <section className="platform-panel"><h2>Start a practice session</h2>{result && <><p className="form-message form-message-success">Session complete: {result.score}% ({result.correct}/{result.total} correct; {result.answered} answered).</p><p><Link href={`/attempts/${sessionId}/results`}>View full results</Link></p>{result.review?.length ? <details><summary>Review answers and explanations</summary><div className="platform-ticket-list">{result.review.map((item, reviewIndex) => <article key={item.questionVersionId}><strong>{reviewIndex + 1}. {item.prompt}</strong><span>{item.correct ? "Correct" : "Check this one"}</span><p><strong>Your answer:</strong> {item.selectedAnswer}</p><p><strong>Correct answer:</strong> {item.correctAnswer}</p><p>{item.explanation}</p><div className="course-prep-actions"><button type="button" onClick={() => bookmark(item.questionId)}>Bookmark</button><label>Report issue<select value={reportType} onChange={(event) => setReportType(event.target.value)}><option value="wrong_answer">Wrong answer</option><option value="unclear_question">Unclear question</option><option value="duplicate_question">Duplicate question</option><option value="poor_explanation">Poor explanation</option><option value="incorrect_reference">Incorrect reference</option><option value="formatting_issue">Formatting issue</option></select></label><button type="button" onClick={() => report(item)}>Send report</button></div></article>)}</div></details> : null}</>}
    <div className="platform-form-grid"><label>Course<select value={courseCode} onChange={(event) => setCourseCode(event.target.value)}>{banks.map((bank) => <option key={bank.course_code} value={bank.course_code}>{bank.course_code} — {bank.course_title}</option>)}</select></label><label>Mode<select value={mode} onChange={(event) => setMode(event.target.value as Mode)}><option value="diagnostic">Free diagnostic</option><option value="practice" disabled={!premium}>Premium practice</option><option value="revision" disabled={!premium || dueCount === 0}>Due revision ({dueCount})</option><option value="timed-mock" disabled={!premium}>40-minute timed mock</option></select></label><label>Module (optional)<input value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value)} placeholder="Module 1" /></label><label>Unit (optional)<input value={unitFilter} onChange={(event) => setUnitFilter(event.target.value)} placeholder="Unit 1" /></label><label>Difficulty<select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option value="">All levels</option><option value="1">Easy</option><option value="2">Medium</option><option value="3">Hard</option></select></label></div>{status && <p className="form-message form-message-error" role="status">{status}</p>}<button className="button" type="button" onClick={start}>Start session</button></section>;
}
