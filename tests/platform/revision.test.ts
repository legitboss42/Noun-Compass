import assert from "node:assert/strict";
import test from "node:test";
import { nextRevisionState } from "../../lib/platform/revision";

test("incorrect answers reset to box one", () => {
  const state = nextRevisionState(5, false, new Date("2026-07-19T00:00:00Z"));
  assert.equal(state.box, 1);
  assert.equal(state.intervalDays, 1);
});

test("correct answers advance and cap at box five", () => {
  assert.deepEqual(nextRevisionState(1, true, new Date("2026-07-19T00:00:00Z")).box, 2);
  assert.deepEqual(nextRevisionState(5, true, new Date("2026-07-19T00:00:00Z")).box, 5);
});
