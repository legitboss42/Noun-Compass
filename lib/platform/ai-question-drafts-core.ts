import { parseQuestionCsv } from "./question-import";

export const QUESTION_DRAFT_CSV_HEADERS = [
  "course_code",
  "topic",
  "learning_objective",
  "difficulty",
  "sample",
  "source_unit",
  "source_page",
  "prompt",
  "option_a",
  "option_b",
  "option_c",
  "option_d",
  "correct_label",
  "explanation",
].join(",");

const DEFAULT_QUESTION_COUNT = 10;
const MAX_QUESTION_COUNT = 25;

export function aiQuestionDraftsConfigured(env = process.env) {
  return (
    env.AI_QUESTION_DRAFTS_ENABLED === "true" &&
    env.AI_PROVIDER?.trim() === "openrouter" &&
    Boolean(env.OPENROUTER_API_KEY?.replace(/\s+/g, "")) &&
    Boolean(env.OPENROUTER_MODEL?.trim())
  );
}

export function normalizeQuestionCount(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_QUESTION_COUNT;
  return Math.min(MAX_QUESTION_COUNT, Math.max(1, Math.floor(parsed)));
}

export function stripAiCsvFences(value: string) {
  return value
    .replace(/^```(?:csv)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export function validateAiQuestionDraftCsv(csv: string) {
  const cleanCsv = stripAiCsvFences(csv);
  const parsed = parseQuestionCsv(cleanCsv);
  return {
    csv: cleanCsv,
    rows: parsed.rows,
    errors: parsed.errors,
  };
}
