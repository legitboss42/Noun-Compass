"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type MaterialOption = {
  key: string;
  code: string;
  title: string;
  faculty?: string;
  level?: string;
  semester?: string;
};

type Mode = "quick-practice" | "revision-quiz" | "mock-style";

type Question = {
  id: string;
  topic: string;
  prompt: string;
  options: Array<{ label: "A" | "B" | "C" | "D"; text: string }>;
  explanation: string;
};

type StartPayload = {
  message?: string;
  session?: {
    id: string;
    courseCode: string;
    courseTitle: string;
    mode: Mode;
    questionCount: number;
    premium: boolean;
  };
  questions?: Question[];
};

type ReviewItem = {
  questionId: string;
  prompt: string;
  selectedAnswer: string;
  correctAnswer: string;
  correct: boolean;
  explanation: string;
};

type CompletePayload = {
  message?: string;
  score?: number;
  correct?: number;
  total?: number;
  review?: ReviewItem[];
};

export function AiPracticeRunner({
  materials,
}: {
  materials: MaterialOption[];
}) {
  const [query, setQuery] = useState("");
  const [materialKey, setMaterialKey] = useState(materials[0]?.key ?? "");
  const [mode, setMode] = useState<Mode>("quick-practice");
  const [difficulty, setDifficulty] = useState("1");
  const [questionCount, setQuestionCount] = useState("5");
  const [sessionId, setSessionId] = useState("");
  const [sessionLabel, setSessionLabel] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CompletePayload | null>(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return materials;
    return materials
      .filter((material) =>
        `${material.code} ${material.title} ${material.faculty ?? ""}`
          .toLowerCase()
          .includes(term),
      );
  }, [materials, query]);

  const current = questions[index];

  async function start() {
    setBusy(true);
    setStatus("Generating grounded questions from the selected official material...");
    setResult(null);
    setQuestions([]);
    setAnswers({});
    setIndex(0);
    try {
      const response = await fetch("/api/practice/ai-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialKey,
          mode,
          difficulty: Number(difficulty),
          questionCount: Number(questionCount),
        }),
      });
      const payload = await response.json() as StartPayload;
      if (!response.ok || !payload.session || !payload.questions?.length) {
        setStatus(payload.message || "AI practice could not start.");
        return;
      }
      setSessionId(payload.session.id);
      setSessionLabel(`${payload.session.courseCode} — ${payload.session.courseTitle}`);
      setQuestions(payload.questions);
      setStatus("");
      window.gtag?.("event", "ai_practice_started", {
        course_code: payload.session.courseCode,
        mode: payload.session.mode,
      });
    } catch {
      setStatus("AI practice could not start. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  function choose(label: string) {
    if (!current) return;
    setAnswers((existing) => ({ ...existing, [current.id]: label }));
  }

  async function finish() {
    if (!sessionId) return;
    setBusy(true);
    setStatus("Scoring your AI practice session...");
    try {
      const response = await fetch(`/api/practice/ai-sessions/${sessionId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const payload = await response.json() as CompletePayload;
      if (!response.ok) {
        setStatus(payload.message || "Could not score this session.");
        return;
      }
      setResult(payload);
      setQuestions([]);
      setStatus("");
      window.gtag?.("event", "ai_practice_completed", {
        score: payload.score,
        total: payload.total,
      });
    } catch {
      setStatus("Could not score this session. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function next() {
    if (!current) return;
    if (!answers[current.id]) {
      setStatus("Choose an answer before continuing.");
      return;
    }
    setStatus("");
    if (index >= questions.length - 1) {
      void finish();
      return;
    }
    setIndex((value) => value + 1);
  }

  if (questions.length && current) {
    return (
      <section className="practice-runner ai-practice-runner">
        <div className="practice-progress">
          <span>{sessionLabel}</span>
          <strong>{index + 1} / {questions.length}</strong>
        </div>
        <span className="eyebrow">{current.topic}</span>
        <h2>{current.prompt}</h2>
        <div className="practice-options">
          {current.options.map((option) => (
            <label key={option.label}>
              <input
                checked={answers[current.id] === option.label}
                name={`ai-answer-${current.id}`}
                onChange={() => choose(option.label)}
                type="radio"
              />
              <span>
                <strong>{option.label}</strong>
                {option.text}
              </span>
            </label>
          ))}
        </div>
        {status ? <p className="form-message form-message-error" role="status">{status}</p> : null}
        <button className="button" disabled={busy} onClick={next} type="button">
          {busy ? "Saving..." : index >= questions.length - 1 ? "Finish and score" : "Next question"}
        </button>
      </section>
    );
  }

  return (
    <section className="platform-panel ai-practice-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Personal AI practice</span>
          <h2>Generate questions from a NOUN course material</h2>
        </div>
      </div>
      <p>
        These questions are generated for your private practice from official course-material text.
        Only materials matching your registered dashboard courses are shown here.
        They are not reviewed NounCompass bank questions and they are not official NOUN exam questions.
      </p>

      {result ? (
        <div className="ai-practice-result">
          <p className="form-message form-message-success">
            Session complete: {result.score}% ({result.correct}/{result.total} correct).
          </p>
          {result.review?.length ? (
            <details open>
              <summary>Review answers and explanations</summary>
              <div className="platform-ticket-list">
                {result.review.map((item, reviewIndex) => (
                  <article key={item.questionId}>
                    <div>
                      <strong>{reviewIndex + 1}. {item.prompt}</strong>
                      <span>{item.correct ? "Correct" : "Needs review"}</span>
                    </div>
                    <p><strong>Your answer:</strong> {item.selectedAnswer}</p>
                    <p><strong>Correct answer:</strong> {item.correctAnswer}</p>
                    <p>{item.explanation}</p>
                  </article>
                ))}
              </div>
            </details>
          ) : null}
        </div>
      ) : null}

      <div className="platform-form-grid">
        <label>
          Find course material
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by course code, title, or faculty"
            value={query}
          />
        </label>
        <label>
          Selected material
          <select value={materialKey} onChange={(event) => setMaterialKey(event.target.value)}>
            {filtered.map((material) => (
              <option key={material.key} value={material.key}>
                {material.code} — {material.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Practice mode
          <select value={mode} onChange={(event) => setMode(event.target.value as Mode)}>
            <option value="quick-practice">Quick practice</option>
            <option value="revision-quiz">Revision quiz</option>
            <option value="mock-style">Mock-style practice</option>
          </select>
        </label>
        <label>
          Difficulty
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
            <option value="1">Foundational</option>
            <option value="2">Moderate</option>
            <option value="3">Challenging</option>
          </select>
        </label>
        <label>
          Questions
          <select value={questionCount} onChange={(event) => setQuestionCount(event.target.value)}>
            <option value="5">5 questions</option>
            <option value="10">10 questions</option>
            <option value="15">15 questions</option>
          </select>
        </label>
      </div>

      {busy ? (
        <p className="form-message form-message-success ai-loading" role="status">
          <span aria-hidden="true" />
          Generating questions from the selected material. This can take up to a minute.
        </p>
      ) : null}
      {status && !busy ? <p className="form-message form-message-error" role="status">{status}</p> : null}
      <div className="platform-form-actions">
        <button className="button" disabled={busy || !materialKey} onClick={start} type="button">
          {busy ? "Generating..." : "Generate AI practice"}
        </button>
        <Link href="/membership">Need higher limits? View Semester Pass</Link>
      </div>
    </section>
  );
}
