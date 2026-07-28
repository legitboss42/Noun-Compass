import assert from "node:assert/strict";
import test from "node:test";
import {
  aiQuestionDraftsConfigured,
  normalizeQuestionCount,
  stripAiCsvFences,
  validateAiQuestionDraftCsv,
} from "../../lib/platform/ai-question-drafts-core";

test("AI question drafting stays disabled until every required env var is present", () => {
  assert.equal(aiQuestionDraftsConfigured({}), false);
  assert.equal(aiQuestionDraftsConfigured({
    AI_QUESTION_DRAFTS_ENABLED: "true",
    AI_PROVIDER: "openrouter",
    OPENROUTER_API_KEY: "key",
    OPENROUTER_MODEL: "model",
  }), true);
});

test("question count is bounded for provider cost and review quality", () => {
  assert.equal(normalizeQuestionCount("0"), 1);
  assert.equal(normalizeQuestionCount("12"), 12);
  assert.equal(normalizeQuestionCount("999"), 25);
  assert.equal(normalizeQuestionCount("invalid"), 10);
});

test("generated CSV is stripped and validated before use", () => {
  const csv = stripAiCsvFences(`\`\`\`csv
course_code,topic,learning_objective,difficulty,sample,source_unit,source_page,prompt,option_a,option_b,option_c,option_d,correct_label,explanation
GST101,Study skills,Identify effective reading habits,1,true,Unit 1,4,Which habit best supports effective study planning?,Reading without goals,Setting clear study targets,Skipping revision,Only studying at night,B,Setting clear study targets helps students plan and monitor progress.
\`\`\``);
  const result = validateAiQuestionDraftCsv(csv);
  assert.deepEqual(result.errors, []);
  assert.equal(result.rows.length, 1);
});
