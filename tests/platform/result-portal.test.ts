import assert from "node:assert/strict";
import test from "node:test";
import {
  isValidMatriculationNumber,
  normalizeMatriculationNumber,
  OFFICIAL_NOUN_RESULT_PORTAL,
} from "../../lib/platform/result-portal";

test("result portal input is normalized without retaining unrelated characters", () => {
  assert.equal(normalizeMatriculationNumber(" nou-1234 56789 "), "NOU-123456789");
  assert.equal(normalizeMatriculationNumber(null), "");
});

test("result portal accepts realistic identifiers and uses an official NOUN destination", () => {
  assert.equal(isValidMatriculationNumber("NOU123456789"), true);
  assert.equal(isValidMatriculationNumber("NOU"), false);
  assert.equal(new URL(OFFICIAL_NOUN_RESULT_PORTAL).hostname, "database.nou.edu.ng");
});
