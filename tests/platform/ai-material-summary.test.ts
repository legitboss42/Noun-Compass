import assert from "node:assert/strict";
import test from "node:test";
import {
  EXCERPT_SEPARATOR,
  findFirstBodyChunk,
  isFrontMatter,
  selectSummaryExcerpt,
  type SummarySourceChunk,
} from "../../lib/platform/ai-material-summary-core";

function contentsChunk(): SummarySourceChunk {
  const lines = [
    "CONTENTS",
    "Module 1 Introduction to the Open and Distance Learning System 9",
    "Unit 1 History of the Open and Distance Learning System 9",
    "Unit 2 Characteristics of the Open and Distance Learning System 18",
    "Unit 3 Teaching and Learning in the Open and Distance System 27",
    "Module 2 Study Skills for the Distance Learner 36",
    "Unit 1 Listening 36",
    "Unit 2 Speaking 45",
  ];
  return { heading: "Unit 1 History", pageStart: 8, pageEnd: 8, text: lines.join("\n") };
}

function bodyChunk(index: number): SummarySourceChunk {
  return {
    heading: `Unit ${index} Teaching`,
    pageStart: index * 2,
    pageEnd: index * 2 + 1,
    text: `[Page ${index * 2}]\nOpen and distance learning separates the teacher from the learner in place or time. `
      + `Section ${index} explains how study strategies support that separation in practice. `.repeat(12),
  };
}

test("a contents listing is recognised as front matter and prose is not", () => {
  assert.equal(isFrontMatter(contentsChunk()), true);
  assert.equal(isFrontMatter(bodyChunk(4)), false);
});

test("leading front matter is skipped but never more than a quarter of the material", () => {
  const withContents = [contentsChunk(), ...Array.from({ length: 20 }, (_, i) => bodyChunk(i + 1))];
  assert.equal(findFirstBodyChunk(withContents), 1);

  // Every chunk looking list-shaped must not consume the whole material.
  const allContents = Array.from({ length: 20 }, () => contentsChunk());
  assert.equal(findFirstBodyChunk(allContents), 5);
});

test("the excerpt samples across the whole material instead of its opening", () => {
  const chunks = [contentsChunk(), ...Array.from({ length: 60 }, (_, i) => bodyChunk(i + 1))];
  const excerpt = selectSummaryExcerpt(chunks, 10_000);
  const sections = excerpt.split(EXCERPT_SEPARATOR);

  assert.equal(sections.length, 6);
  assert.ok(excerpt.length <= 10_000, `excerpt was ${excerpt.length} characters`);
  // The contents page must not survive into the prompt.
  assert.equal(excerpt.includes("CONTENTS"), false);
  // Page markers help ground practice questions but only cost tokens here.
  assert.equal(/\[Page \d+\]/.test(excerpt), false);
  // The last section must come from the end of the material, not near the start.
  assert.ok(sections[0].startsWith("Unit 1 Teaching"), sections[0].slice(0, 40));
  assert.ok(sections[5].startsWith("Unit 60 Teaching"), sections[5].slice(0, 40));
});

test("short materials still produce an excerpt", () => {
  const excerpt = selectSummaryExcerpt([bodyChunk(1), bodyChunk(2)], 10_000);
  assert.equal(excerpt.split(EXCERPT_SEPARATOR).length, 2);
  assert.equal(selectSummaryExcerpt([], 10_000), "");
});
