"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { maxAiPracticeQuestionsForMaterial } from "@/lib/platform/ai-practice-materials";
import { trackRevenueEvent } from "@/lib/platform/revenue-analytics";

type MaterialOption = {
  key: string;
  code: string;
  title: string;
  creditUnits?: string;
  faculty?: string;
  level?: string;
  semester?: string;
};

type Mode = "quick-practice" | "revision-quiz" | "mock-style";
type Focus = "balanced" | "weak-topics" | "exam-simulation";

type Question = {
  id: string;
  topic: string;
  prompt: string;
  options: Array<{ label: "A" | "B" | "C" | "D"; text: string }>;
  sourceHeading?: string;
  sourcePageStart?: number;
  sourcePageEnd?: number;
};

type GenerationProgress = {
  status: "generating" | "active" | "completed" | "failed";
  completedBatches: number;
  totalBatches: number;
  generatedQuestions: number;
  targetQuestions: number;
  message: string;
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
  responses?: Record<string, string>;
  status?: string;
  generation?: GenerationProgress;
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
  premium,
  resumeSessionId,
}: {
  materials: MaterialOption[];
  premium: boolean;
  resumeSessionId?: string;
}) {
  const [query, setQuery] = useState("");
  const [materialKey, setMaterialKey] = useState(materials[0]?.key ?? "");
  const [mode, setMode] = useState<Mode>("quick-practice");
  const [difficulty, setDifficulty] = useState("1");
  const [focus, setFocus] = useState<Focus>("balanced");
  const [questionCount, setQuestionCount] = useState("5");
  const [sessionId, setSessionId] = useState("");
  const [sessionLabel, setSessionLabel] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CompletePayload | null>(null);
  const [generation, setGeneration] = useState<GenerationProgress | null>(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return materials;
    return materials.filter((material) =>
      `${material.code} ${material.title} ${material.faculty ?? ""}`.toLowerCase().includes(term),
    );
  }, [materials, query]);

  const current = questions[index];
  const selectedMaterial = materials.find((material) => material.key === materialKey) ?? materials[0];
  const questionLimit = selectedMaterial ? maxAiPracticeQuestionsForMaterial(selectedMaterial, premium) : 15;
  const questionOptions = useMemo(
    () => [5, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100].filter((value) => value <= questionLimit),
    [questionLimit],
  );
  const selectedQuestionCount = questionOptions.includes(Number(questionCount))
    ? questionCount
    : String(questionOptions[questionOptions.length - 1] ?? 5);

  const runGeneration = useCallback(async (id: string, cancelled: () => boolean = () => false) => {
    setBusy(true);
    setStatus("");
    for (let attempt = 0; attempt < 100; attempt += 1) {
      if (cancelled()) return;
      try {
        const response = await fetch(`/api/practice/ai-sessions/${id}/generate`, { method: "POST" });
        const payload = await response.json() as StartPayload;
        if (cancelled()) return;
        if (!response.ok || !payload.session || !payload.generation) {
          setStatus(payload.message || "Generation paused. Use Resume generation to continue from the saved batch.");
          setBusy(false);
          return;
        }
        setGeneration(payload.generation);
        setSessionId(payload.session.id);
        setSessionLabel(`${payload.session.courseCode} — ${payload.session.courseTitle}`);
        if (payload.generation.status === "active" && payload.questions?.length) {
          setQuestions(payload.questions);
          setAnswers(payload.responses ?? {});
          setIndex(0);
          setStatus("");
          setBusy(false);
          trackRevenueEvent("ai_practice_started", { authState: "signed-in", plan: premium ? "semester-pass" : undefined });
          return;
        }
      } catch {
        if (!cancelled()) {
          setStatus("Generation was interrupted. Your completed batches are saved; resume when ready.");
          setBusy(false);
        }
        return;
      }
    }
    if (!cancelled()) {
      setStatus("Generation paused after the safe batch limit. Resume to continue.");
      setBusy(false);
    }
  }, [premium]);

  useEffect(() => {
    if (!resumeSessionId) return;
    let cancelled = false;
    async function loadSession() {
      setBusy(true);
      setStatus("Loading your saved Practice Exam...");
      try {
        const response = await fetch(`/api/practice/ai-sessions/${resumeSessionId}`);
        const payload = await response.json() as StartPayload;
        if (cancelled) return;
        if (!response.ok || !payload.session || !payload.generation) {
          setStatus(payload.message || "This Practice Exam could not be loaded.");
          setBusy(false);
          return;
        }
        setSessionId(payload.session.id);
        setSessionLabel(`${payload.session.courseCode} — ${payload.session.courseTitle}`);
        setQuestionCount(String(payload.session.questionCount));
        setGeneration(payload.generation);
        setResult(null);
        if (payload.generation.status === "generating" || payload.generation.status === "failed") {
          await runGeneration(payload.session.id, () => cancelled);
          return;
        }
        if (!payload.questions?.length) {
          setStatus("This Practice Exam does not contain ready questions yet.");
          setBusy(false);
          return;
        }
        const savedAnswers = payload.responses ?? {};
        const firstUnanswered = payload.questions.findIndex((question) => !savedAnswers[question.id]);
        setQuestions(payload.questions);
        setAnswers(savedAnswers);
        setIndex(firstUnanswered >= 0 ? firstUnanswered : 0);
        setStatus(payload.status === "completed" ? "This session was already completed." : "");
        setBusy(false);
      } catch {
        if (!cancelled) {
          setStatus("This Practice Exam could not be loaded.");
          setBusy(false);
        }
      }
    }
    void loadSession();
    return () => {
      cancelled = true;
    };
  }, [resumeSessionId, runGeneration]);

  async function start() {
    setBusy(true);
    setStatus("");
    setResult(null);
    setQuestions([]);
    setAnswers({});
    setIndex(0);
    setGeneration(null);
    try {
      const response = await fetch("/api/practice/ai-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialKey,
          mode,
          difficulty: Number(difficulty),
          questionCount: Number(selectedQuestionCount),
          focus,
        }),
      });
      const payload = await response.json() as StartPayload;
      if (!response.ok || !payload.session || !payload.generation) {
        setStatus(payload.message || "Practice Exam could not start.");
        setBusy(false);
        return;
      }
      setSessionId(payload.session.id);
      setSessionLabel(`${payload.session.courseCode} — ${payload.session.courseTitle}`);
      setQuestionCount(String(payload.session.questionCount));
      setGeneration(payload.generation);
      trackRevenueEvent("ai_practice_started", { authState: "signed-in", plan: payload.session.premium ? "semester-pass" : undefined });
      await runGeneration(payload.session.id);
    } catch {
      setStatus("Practice Exam could not start. Try again in a moment.");
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
    setStatus("Scoring your Practice Exam...");
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
      trackRevenueEvent("ai_practice_completed", { score: payload.score, total: payload.total, correct: payload.correct });
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
        {current.sourcePageStart ? (
          <p className="platform-privacy-note">
            Grounded in {current.sourceHeading || "the selected material"}, pages {current.sourcePageStart}-{current.sourcePageEnd}.
          </p>
        ) : null}
        <div className="practice-options">
          {current.options.map((option) => (
            <label key={option.label}>
              <input
                checked={answers[current.id] === option.label}
                name={`ai-answer-${current.id}`}
                onChange={() => choose(option.label)}
                type="radio"
              />
              <span><strong>{option.label}</strong>{option.text}</span>
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

  const canResume = Boolean(sessionId && generation && generation.status !== "active" && generation.status !== "completed");
  return (
    <section className="platform-panel ai-practice-panel">
      <div className="section-heading">
        <div><span className="eyebrow">Practice Exam</span><h2>Generate questions across a complete NOUN course material</h2></div>
      </div>
      <p>
        NounCompass maps the material by unit and page range, generates grounded batches, rejects unsupported or duplicated questions,
        and saves each completed batch so interrupted generation can resume.
      </p>

      {result ? (
        <div className="ai-practice-result">
          <p className="form-message form-message-success">Session complete: {result.score}% ({result.correct}/{result.total} correct).</p>
          {result.review?.length ? (
            <details open>
              <summary>Review answers and explanations</summary>
              <div className="platform-ticket-list">
                {result.review.map((item, reviewIndex) => (
                  <article key={item.questionId}>
                    <div><strong>{reviewIndex + 1}. {item.prompt}</strong><span>{item.correct ? "Correct" : "Needs review"}</span></div>
                    <p><strong>Your answer:</strong> {item.selectedAnswer}</p>
                    <p><strong>Correct answer:</strong> {item.correctAnswer}</p>
                    <p>{item.explanation}</p>
                  </article>
                ))}
              </div>
            </details>
          ) : null}
          <div className="platform-form-actions">
            <Link className="button button-secondary" href="/dashboard/ai-assistant">Open performance coach or ask for a simpler explanation</Link>
            <Link href="/dashboard/practice">View practice history</Link>
          </div>
        </div>
      ) : null}

      {generation && generation.status !== "active" && generation.status !== "completed" ? (
        <div className="ai-generation-progress" role="status" aria-live="polite">
          <div><strong>{generation.message}</strong><span>{generation.generatedQuestions} of {generation.targetQuestions} validated questions</span></div>
          <progress max={Math.max(1, generation.totalBatches)} value={generation.completedBatches}>
            {generation.completedBatches} of {generation.totalBatches}
          </progress>
        </div>
      ) : null}

      <div className="platform-form-grid">
        <label>Find course material<input onChange={(event) => setQuery(event.target.value)} placeholder="Search by course code, title, or faculty" value={query} /></label>
        <label>
          Selected material
          <select value={materialKey} onChange={(event) => setMaterialKey(event.target.value)}>
            {filtered.map((material) => <option key={material.key} value={material.key}>{material.code} — {material.title}</option>)}
          </select>
        </label>
        <label>
          Practice mode
          <select value={mode} onChange={(event) => setMode(event.target.value as Mode)}>
            <option value="quick-practice">Quick practice</option><option value="revision-quiz">Revision quiz</option><option value="mock-style">Mock-style practice</option>
          </select>
        </label>
        <label>
          Adaptive focus
          <select value={focus} onChange={(event) => setFocus(event.target.value as Focus)}>
            <option value="balanced">Balanced revision</option>
            <option value="weak-topics">Weak topics from my history</option>
            <option value="exam-simulation">Exam simulation mix</option>
          </select>
        </label>
        <label>
          Difficulty
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
            <option value="1">Foundational</option><option value="2">Moderate</option><option value="3">Challenging</option>
          </select>
        </label>
        <label>
          Questions
          <select value={selectedQuestionCount} onChange={(event) => setQuestionCount(event.target.value)}>
            {questionOptions.map((value) => <option key={value} value={value}>{value} questions</option>)}
          </select>
        </label>
      </div>
      <p className="platform-privacy-note">
        {premium
          ? `Semester Pass active. This selected material allows up to ${questionLimit} generated questions.`
          : "Free trial: one Practice Exam generation per day, up to 15 questions."}
      </p>
      {busy ? (
        <p className="form-message form-message-success ai-loading" role="status">
          <span aria-hidden="true" />
          {generation?.totalBatches
            ? `Generating batch ${Math.min(generation.completedBatches + 1, generation.totalBatches)} of ${generation.totalBatches}. Completed batches are saved automatically.`
            : "Extracting pages and preparing full-material coverage. The first generation can take a moment."}
        </p>
      ) : null}
      {status && !busy ? <p className="form-message form-message-error" role="status">{status}</p> : null}
      <div className="platform-form-actions">
        <button
          className="button"
          disabled={busy || !materialKey}
          onClick={canResume ? () => void runGeneration(sessionId) : start}
          type="button"
        >
          {busy
            ? generation?.totalBatches
              ? `Generating ${generation.completedBatches}/${generation.totalBatches}`
              : "Preparing material..."
            : canResume
              ? "Resume generation"
              : "Generate Practice Exam"}
        </button>
        {premium ? <span>Generated exams and results are saved to Practice history.</span> : <Link href="/membership">Need higher limits? View Semester Pass</Link>}
      </div>
    </section>
  );
}
