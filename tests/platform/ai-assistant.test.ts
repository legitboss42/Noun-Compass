import assert from "node:assert/strict";
import test from "node:test";
import {
  assistantCacheKey,
  parseAssistantAnswer,
  rankGroundingChunks,
  redactSensitiveText,
  topicAccuracyFromQuestions,
} from "../../lib/platform/ai-assistant-core";

test("assistant redacts common student identifiers before provider use", () => {
  const redacted = redactSensitiveText("NOU241604015 webgrowth44@gmail.com 08012345678 5399832456789012");
  assert.equal(redacted.includes("NOU241604015"), false);
  assert.equal(redacted.includes("webgrowth44@gmail.com"), false);
  assert.equal(redacted.includes("08012345678"), false);
  assert.equal(redacted.includes("5399832456789012"), false);
});

test("course retrieval prefers chunks matching the question", () => {
  const chunks = [
    { heading: "Unit 1", text: "Introduction and learning objectives" },
    { heading: "Unit 7 recursion", text: "Recursion uses a base case and recursive step." },
    { heading: "Unit 8", text: "Sorting and searching" },
  ];
  const ranked = rankGroundingChunks("How does a recursion base case work?", chunks, 1);
  assert.equal(ranked[0].heading, "Unit 7 recursion");
});

test("assistant accepts exact grounded citations and safe internal actions", () => {
  const source = { heading: "Unit 7", pageStart: 20, pageEnd: 23, text: "A base case stops recursive calls." };
  const result = parseAssistantAnswer(JSON.stringify({
    title: "Recursion",
    answer: "A base case provides the stopping condition.",
    bullets: ["Check the stopping condition first."],
    citations: [{ heading: "Unit 7", pageStart: 20, pageEnd: 23, quote: "A base case stops recursive calls." }],
    warnings: [],
    actions: [{ label: "Practice", href: "/dashboard/ai-practice" }, { label: "Unsafe", href: "https://example.com" }],
  }), [source]);
  assert.equal(result.citations.length, 1);
  assert.deepEqual(result.actions, [{ label: "Practice", href: "/dashboard/ai-practice" }]);
});

test("assistant rejects fabricated citations", () => {
  assert.throws(() => parseAssistantAnswer(JSON.stringify({
    title: "Unsupported",
    answer: "Invented answer",
    bullets: [],
    citations: [{ heading: "Unit 1", quote: "This quote does not exist." }],
    warnings: [],
    actions: [],
  }), [{ heading: "Unit 1", text: "Verified source sentence." }]));
});

test("topic accuracy uses saved answers without AI inference", () => {
  const rows = topicAccuracyFromQuestions([
    { id: "1", topic: "Algebra", correctLabel: "A" },
    { id: "2", topic: "Algebra", correctLabel: "B" },
    { id: "3", topic: "Calculus", correctLabel: "C" },
  ], { "1": "A", "2": "D", "3": "C" });
  assert.deepEqual(rows.find((row) => row.topic === "Algebra"), { topic: "Algebra", correct: 1, total: 2, accuracy: 50 });
});

test("cache keys are stable but user scoped", () => {
  assert.equal(assistantCacheKey(["course", "user-a", "question"]), assistantCacheKey(["course", "user-a", "question"]));
  assert.notEqual(assistantCacheKey(["course", "user-a", "question"]), assistantCacheKey(["course", "user-b", "question"]));
});
