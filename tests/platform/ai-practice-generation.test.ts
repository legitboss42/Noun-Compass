import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCoverageBatches,
  buildMaterialChunks,
  parseGroundedQuestionBatch,
  questionSimilarity,
  validateFinalCoverage,
  type MaterialTextChunk,
} from "../../lib/platform/ai-practice-generation-core";

function makeChunks(count: number): MaterialTextChunk[] {
  return Array.from({ length: count }, (_, index) => ({
    chunkIndex: index,
    heading: `Unit ${index + 1}`,
    pageStart: index * 3 + 1,
    pageEnd: index * 3 + 3,
    charCount: 900,
    text: `Unit ${index + 1} explains the verified concept number ${index + 1}. The learner should understand this exact supporting statement for assessment.`,
  }));
}

test("page-aware chunking preserves the beginning and end of a material", () => {
  const chunks = buildMaterialChunks([
    { pageNumber: 1, text: "UNIT 1: Foundations\n" + "Opening material. ".repeat(100) },
    { pageNumber: 2, text: "Foundation details. ".repeat(100) },
    { pageNumber: 3, text: "UNIT 2: Applications\n" + "Applied material. ".repeat(100) },
    { pageNumber: 4, text: "Final course material. ".repeat(100) },
  ], 4_000);
  assert.equal(chunks[0].pageStart, 1);
  assert.equal(chunks.at(-1)?.pageEnd, 4);
  assert.ok(chunks.some((chunk) => /unit 2/i.test(chunk.heading)));
  assert.match(chunks.map((chunk) => chunk.text).join(" "), /Final course material/);
});

test("coverage allocation reaches the full material and preserves the exact question total", () => {
  const chunks = makeChunks(30);
  const batches = buildCoverageBatches(chunks, 15);
  const segments = batches.flatMap((batch) => batch.segments);
  assert.equal(batches.reduce((sum, batch) => sum + batch.targetCount, 0), 15);
  assert.ok(batches.every((batch) => batch.targetCount <= 3));
  const coveredChunks = new Set(segments.map((segment) => segment.chunkIndex));
  assert.ok(coveredChunks.has(0));
  assert.ok(coveredChunks.has(29));
});

test("premium-sized coverage is split into resumable batches", () => {
  const batches = buildCoverageBatches(makeChunks(20), 100);
  assert.equal(batches.reduce((sum, batch) => sum + batch.targetCount, 0), 100);
  assert.ok(batches.length > 1);
  assert.ok(batches.every((batch) => batch.targetCount >= 1 && batch.targetCount <= 3));
});

test("grounded question validation accepts exact source evidence and allocation", () => {
  const [chunk] = makeChunks(1);
  const content = JSON.stringify([{
    source_chunk_index: 0,
    source_evidence: "The learner should understand this exact supporting statement",
    topic: "Foundations",
    prompt: "Which statement best describes the verified course concept?",
    option_a: "The verified concept number 1",
    option_b: "An unrelated concept",
    option_c: "A missing course section",
    option_d: "An unsupported conclusion",
    correct_label: "A",
    explanation: "The supplied pages explicitly identify verified concept number 1.",
  }]);
  const questions = parseGroundedQuestionBatch({
    content,
    expectedCount: 1,
    segments: [{ chunkIndex: 0, targetCount: 1, heading: chunk.heading, pageStart: 1, pageEnd: 3 }],
    chunks: [chunk],
  });
  assert.equal(questions.length, 1);
  assert.equal(questions[0].sourceChunkIndex, 0);
});

test("grounded question validation accepts a JSON object envelope", () => {
  const [chunk] = makeChunks(1);
  const content = JSON.stringify({ questions: [{
    source_chunk_index: 0,
    source_evidence: "The learner should understand this exact supporting statement",
    topic: "Foundations",
    prompt: "Which option identifies the supported concept in this unit?",
    option_a: "The verified concept number 1",
    option_b: "An unrelated concept",
    option_c: "A missing course section",
    option_d: "An unsupported conclusion",
    correct_label: "A",
    explanation: "The assigned source explicitly identifies verified concept number 1.",
  }] });
  assert.equal(parseGroundedQuestionBatch({
    content,
    expectedCount: 1,
    segments: [{ chunkIndex: 0, targetCount: 1, heading: chunk.heading, pageStart: 1, pageEnd: 3 }],
    chunks: [chunk],
  }).length, 1);
});

test("grounding and duplicate checks reject unsupported or repeated questions", () => {
  const [chunk] = makeChunks(1);
  const base = {
    source_chunk_index: 0,
    source_evidence: "This quote does not exist in the material at all",
    topic: "Foundations",
    prompt: "Which statement best describes the verified course concept?",
    option_a: "First answer",
    option_b: "Second answer",
    option_c: "Third answer",
    option_d: "Fourth answer",
    correct_label: "A",
    explanation: "This explanation is sufficiently complete for validation.",
  };
  assert.throws(() => parseGroundedQuestionBatch({
    content: JSON.stringify([base]),
    expectedCount: 1,
    segments: [{ chunkIndex: 0, targetCount: 1, heading: chunk.heading, pageStart: 1, pageEnd: 3 }],
    chunks: [chunk],
  }), /evidence/i);
  assert.ok(questionSimilarity("Which method supports effective course revision?", "Which method supports effective revision of a course?") >= 0.82);
});

test("final coverage rejects missing chunks or near-duplicate prompts", () => {
  const batches = buildCoverageBatches(makeChunks(2), 2);
  assert.throws(() => validateFinalCoverage({
    questions: [
      { prompt: "What is the first verified concept in this material?", sourceChunkIndex: 0 },
      { prompt: "What is the first verified concept in the course material?", sourceChunkIndex: 0 },
    ],
    batches,
    expectedTotal: 2,
  }), /coverage|duplicate/i);
});
