import { createHash } from "crypto";

export type AssistantCitation = {
  heading: string;
  pageStart?: number;
  pageEnd?: number;
  quote: string;
};

export type AssistantAnswer = {
  title: string;
  answer: string;
  bullets: string[];
  citations: AssistantCitation[];
  warnings: string[];
  actions: Array<{ label: string; href: string }>;
};

export function normalizeAssistantQuestion(value: unknown, maxLength = 1200) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function redactSensitiveText(value: string) {
  return value
    .replace(/[A-Z]{2,5}\d{7,12}/gi, "[student identifier removed]")
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[email removed]")
    .replace(/(?:\+?234|0)[789]\d{9}/g, "[phone removed]")
    .replace(/\b\d{12,19}\b/g, "[long number removed]");
}

export function assistantCacheKey(parts: Array<string | number | null | undefined>) {
  return createHash("sha256")
    .update(parts.map((part) => String(part ?? "").trim().toLowerCase()).join("\u001f"))
    .digest("hex");
}

function tokens(value: string) {
  return [...new Set(value.toLowerCase().match(/[a-z0-9]{3,}/g) ?? [])]
    .filter((token) => !["about", "after", "before", "could", "from", "have", "should", "their", "there", "these", "this", "what", "when", "where", "which", "with", "would"].includes(token));
}

export function rankGroundingChunks<T extends { heading: string; text: string }>(
  query: string,
  chunks: T[],
  maximum = 4,
) {
  const terms = tokens(query);
  return chunks
    .map((chunk, index) => {
      const heading = chunk.heading.toLowerCase();
      const text = chunk.text.toLowerCase();
      const score = terms.reduce((total, term) => {
        const headingHits = heading.includes(term) ? 5 : 0;
        const textHits = Math.min(6, text.split(term).length - 1);
        return total + headingHits + textHits;
      }, 0);
      return { chunk, score, index };
    })
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, Math.max(1, maximum))
    .map((item) => item.chunk);
}

function extractJson(content: string) {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = (fenced ?? content).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("The AI response did not contain a JSON object.");
  return JSON.parse(candidate.slice(start, end + 1)) as Record<string, unknown>;
}

const allowedActionHrefs = new Set([
  "/dashboard",
  "/dashboard/ai-assistant",
  "/dashboard/ai-practice",
  "/dashboard/practice",
  "/dashboard/profile",
  "/dashboard/support",
  "/tools/study-planner",
  "/fees",
  "/admission",
  "/course-materials",
  "/membership",
]);

export function parseAssistantAnswer(
  content: string,
  sources: Array<{ heading: string; pageStart?: number; pageEnd?: number; text: string }> = [],
): AssistantAnswer {
  const payload = extractJson(content);
  const citations = Array.isArray(payload.citations) ? payload.citations : [];
  const parsedCitations = citations.slice(0, 6).map((citation) => {
    const row = citation as Record<string, unknown>;
    const quote = normalizeAssistantQuestion(row.quote, 320);
    const heading = normalizeAssistantQuestion(row.heading, 160);
    const source = sources.find((item) =>
      item.heading === heading &&
      (row.pageStart == null || Number(row.pageStart) === item.pageStart) &&
      (row.pageEnd == null || Number(row.pageEnd) === item.pageEnd),
    );
    if (!source || !quote || !source.text.includes(quote)) {
      throw new Error("The AI answer contained an unsupported source citation.");
    }
    return {
      heading,
      pageStart: source.pageStart,
      pageEnd: source.pageEnd,
      quote,
    };
  });
  const actions = (Array.isArray(payload.actions) ? payload.actions : [])
    .slice(0, 4)
    .map((action) => action as Record<string, unknown>)
    .filter((action) => allowedActionHrefs.has(String(action.href)))
    .map((action) => ({
      label: normalizeAssistantQuestion(action.label, 80),
      href: String(action.href),
    }))
    .filter((action) => action.label);
  const answer = normalizeAssistantQuestion(payload.answer, 4000);
  if (!answer) throw new Error("The AI answer was empty.");
  return {
    title: normalizeAssistantQuestion(payload.title, 140) || "NounCompass guidance",
    answer,
    bullets: (Array.isArray(payload.bullets) ? payload.bullets : [])
      .slice(0, 8)
      .map((item) => normalizeAssistantQuestion(item, 500))
      .filter(Boolean),
    citations: parsedCitations,
    warnings: (Array.isArray(payload.warnings) ? payload.warnings : [])
      .slice(0, 5)
      .map((item) => normalizeAssistantQuestion(item, 500))
      .filter(Boolean),
    actions,
  };
}

export function topicAccuracyFromQuestions(
  questions: Array<{ id: string; topic?: string; correctLabel?: string }>,
  responses: Record<string, string>,
) {
  const totals = new Map<string, { correct: number; total: number }>();
  for (const question of questions) {
    const topic = normalizeAssistantQuestion(question.topic || "General", 120) || "General";
    const current = totals.get(topic) ?? { correct: 0, total: 0 };
    current.total += 1;
    if (responses[question.id] && responses[question.id] === question.correctLabel) current.correct += 1;
    totals.set(topic, current);
  }
  return [...totals.entries()]
    .map(([topic, value]) => ({ topic, ...value, accuracy: value.total ? Math.round((value.correct / value.total) * 100) : 0 }))
    .sort((left, right) => left.accuracy - right.accuracy || right.total - left.total);
}
