import assert from "node:assert/strict";
import test from "node:test";
import { parseQuestionCsv } from "../../lib/platform/question-import";

const header = "course_code,topic,learning_objective,difficulty,sample,source_unit,source_page,prompt,option_a,option_b,option_c,option_d,correct_label,explanation";

test("parses a valid question import row", () => {
  const result = parseQuestionCsv(`${header}\nGST101,Reading,Infer meaning from context,2,true,Unit 1,12,Which clue best explains the word?,The heading,The surrounding sentence,The page number,The font size,B,The surrounding sentence supplies context that helps the reader infer meaning.`);
  assert.equal(result.errors.length, 0);
  assert.equal(result.rows[0].courseCode, "GST101");
  assert.equal(result.rows[0].sample, true);
  assert.equal(result.rows[0].correctLabel, "B");
});

test("rejects incomplete and duplicate questions", () => {
  const row = "GST101,Reading,Infer meaning from context,4,maybe,Unit 1,,Short,A,B,C,D,Z,Too short";
  const result = parseQuestionCsv(`${header}\n${row}\n${row}`);
  assert.ok(result.errors.some((error) => error.includes("difficulty")));
  assert.ok(result.errors.some((error) => error.includes("sample")));
  assert.ok(result.errors.some((error) => error.includes("duplicate prompt")));
});

