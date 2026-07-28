import "server-only";

import { randomUUID } from "crypto";
import type { CourseMaterial } from "@/lib/course-materials";
import { createAdminClient } from "@/lib/supabase/admin";
import { membershipIsActive } from "./membership";
import { aiQuestionDraftsConfigured } from "./ai-question-drafts-core";
import { maxAiPracticeQuestionsForMaterial, resolveAiPracticeMaterial } from "./ai-practice-materials";

const MAX_FREE_DAILY_SESSIONS = 1;
const MAX_PREMIUM_DAILY_SESSIONS = 10;
const MAX_PDF_BYTES = 14 * 1024 * 1024;
const MAX_EXCERPT_LENGTH = 22_000;
const MIN_EXTRACTED_CHARS = 900;

export type AiPracticeMode = "quick-practice" | "revision-quiz" | "mock-style";

export type AiPracticeQuestion = {
  id: string;
  topic: string;
  prompt: string;
  options: Array<{ label: "A" | "B" | "C" | "D"; text: string }>;
  correctLabel: "A" | "B" | "C" | "D";
  explanation: string;
};

export type PublicAiPracticeQuestion = Omit<AiPracticeQuestion, "correctLabel">;

export type AiPracticeStartInput = {
  materialKey: string;
  mode?: AiPracticeMode;
  difficulty?: number;
  questionCount?: number;
};

export type AiPracticeStartResult = {
  session: {
    id: string;
    courseCode: string;
    courseTitle: string;
    mode: AiPracticeMode;
    questionCount: number;
    premium: boolean;
  };
  questions: PublicAiPracticeQuestion[];
};

export type AiPracticeResumeResult = AiPracticeStartResult & {
  responses: Record<string, string>;
  status: string;
};

export type AiPracticeCompleteResult = {
  score: number;
  correct: number;
  total: number;
  review: Array<{
    questionId: string;
    prompt: string;
    selectedAnswer: string;
    correctAnswer: string;
    correct: boolean;
    explanation: string;
  }>;
};

export class AiPracticeError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

function normalizeMode(value: unknown): AiPracticeMode {
  return value === "revision-quiz" || value === "mock-style" ? value : "quick-practice";
}

function normalizeDifficulty(value: unknown) {
  const parsed = Number(value);
  return [1, 2, 3].includes(parsed) ? parsed : 1;
}

function normalizeQuestionCount(value: unknown, premium: boolean, material: CourseMaterial) {
  const max = maxAiPracticeQuestionsForMaterial(material, premium);
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return Math.min(max, premium ? max : 5);
  return Math.max(1, Math.min(max, Math.floor(parsed)));
}

function publicQuestions(questions: AiPracticeQuestion[]): PublicAiPracticeQuestion[] {
  return questions.map((question) => ({
    id: question.id,
    topic: question.topic,
    prompt: question.prompt,
    options: question.options,
    explanation: question.explanation,
  }));
}

async function getPremiumState(userId: string) {
  const admin = createAdminClient();
  if (!admin) throw new AiPracticeError("Practice database is not configured.", 503);
  const { data } = await admin
    .from("memberships")
    .select("status,ends_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .gt("ends_at", new Date().toISOString())
    .order("ends_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return membershipIsActive(data?.status, data?.ends_at);
}

async function assertQuota(userId: string, premium: boolean) {
  const admin = createAdminClient();
  if (!admin) throw new AiPracticeError("Practice database is not configured.", 503);
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  const { count, error } = await admin
    .from("ai_practice_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since.toISOString());
  if (error) throw new AiPracticeError("Could not check your AI practice quota.", 500);
  const limit = premium ? MAX_PREMIUM_DAILY_SESSIONS : MAX_FREE_DAILY_SESSIONS;
  if ((count ?? 0) >= limit) {
    throw new AiPracticeError(
      premium
        ? "You have reached today’s AI practice limit. Try again tomorrow."
        : "Free AI practice is limited to one generation per day. Upgrade to the Semester Pass for more.",
      403,
    );
  }
}

async function extractPdfText(material: CourseMaterial) {
  const response = await fetch(material.url, {
    headers: { "User-Agent": "NounCompass/1.0 student AI practice text extraction" },
  });
  if (!response.ok) {
    throw new AiPracticeError("The selected official material could not be downloaded.", 502);
  }
  const length = Number(response.headers.get("content-length") ?? 0);
  if (length > MAX_PDF_BYTES) {
    throw new AiPracticeError("This material is too large for instant AI practice. Choose a smaller course material for now.", 413);
  }
  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_PDF_BYTES) {
    throw new AiPracticeError("This material is too large for instant AI practice. Choose a smaller course material for now.", 413);
  }
  const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse");
  const parsed = await pdfParse(Buffer.from(arrayBuffer));
  const text = parsed.text.replace(/\s+/g, " ").trim();
  if (text.length < MIN_EXTRACTED_CHARS) {
    throw new AiPracticeError("Could not extract enough readable text from this PDF to generate grounded questions.", 422);
  }
  return text.slice(0, MAX_EXCERPT_LENGTH);
}

function buildPrompt(input: {
  material: CourseMaterial;
  excerpt: string;
  questionCount: number;
  difficulty: number;
  mode: AiPracticeMode;
}) {
  const difficultyLabel = input.difficulty === 3 ? "challenging" : input.difficulty === 2 ? "moderate" : "foundational";
  const modeLabel =
    input.mode === "mock-style"
      ? "exam-style practice"
      : input.mode === "revision-quiz"
        ? "revision quiz"
        : "quick practice";
  return `Create ${input.questionCount} original multiple-choice questions for a student's personal ${modeLabel}.

Strict rules:
- Use only the official course-material excerpt provided.
- Do not copy whole source sentences as questions.
- Do not invent facts outside the excerpt.
- Return JSON only. No markdown, comments, or code fences.
- Return a JSON array. Each item must use keys: topic, prompt, option_a, option_b, option_c, option_d, correct_label, explanation.
- correct_label must be A, B, C, or D.
- Questions should be ${difficultyLabel} level.
- Explanations must be concise and grounded in the excerpt.
- Do not claim the questions are official NOUN exam questions.

Course code: ${input.material.code}
Course title: ${input.material.title}
Source: Official NOUN eCourseware

Course-material excerpt:
${input.excerpt}`;
}

function stripJsonFences(value: string) {
  return value.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

function asText(value: unknown, fallback = "") {
  return String(value ?? fallback).replace(/\s+/g, " ").trim();
}

function parseAiQuestions(content: string): AiPracticeQuestion[] {
  const parsed = JSON.parse(stripJsonFences(content)) as unknown;
  if (!Array.isArray(parsed)) throw new Error("AI provider did not return a JSON array.");
  return parsed.map((item, index) => {
    const record = item as Record<string, unknown>;
    const correctLabel = asText(record.correct_label).toUpperCase();
    if (!["A", "B", "C", "D"].includes(correctLabel)) {
      throw new Error("AI provider returned an invalid answer key.");
    }
    const question: AiPracticeQuestion = {
      id: `q${index + 1}-${randomUUID().slice(0, 8)}`,
      topic: asText(record.topic, "Course material"),
      prompt: asText(record.prompt),
      options: [
        { label: "A", text: asText(record.option_a) },
        { label: "B", text: asText(record.option_b) },
        { label: "C", text: asText(record.option_c) },
        { label: "D", text: asText(record.option_d) },
      ],
      correctLabel: correctLabel as "A" | "B" | "C" | "D",
      explanation: asText(record.explanation),
    };
    if (
      question.prompt.length < 12 ||
      question.explanation.length < 12 ||
      question.options.some((option) => option.text.length < 1)
    ) {
      throw new Error("AI provider returned incomplete questions.");
    }
    return question;
  });
}

async function generateQuestions(input: {
  material: CourseMaterial;
  excerpt: string;
  questionCount: number;
  difficulty: number;
  mode: AiPracticeMode;
}) {
  if (!aiQuestionDraftsConfigured()) {
    throw new AiPracticeError("AI practice is not configured yet.", 503);
  }
  const model = process.env.OPENROUTER_MODEL!.trim();
  const apiKey = process.env.OPENROUTER_API_KEY!.replace(/\s+/g, "");
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://nouncompass.me",
      "X-OpenRouter-Title": process.env.OPENROUTER_APP_TITLE?.trim() || "NounCompass",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You create original student practice questions from authorised course-material excerpts. You do not claim official exam status.",
        },
        { role: "user", content: buildPrompt(input) },
      ],
      temperature: 0.35,
    }),
  });
  if (!response.ok) throw new AiPracticeError(`AI provider request failed with status ${response.status}.`, 502);
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new AiPracticeError("AI provider returned no practice questions.", 502);
  return { questions: parseAiQuestions(content), model };
}

export async function startAiPracticeSession(
  userId: string,
  input: AiPracticeStartInput,
): Promise<AiPracticeStartResult> {
  const material = resolveAiPracticeMaterial(input.materialKey);
  if (!material) throw new AiPracticeError("Choose a valid official course material.", 400);
  const premium = await getPremiumState(userId);
  await assertQuota(userId, premium);

  const mode = normalizeMode(input.mode);
  const difficulty = normalizeDifficulty(input.difficulty);
  const questionCount = normalizeQuestionCount(input.questionCount, premium, material);
  const excerpt = await extractPdfText(material);
  const { questions, model } = await generateQuestions({
    material,
    excerpt,
    questionCount,
    difficulty,
    mode,
  });

  const admin = createAdminClient();
  if (!admin) throw new AiPracticeError("Practice database is not configured.", 503);
  const { data: session, error } = await admin
    .from("ai_practice_sessions")
    .insert({
      user_id: userId,
      material_key: input.materialKey,
      course_code: material.code,
      course_title: material.title,
      material_url: material.url,
      mode,
      difficulty,
      question_count: questions.length,
      generated_questions: questions,
      model,
    })
    .select("id")
    .single();
  if (error || !session) throw new AiPracticeError("Could not save the generated practice session.", 500);

  return {
    session: {
      id: session.id,
      courseCode: material.code,
      courseTitle: material.title,
      mode,
      questionCount: questions.length,
      premium,
    },
    questions: publicQuestions(questions),
  };
}

export async function completeAiPracticeSession(
  userId: string,
  sessionId: string,
  answers: Record<string, string>,
): Promise<AiPracticeCompleteResult> {
  const admin = createAdminClient();
  if (!admin) throw new AiPracticeError("Practice database is not configured.", 503);
  const { data: session } = await admin
    .from("ai_practice_sessions")
    .select("id,user_id,question_count,generated_questions,status")
    .eq("id", sessionId)
    .maybeSingle();
  if (!session || session.user_id !== userId) throw new AiPracticeError("AI practice session not found.", 404);

  const questions = session.generated_questions as AiPracticeQuestion[];
  const review = questions.map((question) => {
    const selectedLabel = asText(answers[question.id]).toUpperCase();
    const selected = question.options.find((option) => option.label === selectedLabel);
    const expected = question.options.find((option) => option.label === question.correctLabel);
    const correct = selectedLabel === question.correctLabel;
    return {
      questionId: question.id,
      prompt: question.prompt,
      selectedAnswer: selected ? `${selected.label}. ${selected.text}` : "Not answered",
      correctAnswer: expected ? `${expected.label}. ${expected.text}` : question.correctLabel,
      correct,
      explanation: question.explanation,
    };
  });
  const correct = review.filter((item) => item.correct).length;
  const total = questions.length || session.question_count || 0;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;

  if (session.status !== "completed") {
    await admin
      .from("ai_practice_sessions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        score,
        responses: answers,
      })
      .eq("id", sessionId);
  }

  return { score, correct, total, review };
}

export async function getAiPracticeSession(
  userId: string,
  sessionId: string,
): Promise<AiPracticeResumeResult> {
  const admin = createAdminClient();
  if (!admin) throw new AiPracticeError("Practice database is not configured.", 503);
  const { data: session } = await admin
    .from("ai_practice_sessions")
    .select("id,user_id,course_code,course_title,mode,question_count,generated_questions,responses,status")
    .eq("id", sessionId)
    .maybeSingle();
  if (!session || session.user_id !== userId) throw new AiPracticeError("AI practice session not found.", 404);
  const questions = session.generated_questions as AiPracticeQuestion[];
  return {
    session: {
      id: session.id,
      courseCode: session.course_code,
      courseTitle: session.course_title,
      mode: session.mode as AiPracticeMode,
      questionCount: session.question_count,
      premium: await getPremiumState(userId),
    },
    questions: publicQuestions(questions),
    responses: (session.responses ?? {}) as Record<string, string>,
    status: String(session.status ?? "active"),
  };
}
