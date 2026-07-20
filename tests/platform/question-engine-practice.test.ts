import assert from "node:assert/strict";
import test from "node:test";
import { selectBalancedQuestionSet, shuffledOptions } from "../../lib/platform/practice";
import { localPilotEnabled } from "../../lib/platform/local-pilot";

test("balanced mocks avoid duplicate concepts and rotate modules", () => {
  const questions = [
    { id: 1, module_label: "Module 1", concept_key: "listening" },
    { id: 2, module_label: "Module 1", concept_key: "listening" },
    { id: 3, module_label: "Module 2", concept_key: "reading" },
    { id: 4, module_label: "Module 3", concept_key: "vocabulary" },
  ];
  const selected = selectBalancedQuestionSet(questions, 3, () => 0.5);
  assert.equal(selected.length, 3);
  assert.equal(new Set(selected.map((item) => item.concept_key)).size, 3);
  assert.equal(new Set(selected.map((item) => item.module_label)).size, 3);
});

test("option shuffling preserves every option", () => {
  const options = ["A", "B", "C", "D"];
  assert.deepEqual([...shuffledOptions(options, () => 0)].sort(), options);
});

test("local pilot refuses production and remote origins", () => {
  assert.throws(() => localPilotEnabled({ LOCAL_PILOT: "true", NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://nouncompass.me", LOCAL_DATABASE_URL: "postgresql://localhost/db" } as NodeJS.ProcessEnv));
  assert.throws(() => localPilotEnabled({ LOCAL_PILOT: "true", NODE_ENV: "development", NEXT_PUBLIC_SITE_URL: "https://nouncompass.me", LOCAL_DATABASE_URL: "postgresql://localhost/db" } as NodeJS.ProcessEnv));
});
