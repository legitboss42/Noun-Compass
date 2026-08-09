import "server-only";

import {
  QUESTION_DRAFT_CSV_HEADERS,
  aiQuestionDraftsConfigured,
  normalizeQuestionCount,
  validateAiQuestionDraftCsv,
} from "./ai-question-drafts-core";
import { getAiProviderConfig, reasoningControlFor } from "./ai-provider";

const MAX_EXCERPT_LENGTH = 24_000;

export { aiQuestionDraftsConfigured } from "./ai-question-drafts-core";

export type AiQuestionDraftInput = {
  courseCode: string;
  courseTitle?: string;
  sourceUnit: string;
  sourcePage?: string;
  materialExcerpt: string;
  questionCount?: number;
};

export type AiQuestionDraftResult = {
  csv: string;
  rowCount: number;
  model: string;
};

function assertDraftInput(input: AiQuestionDraftInput) {
  if (!/^[A-Z]{2,4}\d{3}$/i.test(input.courseCode.trim())) {
    throw new Error("Enter a valid NOUN course code before generating drafts.");
  }
  if (input.sourceUnit.trim().length < 2) {
    throw new Error("Enter the source unit, chapter, or section.");
  }
  if (input.materialExcerpt.trim().length < 600) {
    throw new Error("Paste at least 600 characters from the authorised course material.");
  }
}

function buildPrompt(input: AiQuestionDraftInput, count: number) {
  const excerpt = input.materialExcerpt.trim().slice(0, MAX_EXCERPT_LENGTH);
  return `Create ${count} original multiple-choice draft questions for NounCompass human review.

Strict rules:
- Use only the provided authorised course-material excerpt.
- Do not copy source sentences as full questions.
- Do not invent facts outside the excerpt.
- Return JSON only. No markdown, no commentary, no code fence.
- Return a JSON array. Each array item must use these keys:
  topic, learning_objective, difficulty, sample, prompt, option_a, option_b, option_c, option_d, correct_label, explanation
- difficulty must be the numeric value 1, 2, or 3.
- sample must be false unless the item is basic enough for a free diagnostic sample.
- correct_label must be A, B, C, or D.
- explanations must be concise and grounded in the excerpt.

Course code: ${input.courseCode.trim().toUpperCase()}
Course title: ${input.courseTitle?.trim() || "Not provided"}
Source unit: ${input.sourceUnit.trim()}
Source page: ${input.sourcePage?.trim() || ""}

Authorised excerpt:
${excerpt}`;
}

type AiDraftQuestionJson = {
  topic?: unknown;
  learning_objective?: unknown;
  difficulty?: unknown;
  sample?: unknown;
  prompt?: unknown;
  option_a?: unknown;
  option_b?: unknown;
  option_c?: unknown;
  option_d?: unknown;
  correct_label?: unknown;
  explanation?: unknown;
};

function csvEscape(value: unknown) {
  const text = String(value ?? "").replace(/\r?\n/g, " ").trim();
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function stripJsonFences(value: string) {
  return value
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function parseDraftJson(content: string) {
  const clean = stripJsonFences(content);
  const parsed = JSON.parse(clean) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("AI provider did not return a JSON array.");
  }
  return parsed as AiDraftQuestionJson[];
}

function draftJsonToCsv(input: AiQuestionDraftInput, items: AiDraftQuestionJson[]) {
  const courseCode = input.courseCode.trim().toUpperCase();
  const sourceUnit = input.sourceUnit.trim();
  const sourcePage = input.sourcePage?.trim() || "";
  const rows = items.map((item) => {
    const difficulty = Number(item.difficulty);
    const correctLabel = String(item.correct_label ?? "").trim().toUpperCase();
    return [
      courseCode,
      item.topic,
      item.learning_objective,
      [1, 2, 3].includes(difficulty) ? difficulty : "",
      item.sample === true ? "true" : "false",
      sourceUnit,
      sourcePage,
      item.prompt,
      item.option_a,
      item.option_b,
      item.option_c,
      item.option_d,
      ["A", "B", "C", "D"].includes(correctLabel) ? correctLabel : "",
      item.explanation,
    ].map(csvEscape).join(",");
  });
  return [QUESTION_DRAFT_CSV_HEADERS, ...rows].join("\n");
}

export async function generateQuestionDraftCsv(
  input: AiQuestionDraftInput,
): Promise<AiQuestionDraftResult> {
  if (!aiQuestionDraftsConfigured()) {
    throw new Error("AI question drafting is not configured.");
  }
  assertDraftInput(input);

  const count = normalizeQuestionCount(input.questionCount);
  const provider = getAiProviderConfig();
  if (!provider) throw new Error("AI question drafting is not configured.");
  const { model } = provider;
  const response = await fetch(provider.endpoint, {
    method: "POST",
    headers: provider.headers,
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You prepare original draft academic multiple-choice questions for human editors. You never publish, certify, or claim official status.",
        },
        { role: "user", content: buildPrompt(input, count) },
      ],
      ...reasoningControlFor(provider),
      temperature: 0.35,
      max_tokens: 3_000,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI provider request failed with status ${response.status}.`);
  }

  const payload = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI provider returned no draft content.");

  const csv = draftJsonToCsv(input, parseDraftJson(content));
  const validated = validateAiQuestionDraftCsv(csv);
  if (validated.errors.length) {
    throw new Error(`Generated CSV needs correction: ${validated.errors.slice(0, 3).join(" ")}`);
  }

  return {
    csv: validated.csv,
    rowCount: validated.rows.length,
    model,
  };
}
