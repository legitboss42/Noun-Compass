import assert from "node:assert/strict";
import test from "node:test";
import {
  listAiPracticeMaterials,
  listAiPracticeMaterialsForCourseCodes,
  materialKeyForIndex,
  maxAiPracticeQuestionsForMaterial,
} from "../../lib/platform/ai-practice-materials";

test("AI practice exposes official course-material choices with stable keys", () => {
  const materials = listAiPracticeMaterials(5);
  assert.equal(materials.length, 5);
  assert.match(materials[0].key, /^[A-Z]{2,4}\d{3}:0$/);
  assert.equal(materialKeyForIndex(0), materials[0].key);
});

test("AI practice material options keep course identity visible", () => {
  const [first] = listAiPracticeMaterials(1);
  assert.ok(first.code);
  assert.ok(first.title);
});

test("AI practice can filter materials to registered dashboard courses", () => {
  const materials = listAiPracticeMaterialsForCourseCodes(["ACC101"]);
  assert.ok(materials.length >= 1);
  assert.equal(materials.every((material) => material.code === "ACC101"), true);
});

test("AI practice question limits follow membership and course units", () => {
  assert.equal(maxAiPracticeQuestionsForMaterial({ creditUnits: "2" }, false), 15);
  assert.equal(maxAiPracticeQuestionsForMaterial({ creditUnits: "2" }, true), 70);
  assert.equal(maxAiPracticeQuestionsForMaterial({ creditUnits: "3" }, true), 100);
});
