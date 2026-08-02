export type ExtractedPdfPage = {
  pageNumber: number;
  text: string;
};

export type MaterialTextChunk = {
  chunkIndex: number;
  heading: string;
  pageStart: number;
  pageEnd: number;
  charCount: number;
  text: string;
};

export type CoverageSegment = {
  chunkIndex: number;
  targetCount: number;
  heading: string;
  pageStart: number;
  pageEnd: number;
};

export type CoverageBatchPlan = {
  batchIndex: number;
  targetCount: number;
  segments: CoverageSegment[];
};

export type GroundedQuestionDraft = {
  topic: string;
  prompt: string;
  options: Array<{ label: "A" | "B" | "C" | "D"; text: string }>;
  correctLabel: "A" | "B" | "C" | "D";
  explanation: string;
  sourceChunkIndex: number;
  sourceEvidence: string;
};

const MAX_CHUNK_CHARACTERS = 6_000;
const FALLBACK_PAGE_WINDOW = 6;
export const MAX_QUESTIONS_PER_BATCH = 3;
const MAX_SOURCE_CHARACTERS_PER_BATCH = 8_000;

function cleanText(value: unknown, max = 10_000) {
  return String(value ?? "").replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, max);
}

function comparableText(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectUnitHeading(text: string) {
  const lines = text.split(/\n/).map((line) => line.trim()).filter(Boolean).slice(0, 24);
  const unit = lines.find((line) => /^(?:study\s+)?unit\s+\d+[a-z]?(?:\s*[:.-]\s*|\s+)/i.test(line));
  if (unit) return cleanText(unit, 140);
  const moduleHeading = lines.find((line) => /^module\s+\d+[a-z]?(?:\s*[:.-]\s*|\s+)/i.test(line));
  return moduleHeading ? cleanText(moduleHeading, 140) : "";
}

export function buildMaterialChunks(
  pages: ExtractedPdfPage[],
  maxChunkCharacters = MAX_CHUNK_CHARACTERS,
): MaterialTextChunk[] {
  const usable = pages
    .map((page) => ({ pageNumber: Math.max(1, Math.floor(page.pageNumber)), text: cleanText(page.text) }))
    .filter((page) => page.text.length >= 40)
    .sort((left, right) => left.pageNumber - right.pageNumber);
  if (!usable.length) return [];

  const chunks: MaterialTextChunk[] = [];
  let currentPages: ExtractedPdfPage[] = [];
  let currentHeading = "";

  const flush = () => {
    if (!currentPages.length) return;
    const pageStart = currentPages[0].pageNumber;
    const pageEnd = currentPages[currentPages.length - 1].pageNumber;
    const text = currentPages.map((page) => `[Page ${page.pageNumber}]\n${page.text}`).join("\n\n");
    chunks.push({
      chunkIndex: chunks.length,
      heading: currentHeading || `Pages ${pageStart}-${pageEnd}`,
      pageStart,
      pageEnd,
      charCount: text.length,
      text,
    });
    currentPages = [];
  };

  for (const page of usable) {
    const detectedHeading = detectUnitHeading(page.text);
    const currentLength = currentPages.reduce((sum, item) => sum + item.text.length, 0);
    const headingChanged = Boolean(detectedHeading && currentHeading && comparableText(detectedHeading) !== comparableText(currentHeading));
    const exceedsSize = currentPages.length > 0 && currentLength + page.text.length > maxChunkCharacters;
    const reachesFallbackWindow = currentPages.length >= FALLBACK_PAGE_WINDOW;
    if (headingChanged || exceedsSize || reachesFallbackWindow) flush();
    if (detectedHeading) currentHeading = detectedHeading;
    currentPages.push(page);
  }
  flush();
  return chunks;
}

function evenlySelectChunks(chunks: MaterialTextChunk[], count: number) {
  if (count >= chunks.length) return chunks;
  if (count <= 1) return [chunks[Math.floor((chunks.length - 1) / 2)]];
  const selected = new Map<number, MaterialTextChunk>();
  for (let index = 0; index < count; index += 1) {
    const position = Math.round((index * (chunks.length - 1)) / (count - 1));
    selected.set(chunks[position].chunkIndex, chunks[position]);
  }
  return [...selected.values()];
}

export function buildCoverageBatches(
  chunks: MaterialTextChunk[],
  totalQuestions: number,
  maxQuestionsPerBatch = MAX_QUESTIONS_PER_BATCH,
): CoverageBatchPlan[] {
  const requested = Math.max(1, Math.min(100, Math.floor(totalQuestions)));
  const source = chunks.filter((chunk) => chunk.text.trim().length >= 100);
  if (!source.length) throw new Error("No readable material chunks are available.");
  // Spread coverage across the material without sending one full source chunk
  // per question. Two questions per selected chunk keeps requests small enough
  // for free-tier providers while still sampling the beginning, middle and end.
  const coverageChunkCount = Math.min(
    source.length,
    requested,
    Math.max(requested > 1 ? 2 : 1, Math.ceil(requested / 2)),
  );
  const selected = evenlySelectChunks(source, coverageChunkCount);
  const allocations = new Map(selected.map((chunk) => [chunk.chunkIndex, 1]));
  let remaining = requested - selected.length;
  while (remaining > 0) {
    const next = [...selected].sort((left, right) => {
      const leftCount = allocations.get(left.chunkIndex) ?? 1;
      const rightCount = allocations.get(right.chunkIndex) ?? 1;
      return (right.charCount / rightCount) - (left.charCount / leftCount) || left.chunkIndex - right.chunkIndex;
    })[0];
    allocations.set(next.chunkIndex, (allocations.get(next.chunkIndex) ?? 1) + 1);
    remaining -= 1;
  }

  const work = selected.map((chunk) => ({ chunk, remaining: allocations.get(chunk.chunkIndex) ?? 1 }));
  const batches: CoverageBatchPlan[] = [];
  let cursor = 0;
  while (work.some((item) => item.remaining > 0)) {
    const segments: CoverageSegment[] = [];
    let batchQuestions = 0;
    let sourceCharacters = 0;
    let guard = 0;
    while (batchQuestions < maxQuestionsPerBatch && work.some((item) => item.remaining > 0) && guard < work.length * 3) {
      const item = work[cursor % work.length];
      cursor += 1;
      guard += 1;
      if (item.remaining <= 0) continue;
      const existing = segments.find((segment) => segment.chunkIndex === item.chunk.chunkIndex);
      const addsSource = existing ? 0 : item.chunk.charCount;
      if (segments.length && sourceCharacters + addsSource > MAX_SOURCE_CHARACTERS_PER_BATCH) continue;
      if (existing) existing.targetCount += 1;
      else {
        segments.push({
          chunkIndex: item.chunk.chunkIndex,
          targetCount: 1,
          heading: item.chunk.heading,
          pageStart: item.chunk.pageStart,
          pageEnd: item.chunk.pageEnd,
        });
        sourceCharacters += item.chunk.charCount;
      }
      item.remaining -= 1;
      batchQuestions += 1;
      guard = 0;
    }
    if (!segments.length) throw new Error("Material chunks could not be assigned to a safe generation batch.");
    batches.push({ batchIndex: batches.length, targetCount: batchQuestions, segments });
  }
  return batches;
}

function wordSet(value: string) {
  return new Set(comparableText(value).split(" ").filter((word) => word.length > 2));
}

export function questionSimilarity(left: string, right: string) {
  const leftWords = wordSet(left);
  const rightWords = wordSet(right);
  if (!leftWords.size || !rightWords.size) return 0;
  let intersection = 0;
  for (const word of leftWords) if (rightWords.has(word)) intersection += 1;
  return intersection / (leftWords.size + rightWords.size - intersection);
}

export function parseGroundedQuestionBatch(input: {
  content: string;
  expectedCount: number;
  segments: CoverageSegment[];
  chunks: MaterialTextChunk[];
  existingPrompts?: string[];
}) {
  const unfenced = input.content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const arrayStart = unfenced.indexOf("[");
  const arrayEnd = unfenced.lastIndexOf("]");
  const decoded = JSON.parse(arrayStart >= 0 && arrayEnd > arrayStart ? unfenced.slice(arrayStart, arrayEnd + 1) : unfenced) as unknown;
  const parsed = Array.isArray(decoded)
    ? decoded
    : decoded && typeof decoded === "object" && Array.isArray((decoded as { questions?: unknown }).questions)
      ? (decoded as { questions: unknown[] }).questions
      : decoded;
  if (!Array.isArray(parsed) || parsed.length !== input.expectedCount) {
    throw new Error(`AI response must contain exactly ${input.expectedCount} questions.`);
  }
  const segmentCounts = new Map(input.segments.map((segment) => [segment.chunkIndex, 0]));
  const chunks = new Map(input.chunks.map((chunk) => [chunk.chunkIndex, chunk]));
  const acceptedPrompts = [...(input.existingPrompts ?? [])];

  const questions = parsed.map((item) => {
    const record = item as Record<string, unknown>;
    const sourceChunkIndex = Number(record.source_chunk_index);
    const chunk = chunks.get(sourceChunkIndex);
    if (!chunk || !segmentCounts.has(sourceChunkIndex)) throw new Error("AI response referenced an unassigned material chunk.");
    const sourceEvidence = cleanText(record.source_evidence, 320);
    const normalizedEvidence = comparableText(sourceEvidence);
    if (normalizedEvidence.length < 24 || !comparableText(chunk.text).includes(normalizedEvidence)) {
      throw new Error("AI response included evidence that could not be verified in the assigned source pages.");
    }
    const prompt = cleanText(record.prompt, 500);
    const explanation = cleanText(record.explanation, 700);
    const correctLabel = cleanText(record.correct_label, 1).toUpperCase();
    if (prompt.length < 12 || explanation.length < 12 || !["A", "B", "C", "D"].includes(correctLabel)) {
      throw new Error("AI response included an incomplete question or answer key.");
    }
    const optionValues = [record.option_a, record.option_b, record.option_c, record.option_d].map((value) => cleanText(value, 300));
    if (optionValues.some((value) => !value) || new Set(optionValues.map(comparableText)).size !== 4) {
      throw new Error("AI response included empty or duplicated answer options.");
    }
    if (acceptedPrompts.some((existing) => comparableText(existing) === comparableText(prompt) || questionSimilarity(existing, prompt) >= 0.82)) {
      throw new Error("AI response included a duplicate or near-duplicate question.");
    }
    acceptedPrompts.push(prompt);
    segmentCounts.set(sourceChunkIndex, (segmentCounts.get(sourceChunkIndex) ?? 0) + 1);
    return {
      topic: cleanText(record.topic, 160) || chunk.heading,
      prompt,
      options: [
        { label: "A" as const, text: optionValues[0] },
        { label: "B" as const, text: optionValues[1] },
        { label: "C" as const, text: optionValues[2] },
        { label: "D" as const, text: optionValues[3] },
      ],
      correctLabel: correctLabel as "A" | "B" | "C" | "D",
      explanation,
      sourceChunkIndex,
      sourceEvidence,
    } satisfies GroundedQuestionDraft;
  });

  for (const segment of input.segments) {
    if ((segmentCounts.get(segment.chunkIndex) ?? 0) !== segment.targetCount) {
      throw new Error("AI response did not follow the required course-material coverage allocation.");
    }
  }
  return questions;
}

export function validateFinalCoverage(input: {
  questions: Array<{ prompt: string; sourceChunkIndex: number }>;
  batches: CoverageBatchPlan[];
  expectedTotal: number;
}) {
  if (input.questions.length !== input.expectedTotal) throw new Error("The final question count is incomplete.");
  const expected = new Map<number, number>();
  for (const batch of input.batches) {
    for (const segment of batch.segments) expected.set(segment.chunkIndex, (expected.get(segment.chunkIndex) ?? 0) + segment.targetCount);
  }
  const actual = new Map<number, number>();
  for (const question of input.questions) {
    actual.set(question.sourceChunkIndex, (actual.get(question.sourceChunkIndex) ?? 0) + 1);
  }
  for (const [chunkIndex, count] of expected) {
    if ((actual.get(chunkIndex) ?? 0) !== count) throw new Error("The final exam does not satisfy its material coverage plan.");
  }
  for (let left = 0; left < input.questions.length; left += 1) {
    for (let right = left + 1; right < input.questions.length; right += 1) {
      if (questionSimilarity(input.questions[left].prompt, input.questions[right].prompt) >= 0.82) {
        throw new Error("The final exam contains near-duplicate questions.");
      }
    }
  }
}
